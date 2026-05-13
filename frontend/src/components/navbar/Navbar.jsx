import { NavLink } from 'react-router-dom';
import { BasicButton } from '../buttons/basic-button/BasicButton';
import styles from './Navbar.module.css';

export const Navbar = ({ leftSide = [], rightSide = () => null }) => {
    const renderRightSide = typeof rightSide === 'function' ? rightSide() : rightSide;

    return (
        <nav className={styles.navbar}>
            <div className={styles.navbarLeft}>
                {leftSide.map((item, index) => {
                    const key = `${item?.name || 'item'}-${index}`;

                    if (item?.type === 'parent') {
                        return (
                            <div className={styles.navbarParent} key={key}>
                                <BasicButton className={styles.navbarParentButton} type="button">
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
                                            className={styles.navbarMenuLink}
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
                                [styles.navbarLink, isActive ? styles.navbarLinkActive : null]
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
