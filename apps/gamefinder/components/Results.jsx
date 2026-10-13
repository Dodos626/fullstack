'use client';

import Image from 'next/image';
import styles from './GameFinder.module.css';

const price = (cents) => {
    if (cents === null || cents === undefined) return 'Price unavailable';
    return cents === 0 ? 'Free' : `$${(cents / 100).toFixed(2)}`;
};

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
