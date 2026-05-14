import { useLocation, useNavigate } from 'react-router-dom';
import { ComicButton } from '../buttons/comic-button/comic-button';
import styles from './Navbar.module.css';

export const Navbar = ({ leftSide = [], rightSide = () => null }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const renderRightSide = typeof rightSide === 'function' ? rightSide() : rightSide;
    const isPathActive = (target) => {
        if (!target) {
            return false;
        }

        if (target === '/') {
            return location.pathname === '/';
        }

        return location.pathname === target || location.pathname.startsWith(`${target}/`);
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.navbarLeft}>
                {leftSide.map((item, index) => {
                    const key = `${item?.name || 'item'}-${index}`;
                    const firstItemClass = index === 0 ? styles.navbarFirstItem : null;

                    if (item?.type === 'parent') {
                        const hasActiveChild = (item?.options || []).some((option) =>
                            isPathActive(option?.destination)
                        );

                        return (
                            <div className={styles.navbarParent} key={key}>
                                <ComicButton
                                    className={[
                                        styles.navbarButton,
                                        styles.navbarParentButton,
                                        hasActiveChild ? styles.navbarLinkActive : null,
                                        firstItemClass,
                                    ]
                                        .filter(Boolean)
                                        .join(' ')}
                                    isActive={hasActiveChild}
                                    type="button"
                                >
                                    {item?.icon ? (
                                        <span className={styles.navbarIcon}>{item.icon}</span>
                                    ) : null}
                                    <span className={styles.navbarLabel}>{item?.name}</span>
                                    <span className={styles.navbarCaret} aria-hidden="true" />
                                </ComicButton>
                                <div className={styles.navbarMenu} role="menu">
                                    {(item?.options || []).map((option, optionIndex) => (
                                        <ComicButton
                                            key={`${key}-option-${optionIndex}`}
                                            className={[
                                                styles.navbarButton,
                                                styles.navbarMenuLink,
                                                isPathActive(option.destination)
                                                    ? styles.navbarLinkActive
                                                    : null,
                                            ]
                                                .filter(Boolean)
                                                .join(' ')}
                                            isActive={isPathActive(option.destination)}
                                            type="button"
                                            onClick={() => navigate(option.destination)}
                                        >
                                            {option?.icon ? (
                                                <span className={styles.navbarIcon}>
                                                    {option.icon}
                                                </span>
                                            ) : null}
                                            <span className={styles.navbarLabel}>
                                                {option?.name}
                                            </span>
                                        </ComicButton>
                                    ))}
                                </div>
                            </div>
                        );
                    }

                    return (
                        <ComicButton
                            key={key}
                            className={[
                                styles.navbarButton,
                                styles.navbarLink,
                                isPathActive(item.destination) ? styles.navbarLinkActive : null,
                                firstItemClass,
                            ]
                                .filter(Boolean)
                                .join(' ')}
                            isActive={isPathActive(item.destination)}
                            type="button"
                            onClick={() => navigate(item.destination)}
                        >
                            {item?.icon ? (
                                <span className={styles.navbarIcon}>{item.icon}</span>
                            ) : null}
                            <span className={styles.navbarLabel}>{item?.name}</span>
                        </ComicButton>
                    );
                })}
            </div>
            <div className={styles.navbarRight}>{renderRightSide}</div>
        </nav>
    );
};
