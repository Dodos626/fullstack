'use client';

import Image from 'next/image';
import styles from './GameFinder.module.css';

const price = (cents) => {
    if (cents === null || cents === undefined) return 'Price unavailable';
    return cents === 0 ? 'Free' : `$${(cents / 100).toFixed(2)}`;
};

const titleCase = (value) =>
    value.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

const steamRating = (game) => {
    if (game.steamReviewsPercent == null || game.steamReviewsCount == null) {
        return 'Steam rating unavailable';
    }
    return `${game.steamReviewsLabel || 'Positive'} ${game.steamReviewsPercent}% (${game.steamReviewsCount.toLocaleString()})`;
};

const MATCH_GROUPS = [
    { key: 'genres', label: 'Genres' },
    { key: 'tags', label: 'Tags' },
    { key: 'platforms', label: 'Platforms' },
];

function FeatureStatistics({ title, items }) {
    if (!items?.length) return null;
    return (
        <div className={styles.statisticsGroup}>
            <h3>{title}</h3>
            <div className={styles.statisticsList}>
                {items.map((item) => (
                    <article key={`${item.type}-${item.value}`}>
                        <div>
                            <strong>{titleCase(item.value)}</strong>
                            <b>{item.fit}% fit</b>
                        </div>
                        <p>{item.explanation}</p>
                    </article>
                ))}
            </div>
        </div>
    );
}

export default function Results({ room, onContinue, onRestart, pending }) {
    const topResults = room.results.slice(0, 3);
    const winner = room.winnerId
        ? topResults.find((result) => result.game.id === room.winnerId)
        : topResults[0];

    return (
        <section className={styles.results}>
            <div className={styles.sectionHeading}>
                <span className={styles.kicker}>
                    {room.winnerId ? 'Unanimous choice' : 'Group ranking'}
                </span>
                <h2>{winner ? `Play ${winner.game.name}` : 'No eligible games found'}</h2>
                <p>
                    {room.winnerId
                        ? 'Every player hit Like. Stop scrolling and launch it.'
                        : 'The server ranked the games by consensus, conflicts, and preference fit.'}
                </p>
            </div>

            <div className={styles.resultList}>
                {topResults.map((result, index) => (
                    <article
                        className={`${styles.resultCard} ${index === 0 ? styles.resultCardWinner : ''}`}
                        key={result.game.id}
                    >
                        <span className={styles.rank}>#{index + 1}</span>
                        {result.game.image ? (
                            <Image
                                src={result.game.image}
                                alt=""
                                width={240}
                                height={112}
                                unoptimized
                            />
                        ) : (
                            <div className={styles.resultImagePlaceholder}>No artwork</div>
                        )}
                        <div>
                            <div className={styles.resultTitle}>
                                <h3>{result.game.name}</h3>
                                <strong>{result.compatibility}% fit</strong>
                            </div>
                            <span className={styles.resultHeadline}>
                                {result.explanation?.headline || 'Strong group fit'}
                            </span>
                            <span className={styles.steamRating}>{steamRating(result.game)}</span>
                            <p>{result.explanation?.comparison}</p>
                            {result.explanation?.strengths?.length ? (
                                <ul className={styles.resultReasons}>
                                    {result.explanation.strengths.map((reason) => (
                                        <li key={reason}>{reason}</li>
                                    ))}
                                </ul>
                            ) : null}
                            {result.explanation?.tradeoffs?.length ? (
                                <p className={styles.resultTradeoffs}>
                                    Tradeoffs: {result.explanation.tradeoffs.join(' ')}
                                </p>
                            ) : null}
                            <div className={styles.yourMatches}>
                                <h4>Your matching choices</h4>
                                {MATCH_GROUPS.some(
                                    (group) => result.yourMatches?.[group.key]?.length
                                ) ? (
                                    MATCH_GROUPS.map((group) =>
                                        result.yourMatches?.[group.key]?.length ? (
                                            <div key={group.key}>
                                                <span>{group.label}</span>
                                                <p>
                                                    {result.yourMatches[group.key]
                                                        .map(titleCase)
                                                        .join(', ')}
                                                </p>
                                            </div>
                                        ) : null
                                    )
                                ) : (
                                    <p>
                                        This game did not directly match one of your selected
                                        boosts.
                                    </p>
                                )}
                            </div>
                            <div className={styles.scoreBreakdown}>
                                <span>Votes {result.scoreBreakdown?.voteScore ?? 0}%</span>
                                <span>
                                    Weakest player {result.scoreBreakdown?.weakestPlayerVote ?? 0}%
                                </span>
                                <span>
                                    Preferences {result.scoreBreakdown?.preferenceScore ?? 0}%
                                </span>
                                <span>
                                    Steam confidence {result.scoreBreakdown?.qualityScore ?? 0}%
                                </span>
                            </div>
                            <span className={styles.resultVotes}>
                                {result.voteSummary.like} like · {result.voteSummary.maybe} maybe ·{' '}
                                {result.voteSummary.skipped || 0} neutral ·{' '}
                                {result.voteSummary.dislike} dislike ·{' '}
                                {price(result.game.priceFinalUsd)}
                            </span>
                        </div>
                        <a
                            className={styles.steamLink}
                            href={result.game.steamUrl}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Steam ↗
                        </a>
                    </article>
                ))}
            </div>

            {room.resultStatistics ? (
                <section className={styles.resultStatistics}>
                    <div className={styles.sectionHeading}>
                        <span className={styles.kicker}>Session statistics</span>
                        <h2>What worked for this group</h2>
                        <p>
                            These descriptive scores combine observed vote support with how many
                            players requested each feature. They do not alter the winner.
                        </p>
                    </div>
                    <div className={styles.statSummary}>
                        <span>{room.resultStatistics.gamesReviewed} games reviewed</span>
                        <span>{room.resultStatistics.gamesWithoutDislikes} without a Dislike</span>
                        <span>{room.resultStatistics.voteTotals.like} Likes</span>
                        <span>{room.resultStatistics.voteTotals.maybe} Maybes</span>
                        <span>{room.resultStatistics.voteTotals.skipped} neutral skips</span>
                        <span>{room.resultStatistics.voteTotals.dislike} Dislikes</span>
                    </div>
                    <div className={styles.statisticsGrid}>
                        <FeatureStatistics
                            title="Best-fitting genres"
                            items={room.resultStatistics.bestGenres}
                        />
                        <FeatureStatistics
                            title="Best-fitting tags"
                            items={room.resultStatistics.bestTags}
                        />
                    </div>
                </section>
            ) : null}

            {room.isAdmin ? (
                <div className={styles.actionRow}>
                    <button
                        className={styles.primaryButton}
                        type="button"
                        disabled={pending}
                        onClick={onContinue}
                    >
                        Fresh batch, same preferences
                    </button>
                    <button
                        className={styles.secondaryButton}
                        type="button"
                        disabled={pending}
                        onClick={onRestart}
                    >
                        Start over
                    </button>
                </div>
            ) : (
                <p className={styles.waitingText}>Waiting for the admin to continue or restart.</p>
            )}
        </section>
    );
}
