'use client';

import styles from './GameFinder.module.css';

const titleCase = (value) =>
    value.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

const price = (cents) => `$${(cents / 100).toFixed(2)}`;

const GROUPS = [
    { key: 'includedGenres', label: 'Wanted genres', tone: 'positive' },
    { key: 'excludedGenres', label: 'Avoided genres', tone: 'negative' },
    { key: 'includedTags', label: 'Wanted tags', tone: 'positive' },
    { key: 'excludedTags', label: 'Avoided tags', tone: 'negative' },
    { key: 'platforms', label: 'Required platforms', tone: 'neutral' },
];

export default function AppliedSettings({ room }) {
    const summary = room.preferenceSummary;
    const groups = summary
        ? GROUPS.map((group) => ({ ...group, items: summary[group.key] || [] })).filter(
              (group) => group.items.length
          )
        : [];
    const priceRanges = summary?.priceRanges || [];
    const minimumRatings = summary?.minimumRatings || [];
    const minimumRatingCounts = summary?.minimumRatingCounts || [];
    const hasSettings =
        groups.length || priceRanges.length || minimumRatings.length || minimumRatingCounts.length;

    return (
        <section className={styles.appliedSettings} aria-labelledby="applied-settings-title">
            <div className={styles.settingsHeading}>
                <div>
                    <span className={styles.kicker}>Group preferences</span>
                    <h2 id="applied-settings-title">Settings applied</h2>
                </div>
                {summary ? (
                    <span>
                        {room.readyCount}/{room.playerCount} ready
                    </span>
                ) : null}
            </div>

            {!summary ? (
                <p className={styles.settingsEmpty}>
                    Preferences stay private until everyone finishes the questionnaire.
                </p>
            ) : !hasSettings ? (
                <p className={styles.settingsEmpty}>
                    No filters or preference boosts were selected.
                </p>
            ) : (
                <div className={styles.settingsGroups}>
                    {groups.map((group) => (
                        <div className={styles.settingsGroup} key={group.key}>
                            <h3>{group.label}</h3>
                            <ul>
                                {group.items.map((item) => (
                                    <li
                                        className={styles[`setting_${group.tone}`]}
                                        key={item.value}
                                    >
                                        <span>{titleCase(item.value)}</span>
                                        <strong>
                                            {item.count}/{room.playerCount}
                                        </strong>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                    {priceRanges.length ? (
                        <div className={styles.settingsGroup}>
                            <h3>Price ranges</h3>
                            <ul>
                                {priceRanges.map((range) => (
                                    <li
                                        className={styles.setting_neutral}
                                        key={`${range.minimum}-${range.maximum}`}
                                    >
                                        <span>
                                            {price(range.minimum)}–{price(range.maximum)}
                                        </span>
                                        <strong>
                                            {range.count}/{room.playerCount}
                                        </strong>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}
                    {minimumRatings.length ? (
                        <div className={styles.settingsGroup}>
                            <h3>Minimum ratings</h3>
                            <ul>
                                {minimumRatings.map((rating) => (
                                    <li className={styles.setting_neutral} key={rating.minimum}>
                                        <span>{rating.minimum}% positive</span>
                                        <strong>
                                            {rating.count}/{room.playerCount}
                                        </strong>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}
                    {minimumRatingCounts.length ? (
                        <div className={styles.settingsGroup}>
                            <h3>Minimum review counts</h3>
                            <ul>
                                {minimumRatingCounts.map((rating) => (
                                    <li className={styles.setting_neutral} key={rating.minimum}>
                                        <span>{rating.minimum.toLocaleString()} reviews</span>
                                        <strong>
                                            {rating.count}/{room.playerCount}
                                        </strong>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}
                </div>
            )}
        </section>
    );
}
