import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdClose, MdMenu } from 'react-icons/md';
import { Button } from '../buttons/Button';
import styles from './Navbar.module.css';

export const Navbar = ({ leftSide = [], rightSide = () => null }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const renderRightSide = typeof rightSide === 'function' ? rightSide() : rightSide;
    const goTo = (item) => {
        if (item?.type === 'external') {
            window.location.assign(item.destination);
            return;
        }

        navigate(item.destination);
    };
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
            <div
                className={`${styles.navbarLeft} ${isMobileMenuOpen ? styles.navbarLeftOpen : ''}`}
            >
                <Button
                    className={styles.navbarMobileToggle}
                    type="button"
                    aria-expanded={isMobileMenuOpen}
                    aria-controls="mobile-navigation-menu"
                    aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                    onClick={() => setIsMobileMenuOpen((open) => !open)}
                >
                    {isMobileMenuOpen ? <MdClose aria-hidden="true" /> : <MdMenu aria-hidden="true" />}
                </Button>
                <div id="mobile-navigation-menu" className={styles.navbarLinks}>
                {leftSide.map((item, index) => {
                    const key = `${item?.name || 'item'}-${index}`;
                    const firstItemClass = index === 0 ? styles.navbarFirstItem : null;

                    if (item?.type === 'parent') {
                        const hasActiveChild = (item?.options || []).some((option) =>
                            isPathActive(option?.destination)
                        );

                        return (
                            <div className={styles.navbarParent} key={key}>
                                <Button
                                    className={[
                                        styles.navbarButton,
                                        styles.navbarParentButton,
                                        hasActiveChild ? styles.navbarLinkActive : null,
                                        firstItemClass,
                                    ]
                                        .filter(Boolean)
                                        .join(' ')}
                                    active={hasActiveChild}
                                    type="button"
                                >
                                    {item?.icon ? (
                                        <span className={styles.navbarIcon}>{item.icon}</span>
                                    ) : null}
                                    <span className={styles.navbarLabel}>{item?.name}</span>
                                    <span className={styles.navbarCaret} aria-hidden="true" />
                                </Button>
                                <div className={styles.navbarMenu} role="menu">
                                    {(item?.options || []).map((option, optionIndex) => (
                                        <Button
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
                                            active={isPathActive(option.destination)}
                                            type="button"
                                            onClick={() => goTo(option)}
                                        >
                                            {option?.icon ? (
                                                <span className={styles.navbarIcon}>
                                                    {option.icon}
                                                </span>
                                            ) : null}
                                            <span className={styles.navbarLabel}>
                                                {option?.name}
                                            </span>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        );
                    }

                    return (
                        <Button
                            key={key}
                            className={[
                                styles.navbarButton,
                                styles.navbarLink,
                                isPathActive(item.destination) ? styles.navbarLinkActive : null,
                                firstItemClass,
                            ]
                                .filter(Boolean)
                                .join(' ')}
                            active={isPathActive(item.destination)}
                            type="button"
                            onClick={() => goTo(item)}
                        >
                            {item?.icon ? (
                                <span className={styles.navbarIcon}>{item.icon}</span>
                            ) : null}
                            <span className={styles.navbarLabel}>{item?.name}</span>
                        </Button>
                    );
                })}
                </div>
            </div>
            <div className={styles.navbarRight}>{renderRightSide}</div>
        </nav>
    );
};
