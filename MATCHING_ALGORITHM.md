# Game Finder matching algorithm

This document explains at a high level how Game Finder selects the next game and ranks the final top
three. The implementation is deterministic where possible, uses only source-backed Steam metadata,
and keeps enough structure to explain its decisions.

## 1. Hard eligibility filters

A game is considered only when it is an enabled, released Steam multiplayer title that has not already
appeared in the room. Every player's hard requirements are then applied:

- excluded genres, tags, and categories
- required platforms
- optional price range
- optional minimum Steam positive-review percentage
- optional minimum Steam review count

Exploration never bypasses these filters.

## 2. Typed features

Game metadata is converted into typed features such as `genre:action`, `tag:survival`, and
`category:online-co-op`. Keeping the type prevents unrelated values from collapsing into one signal.

## 3. Information weights

`gamefinder_metrics` contains the number of games using every feature. Game Finder converts those
counts to capped inverse-document-frequency weights. Common features such as `tag:multiplayer` carry
less information than specific features such as `tag:social-deduction`. Genres receive a small
reliability bonus, followed by Steam categories and community tags.

## 4. Explicit questionnaire score

For each player, a candidate receives points for matching selected genres, multiplayer categories,
tags, and platforms. Matches are multiplied by their information weights. Exclusions remain hard
filters rather than score penalties.

## 5. Per-player vote learning

The room maintains a separate affinity and evidence map for every player. When voting closes, that
player's vote updates the normalized features of the voted game:

- Like: `+1.00`
- Maybe: `+0.25`
- Dislike: `-1.25`
- Forced/neutral skip: `0`

Feature updates are normalized by the square root of the game's feature count, so games with many
tags do not teach the model more merely because they contain more metadata. Learned values are shrunk
toward zero until a feature has repeated evidence.

## 6. Per-player candidate prediction

Each player's predicted utility combines questionnaire compatibility with learned vote affinity. Early
rounds rely mostly on questionnaire answers. As completed rounds accumulate, learned affinities can
contribute up to 65% of the personal prediction.

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

Unknown feature areas receive an exploration bonus early in the queue. That bonus decreases as the
room approaches its configured round limit. Similarity to the last three shown games produces a
diversity penalty using typed-feature Jaccard overlap, reducing repetitive recommendations.

## 10. Final ranking

Only games actually shown and voted on can reach the results page. Their final score combines:

```text
50% average vote consensus
+ 20% weakest individual vote
+ 20% questionnaire compatibility
+ 10% Bayesian Steam quality
```

For final scoring, Like is `1.00`, Maybe `0.55`, a neutral skip `0.50`, and Dislike `0.00`. Results
are first ordered by fewer Dislikes, then more Likes, then the combined score. Only the top three are
returned.

## 11. Explanations

Every result includes strengths, tradeoffs, and a score breakdown. The first result is compared
directly with second place. The explanation states whether it won because of fewer Dislikes, more
Likes, a stronger weakest-player vote, stronger questionnaire compatibility, or the best remaining
combined score.

## 12. Privacy

Individual preferences and votes are never exposed to other players. The UI only receives aggregated
setting counts, aggregate vote totals after a round closes, and group-level result explanations.
