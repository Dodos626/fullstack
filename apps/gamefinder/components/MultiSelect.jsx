'use client';

import { useMemo, useState } from 'react';
import styles from './GameFinder.module.css';

const titleCase = (value) =>
    value.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function MultiSelect({ name, options, selected, onToggle }) {
    const [search, setSearch] = useState('');
    const visibleOptions = useMemo(() => {
        const query = search.trim().toLowerCase();
        return query
            ? options.filter((option) => option.name.replaceAll('-', ' ').includes(query))
            : options;
    }, [options, search]);

    return (
        <div className={styles.multiSelect}>
            <div className={styles.multiSelectHeading}>
                <span>
                    {selected.length ? `${selected.length} selected` : 'Choose any options'}
                </span>
                {selected.length ? (
                    <button
                        type="button"
                        onClick={() => selected.forEach((value) => onToggle(name, value))}
                    >
                        Clear selected
                    </button>
                ) : null}
            </div>
            {selected.length ? (
                <div className={styles.selectedChips}>
                    {selected.map((value) => (
                        <button type="button" key={value} onClick={() => onToggle(name, value)}>
                            {titleCase(value)} ×
                        </button>
                    ))}
                </div>
            ) : null}
            <div className={styles.multiSelectPanel}>
                <div className={styles.multiSelectSearchRow}>
                    <input
                        type="search"
                        value={search}
                        placeholder="Search options"
                        aria-label="Search options"
                        onChange={(event) => setSearch(event.target.value.toLowerCase())}
                    />
                </div>
                <div className={styles.multiSelectOptions}>
                    {visibleOptions.map((option) => (
                        <label key={option.name}>
                            <input
                                type="checkbox"
                                checked={selected.includes(option.name)}
                                onChange={() => onToggle(name, option.name)}
                            />
                            <span>{titleCase(option.name)}</span>
                            <small>{option.count.toLocaleString()}</small>
                        </label>
                    ))}
                    {!visibleOptions.length ? <p>No matching options.</p> : null}
                </div>
            </div>
        </div>
    );
}
