import styles from './MatrixBackground.module.css';

const COLUMN_COUNT = 40;
const MIN_DURATION = 8;
const DURATION_RANGE = 5;

export const MatrixBackground = ({ speed = 1, blur = 0 }) => {
    const parsedSpeed = Number(speed);
    const parsedBlur = Number(blur);
    const speedMultiplier = Number.isFinite(parsedSpeed) ? Math.max(parsedSpeed, 0.1) : 1;
    const blurAmount = Number.isFinite(parsedBlur) ? Math.max(parsedBlur, 0) : 0;

    return (
        <div
            className={styles.matrixContainer}
            style={{ '--matrix-blur': `${blurAmount}px` }}
            aria-hidden="true"
        >
            <div className={styles.matrixPattern}>
                {Array.from({ length: COLUMN_COUNT }, (_, index) => (
                    <span
                        key={index}
                        className={styles.matrixColumn}
                        style={{
                            '--column': index,
                            '--delay': `${(-2 - ((index * 2.3) % DURATION_RANGE)) / speedMultiplier}s`,
                            '--duration': `${(MIN_DURATION + ((index * 1.7) % DURATION_RANGE)) / speedMultiplier}s`,
                        }}
                    />
                ))}
            </div>
        </div>
    );
};
