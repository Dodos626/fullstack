import { NavLink, useLocation } from 'react-router-dom';
import { BasicButton } from '../buttons/basic-button/BasicButton';
import styles from './Navbar.module.css';

export const Navbar = ({ leftSide = [], rightSide = () => null }) => {
    const location = useLocation();
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
                                <BasicButton
                                    className={[
                                        styles.navbarButton,
                                        styles.navbarParentButton,
                                        hasActiveChild ? styles.navbarLinkActive : null,
                                        firstItemClass,
                                    ]
                                        .filter(Boolean)
                                        .join(' ')}
                                    type="button"
                                >
                                    {item?.icon ? (
                                        <span className={styles.navbarIcon}>{item.icon}</span>
                                    ) : null}
                                    <span className={styles.navbarLabel}>{item?.name}</span>
                                    <span className={styles.navbarCaret} aria-hidden="true" />
                                </BasicButton>
                                <div className={styles.navbarMenu} role="menu">
                                    {(item?.options || []).map((option, optionIndex) => (
                                        <NavLink
                                            key={`${key}-option-${optionIndex}`}
                                            to={option.destination}
                                            className={({ isActive }) =>
                                                [
                                                    styles.navbarButton,
                                                    styles.navbarMenuLink,
                                                    isActive ? styles.navbarLinkActive : null,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' ')
                                            }
                                        >
                                            {option?.icon ? (
                                                <span className={styles.navbarIcon}>
                                                    {option.icon}
                                                </span>
                                            ) : null}
                                            <span className={styles.navbarLabel}>
                                                {option?.name}
                                            </span>
                                        </NavLink>
                                    ))}
                                </div>
                            </div>
                        );
                    }

                    return (
                        <NavLink
                            key={key}
                            to={item.destination}
                            className={({ isActive }) =>
                                [
                                    styles.navbarButton,
                                    styles.navbarLink,
                                    isActive ? styles.navbarLinkActive : null,
                                    firstItemClass,
                                ]
                                    .filter(Boolean)
                                    .join(' ')
                            }
                        >
                            {item?.icon ? (
                                <span className={styles.navbarIcon}>{item.icon}</span>
                            ) : null}
                            <span className={styles.navbarLabel}>{item?.name}</span>
                        </NavLink>
                    );
                })}
            </div>
            <div className={styles.navbarRight}>{renderRightSide}</div>
        </nav>
    );
};
