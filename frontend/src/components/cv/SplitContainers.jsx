import styles from './SplitContainers.module.css';

const toRatio = (ratio) => {
    if (!Array.isArray(ratio) || ratio.length !== 2) {
        return { left: '1fr', right: '1fr' };
    }

    const leftValue = Number(ratio[0]);
    const rightValue = Number(ratio[1]);

    if (!Number.isFinite(leftValue) || !Number.isFinite(rightValue)) {
        return { left: '1fr', right: '1fr' };
    }

    const total = leftValue + rightValue;

    if (total <= 0) {
        return { left: '1fr', right: '1fr' };
    }

    return {
        left: `${leftValue / total}fr`,
        right: `${rightValue / total}fr`,
    };
};

export const SplitContainers = ({ sections = [] }) => {
    return (
        <div className={styles.splitContainers}>
            {sections.map((section) => {
                const { left, right } = toRatio(section.ratio);
                const isRightSticky = section.stickySide !== 'left';
                const showTitle = Boolean(section.title);
                const titleClassName = [styles.sectionTitle, section.titleClassName]
                    .filter(Boolean)
                    .join(' ');

                return (
                    <div key={section.id} className={styles.splitSection}>
                        {showTitle && (
                            <div className={titleClassName} style={section.titleStyle}>
                                {section.title}
                            </div>
                        )}
                        <section
                            className={styles.splitRow}
                            style={{
                                '--split-left': left,
                                '--split-right': right,
                            }}
                        >
                            <div
                                className={[
                                    styles.column,
                                    isRightSticky ? styles.mainColumn : styles.stickyColumn,
                                ]
                                    .filter(Boolean)
                                    .join(' ')}
                            >
                                {section.left}
                            </div>
                            <div
                                className={[
                                    styles.column,
                                    isRightSticky ? styles.stickyColumn : styles.mainColumn,
                                ]
                                    .filter(Boolean)
                                    .join(' ')}
                            >
                                {section.right}
                            </div>
                        </section>
                    </div>
                );
            })}
        </div>
    );
};
