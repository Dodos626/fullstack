'use client';

import { useMemo, useState } from 'react';
import { groupTagOptions } from './tagCategories';
import styles from './GameFinder.module.css';

const titleCase = (value) =>
    value.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function MultiSelect({ name, options, selected, onToggle, groupTags = false }) {
    const [search, setSearch] = useState('');
    const [activeTagGroup, setActiveTagGroup] = useState('');
    const visibleOptions = useMemo(() => {
        const query = search.trim().toLowerCase();
        return query
            ? options.filter((option) => option.name.replaceAll('-', ' ').includes(query))
            : options;
    }, [options, search]);
    const tagGroups = useMemo(
        () =>
            groupTags
                ? groupTagOptions(options)
                : [],
        [groupTags, options]
    );
    const selectedGroup = tagGroups.find((group) => group.name === activeTagGroup);
    const visibleTagOptions = useMemo(() => {
        if (!selectedGroup) return [];
        const query = search.trim().toLowerCase();
        return query
            ? selectedGroup.options.filter((option) =>
                  option.name.replaceAll('-', ' ').includes(query)
              )
            : selectedGroup.options;
    }, [search, selectedGroup]);

    const openTagGroup = (groupName) => {
        setSearch('');
        setActiveTagGroup(groupName);
    };

    const closeTagGroup = () => {
        setSearch('');
        setActiveTagGroup('');
    };

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
            {groupTags ? (
                <div className={styles.tagMenu}>
                    {selectedGroup ? (
                        <section className={styles.tagSubmenu}>
                            <div className={styles.tagSubmenuHeader}>
                                <button type="button" onClick={closeTagGroup}>
                                    ← Back to tag categories
                                </button>
                                <div>
                                    <h3>{selectedGroup.name}</h3>
                                    <span>{selectedGroup.options.length} tags available</span>
                                </div>
                            </div>
                            <div className={styles.multiSelectSearchRow}>
                                <input
                                    type="search"
                                    value={search}
                                    placeholder={`Search ${selectedGroup.name.toLowerCase()}`}
                                    aria-label={`Search ${selectedGroup.name}`}
                                    onChange={(event) => setSearch(event.target.value.toLowerCase())}
                                />
                            </div>
                            <div className={styles.tagOptionGrid}>
                                {visibleTagOptions.map((option) => (
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
                                {!visibleTagOptions.length ? (
                                    <p>No matching tags in this category.</p>
                                ) : null}
                            </div>
                        </section>
                    ) : (
                        <div className={styles.tagCategoryGrid}>
                            {tagGroups.map((group) => {
                                const selectedCount = group.options.filter((option) =>
                                    selected.includes(option.name)
                                ).length;
                                return (
                                    <button
                                        type="button"
                                        className={styles.tagCategoryCard}
                                        key={group.name}
                                        disabled={!group.options.length}
                                        onClick={() => openTagGroup(group.name)}
                                    >
                                        <strong>{group.name}</strong>
                                        <span>
                                            {group.options.length} tags
                                            {selectedCount ? ` · ${selectedCount} selected` : ''}
                                        </span>
                                        <b aria-hidden="true">→</b>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            ) : (
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
            )}
        </div>
    );
}
