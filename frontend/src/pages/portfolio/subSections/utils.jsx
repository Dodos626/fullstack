import { CiCalendarDate, CiLocationOn } from 'react-icons/ci';

import styles from './subSections.module.css';

export const UtilsFunction = () => {
    const buildPlaceYear = (place, year) => {
        return (
            <div className={styles.placeYearContainer}>
                <div className={styles.placeYearSubContainer}>
                    <CiLocationOn size={20} /> {place}
                </div>
                <div className={styles.placeYearSubContainer}>
                    <CiCalendarDate size={20} /> {year}
                </div>
            </div>
        );
    };

    const buildCategoryTitle = () => {};

    const buildSeperator = () => {};

    return { buildPlaceYear, buildCategoryTitle, buildSeperator };
};
