# Game Finder matching algorithm

This document explains at a high level how Game Finder selects the next game and ranks the final top
three. The implementation is deterministic where possible, uses only source-backed Steam metadata,
and keeps enough structure to explain its decisions.

## 1. Hard eligibility filters

A game is considered only when it is an enabled, released Steam title whose source `categories` array
contains the exact `Multi-player` value and that has not already appeared in the room. Tags, genres,
and other multiplayer-like category values do not satisfy this catalog filter. Every player's hard
requirements are then applied:

- excluded genres and tags
- required platforms
- optional price range
- optional minimum Steam positive-review percentage
- optional minimum Steam review count

Exploration never bypasses these filters.

## 2. Typed features

Game metadata is converted into typed genre and tag features such as `genre:action` and
`tag:survival`. Exact genre/tag duplicates are collapsed, and genre and tag channels receive fixed
total budgets. Platforms remain hard requirements rather than learned preferences. Steam categories
are used only when importing multiplayer-capable games and do not influence matching.

## 3. Information weights

`gamefinder_metrics` contains the number of games using every feature. Game Finder converts those
counts to capped inverse-document-frequency weights. Common features such as `tag:multiplayer` carry
less information than specific features such as `tag:social-deduction`. Genres receive a small
reliability bonus, followed by community tags and platforms.

## 4. Explicit questionnaire score

For each player, questionnaire compatibility is normalized to `[0,1]` from the weighted coverage of
selected genres and tags. Required platforms remain hard filters. A player with no selected soft
preferences starts at neutral `0.5` compatibility. Exclusions remain hard filters rather than score
penalties.

## 5. Per-player vote learning

The room maintains signed evidence and evidence strength for every player/feature pair. When voting
closes, that player's vote updates the normalized features of the voted game:

- Like: `+1.00`
- Maybe: `+0.10`, with only `0.35` evidence strength
- Dislike: `-1.00`
- Forced/neutral skip: `0`

Feature updates have a fixed total budget, so games with many tags do not teach the model more merely
because they contain more metadata. Affinity is `signedEvidence / (1.5 + evidence)`, keeping sparse
observations close to neutral. Every statistic also records the last round that updated it.

## 6. Per-player candidate prediction

Each player's predicted utility combines questionnaire compatibility with learned vote affinity. The
base learned contribution increases by `16.25%` for each non-neutral vote and caps at `65%`; it is then
multiplied by confidence in the candidate's own features. Unknown candidates therefore continue to
rely mostly on questionnaire answers.

## 7. Fair group aggregation

The system calculates the mean predicted utility, the weakest player's utility, and disagreement
between players. Group utility is:

```text
55% mean player utility
+ 30% weakest-player utility
- 15% disagreement
```

This avoids allowing a strong majority score to completely hide one player's poor match.

## 8. Review quality prior

Steam rating is adjusted with a Bayesian prior equivalent to 500 reviews at 70% positive. A 100%
rating from a handful of reviews therefore cannot dominate a well-established title. This quality
prior is intentionally small and acts primarily as a tie-breaker.

## 9. Exploration and diversity

Unknown feature areas receive an exploration bonus early in the queue. Uncertainty is calculated from
evidence for the candidate's own features and gated by questionnaire relevance, so unrelated unknown
games do not receive the largest bonus. The bonus decreases as the room approaches its configured
round limit. Similarity to the last three shown games produces a weighted-Jaccard diversity penalty,
using the maximum recent similarity to reduce repetitive recommendations.

The next-game score is `group utility + exploration bonus - diversity penalty`. Selection is fully
deterministic; Bayesian Steam quality, weakest-player utility, mean utility, and Steam app ID provide
stable tie-breaking. Internal decision snapshots record the algorithm version and score components.

## 10. Final ranking

Only games actually shown and voted on can reach the results page. Their final score combines:

```text
50% average vote consensus
+ 20% weakest individual vote
+ 20% questionnaire-only compatibility
+ 10% Bayesian Steam quality
```

For final scoring, Like is `1.00`, Maybe `0.55`, a neutral skip `0.50`, and Dislike `0.00`. Results
are first ordered by fewer Dislikes, then more Likes, then the combined score, and finally Steam app
ID. The weighted score is deliberately secondary to the conflict/Like ordering. Only the top three
are returned.

## 11. Fresh batches and resets

`Fresh batch, same preferences` preserves learned evidence and the complete exposure history, while
clearing only the current batch's votes and results. `Start over` clears preferences, evidence, vote
counts, diagnostics, and exposure history.

## 12. Explanations

Every result includes strengths, tradeoffs, the viewing player's matching questionnaire choices, and a
score breakdown. The first result is compared
directly with second place. The explanation states whether it won because of fewer Dislikes, more
Likes, a stronger weakest-player vote, stronger questionnaire compatibility, or the best remaining
combined score.

The results page also reports descriptive genre and tag statistics. Feature fit combines observed vote
support with the share of players who explicitly requested that feature. These statistics explain the
session and do not change the final ranking.

## 13. Privacy

Individual preferences and votes are never exposed to other players. The UI only receives aggregated
setting counts, aggregate vote totals after a round closes, and group-level result explanations.
