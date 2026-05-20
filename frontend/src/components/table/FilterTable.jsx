import { useEffect, useMemo, useState } from 'react';
import styles from './FilterTable.module.css';

const DEFAULT_PAGE_SIZE = 10;

const normalizeTags = (value) => (Array.isArray(value) ? value : []);

const resolveRowKey = (row, rowKey, index) => {
    if (typeof rowKey === 'function') {
        return rowKey(row);
    }

    if (typeof rowKey === 'string' && row[rowKey] != null) {
        return row[rowKey];
    }

    return index;
};

export const FilterTable = ({
    columns,
    rows,
    tagsKey = 'tags',
    availableTags,
    pageSize = DEFAULT_PAGE_SIZE,
    paginationMode = 'client',
    totalCount,
    onPageChange,
    rowKey = 'id',
    emptyMessage = 'No items found.',
}) => {
    const [activeTags, setActiveTags] = useState(['All']);
    const [currentPage, setCurrentPage] = useState(1);
    const [isAnimating, setIsAnimating] = useState(false);

    const resolvedTags = useMemo(() => {
        if (Array.isArray(availableTags) && availableTags.length > 0) {
            return availableTags;
        }

        if (!tagsKey) {
            return [];
        }

        const tagSet = new Set();
        rows.forEach((row) => {
            normalizeTags(row[tagsKey]).forEach((tag) => tagSet.add(tag));
        });

        return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
    }, [availableTags, rows, tagsKey]);

    const showAll = activeTags.includes('All');

    const filteredRows = useMemo(() => {
        if (paginationMode === 'server' || showAll) {
            return rows;
        }

        return rows.filter((row) => {
            const rowTags = normalizeTags(row[tagsKey]);
            return rowTags.some((tag) => activeTags.includes(tag));
        });
    }, [rows, activeTags, paginationMode, tagsKey, showAll]);

    const totalItems =
        paginationMode === 'server'
            ? typeof totalCount === 'number'
                ? totalCount
                : rows.length
            : filteredRows.length;

    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    const pagedRows = useMemo(() => {
        if (paginationMode === 'server') {
            return rows;
        }

        const startIndex = (currentPage - 1) * pageSize;
        return filteredRows.slice(startIndex, startIndex + pageSize);
    }, [paginationMode, rows, filteredRows, currentPage, pageSize]);

    const resolvedWidths = useMemo(() => {
        const widths = columns.map((column) => column.width ?? '1fr');
        const hasStringWidth = widths.some((width) => typeof width === 'string');

        if (hasStringWidth) {
            return widths.map((width) => (typeof width === 'number' ? `${width}%` : width));
        }

        const numericWidths = widths.map((width) => Number(width));
        const total = numericWidths.reduce((sum, value) => sum + value, 0) || 1;

        return numericWidths.map((width) => `${(width / total) * 100}%`);
    }, [columns]);

    const columnTemplate = useMemo(() => resolvedWidths.join(' '), [resolvedWidths]);

    const leftColumns = useMemo(
        () => columns.filter((column) => column.sticky === 'left'),
        [columns]
    );
    const rightColumns = useMemo(
        () => columns.filter((column) => column.sticky === 'right'),
        [columns]
    );
    const middleColumns = useMemo(() => columns.filter((column) => !column.sticky), [columns]);

    const resolvedWidthByKey = useMemo(() => {
        const map = new Map();
        columns.forEach((column, index) => {
            map.set(column.key, resolvedWidths[index]);
        });
        return map;
    }, [columns, resolvedWidths]);

    const templateForColumns = (columnGroup) =>
        columnGroup.map((column) => resolvedWidthByKey.get(column.key) || '1fr').join(' ');

    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    const applyAnimation = () => {
        setIsAnimating(true);
        window.setTimeout(() => setIsAnimating(false), 220);
    };

    const notifyPageChange = (nextPage, nextTags) => {
        if (paginationMode !== 'server' || !onPageChange) {
            return;
        }

        const normalizedTags = nextTags.includes('All') ? [] : nextTags;
        onPageChange(nextPage, pageSize, normalizedTags);
    };

    const updatePage = (nextPage) => {
        const normalizedPage = Math.min(Math.max(nextPage, 1), totalPages);
        setCurrentPage(normalizedPage);
        notifyPageChange(normalizedPage, activeTags);
        applyAnimation();
    };

    const toggleTag = (tag) => {
        let nextTags = [];

        if (tag === 'All') {
            nextTags = ['All'];
        } else {
            const currentTags = activeTags.filter((item) => item !== 'All');
            nextTags = currentTags.includes(tag)
                ? currentTags.filter((item) => item !== tag)
                : [...currentTags, tag];

            if (nextTags.length === 0) {
                nextTags = ['All'];
            }
        }

        setActiveTags(nextTags);
        setCurrentPage(1);
        notifyPageChange(1, nextTags);
        applyAnimation();
    };

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    useEffect(() => {
        if (paginationMode === 'server' && onPageChange) {
            notifyPageChange(currentPage, activeTags);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={styles.container}>
            {resolvedTags.length > 0 && (
                <div className={styles.tagsRow}>
                    <button
                        type="button"
                        className={`${styles.tagButton} ${showAll ? styles.tagButtonActive : ''}`}
                        onClick={() => toggleTag('All')}
                    >
                        All
                    </button>
                    {resolvedTags.map((tag) => (
                        <button
                            key={tag}
                            type="button"
                            className={`${styles.tagButton} ${
                                activeTags.includes(tag) ? styles.tagButtonActive : ''
                            }`}
                            onClick={() => toggleTag(tag)}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            )}

            <div className={styles.table}>
                <div
                    className={`${styles.tableScroll} ${
                        isAnimating ? styles.tableScrollAnimating : ''
                    }`}
                >
                    <div
                        className={styles.headerRow}
                        style={{ gridTemplateColumns: columnTemplate }}
                    >
                        {leftColumns.length > 0 && (
                            <div
                                className={`${styles.stickyGroup} ${styles.stickyGroupLeft}`}
                                style={{ gridTemplateColumns: templateForColumns(leftColumns) }}
                            >
                                {leftColumns.map((column) => (
                                    <div
                                        key={column.key}
                                        className={`${styles.headerCell} ${styles.cellStickyLeft}`}
                                    >
                                        {column.header}
                                    </div>
                                ))}
                            </div>
                        )}
                        <div
                            className={styles.rowGrid}
                            style={{ gridTemplateColumns: templateForColumns(middleColumns) }}
                        >
                            {middleColumns.map((column) => (
                                <div key={column.key} className={styles.headerCell}>
                                    {column.header}
                                </div>
                            ))}
                        </div>
                        {rightColumns.length > 0 && (
                            <div
                                className={`${styles.stickyGroup} ${styles.stickyGroupRight}`}
                                style={{ gridTemplateColumns: templateForColumns(rightColumns) }}
                            >
                                {rightColumns.map((column) => (
                                    <div
                                        key={column.key}
                                        className={`${styles.headerCell} ${styles.cellStickyRight}`}
                                    >
                                        {column.header}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={`${styles.body} ${isAnimating ? styles.bodyAnimating : ''}`}>
                        {pagedRows.length === 0 ? (
                            <div className={styles.empty}>{emptyMessage}</div>
                        ) : (
                            pagedRows.map((row, index) => (
                                <div
                                    key={resolveRowKey(row, rowKey, index)}
                                    className={styles.dataRow}
                                    style={{ gridTemplateColumns: columnTemplate }}
                                >
                                    {leftColumns.length > 0 && (
                                        <div
                                            className={`${styles.stickyGroup} ${styles.stickyGroupLeft}`}
                                            style={{
                                                gridTemplateColumns:
                                                    templateForColumns(leftColumns),
                                            }}
                                        >
                                            {leftColumns.map((column) => (
                                                <div
                                                    key={column.key}
                                                    className={`${styles.dataCell} ${
                                                        styles.cellStickyLeft
                                                    }`}
                                                >
                                                    <span className={styles.cellLabel}>
                                                        {column.header}
                                                    </span>
                                                    <span className={styles.cellValue}>
                                                        {column.render
                                                            ? column.render(row)
                                                            : (row[column.key] ?? '')}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div
                                        className={styles.rowGrid}
                                        style={{
                                            gridTemplateColumns: templateForColumns(middleColumns),
                                        }}
                                    >
                                        {middleColumns.map((column) => (
                                            <div key={column.key} className={styles.dataCell}>
                                                <span className={styles.cellLabel}>
                                                    {column.header}
                                                </span>
                                                <span className={styles.cellValue}>
                                                    {column.render
                                                        ? column.render(row)
                                                        : (row[column.key] ?? '')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    {rightColumns.length > 0 && (
                                        <div
                                            className={`${styles.stickyGroup} ${styles.stickyGroupRight}`}
                                            style={{
                                                gridTemplateColumns:
                                                    templateForColumns(rightColumns),
                                            }}
                                        >
                                            {rightColumns.map((column) => (
                                                <div
                                                    key={column.key}
                                                    className={`${styles.dataCell} ${
                                                        styles.cellStickyRight
                                                    }`}
                                                >
                                                    <span className={styles.cellLabel}>
                                                        {column.header}
                                                    </span>
                                                    <span className={styles.cellValue}>
                                                        {column.render
                                                            ? column.render(row)
                                                            : (row[column.key] ?? '')}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.pagination}>
                <div className={styles.paginationInfo}>
                    {`Showing ${startItem}-${endItem} of ${totalItems}`}
                </div>
                <div className={styles.pageControls}>
                    <button
                        type="button"
                        className={styles.pageButton}
                        onClick={() => updatePage(currentPage - 1)}
                        disabled={currentPage <= 1}
                    >
                        Prev
                    </button>
                    <div className={styles.pageIndicator}>
                        {`Page ${currentPage} of ${totalPages}`}
                    </div>
                    <button
                        type="button"
                        className={styles.pageButton}
                        onClick={() => updatePage(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};
