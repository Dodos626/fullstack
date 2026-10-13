'use client';

import Image from 'next/image';
import styles from './GameFinder.module.css';

const price = (cents) => {
    if (cents === null || cents === undefined) return 'Price unavailable';
    return cents === 0 ? 'Free' : `$${(cents / 100).toFixed(2)}`;
};

export default function GameCard({ game, onVote, disabled }) {
    const badges = [
        ...game.genres.map((label, index) => ({ key: `genre-${index}-${label}`, label })),
        ...game.tags.slice(0, 5).map((label, index) => ({ key: `tag-${index}-${label}`, label })),
    ];

    return (
        <article className={styles.gameCard}>
            {game.image ? (
                <Image
                    className={styles.gameImage}
                    src={game.image}
                    alt=""
                    width={920}
                    height={430}
                    unoptimized
                    priority
                />
            ) : (
                <div className={styles.gameImagePlaceholder}>Steam artwork unavailable</div>
            )}
            <div className={styles.gameContent}>
                <div className={styles.gameMetaTop}>
                    <span>{price(game.priceFinalUsd)}</span>
                    <a href={game.steamUrl} target="_blank" rel="noreferrer">
                        View on Steam ↗
                    </a>
                </div>
                <h2>{game.name}</h2>
                <p>{game.description}</p>
                <div className={styles.tags}>
                    {badges.map(({ key, label }) => (
                        <span key={key}>{label.replaceAll('-', ' ')}</span>
                    ))}
                </div>
                <div className={styles.voteButtons}>
                    <button
                        className={styles.dislikeButton}
                        type="button"
                        disabled={disabled}
                        onClick={() => onVote('dislike')}
                    >
                        Dislike
                    </button>
                    <button
                        className={styles.maybeButton}
                        type="button"
                        disabled={disabled}
                        onClick={() => onVote('maybe')}
                    >
                        Maybe
                    </button>
                    <button
                        className={styles.likeButton}
                        type="button"
                        disabled={disabled}
                        onClick={() => onVote('like')}
                    >
                        Like
                    </button>
                </div>
            </div>
        </article>
    );
}
