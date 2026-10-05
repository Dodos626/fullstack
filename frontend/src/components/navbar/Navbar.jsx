import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MdClose, MdMenu } from 'react-icons/md';
import { Button } from '../buttons/Button';
import styles from './Navbar.module.css';

export const Navbar = ({ leftSide = [], rightSide = () => null }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const renderRightSide = typeof rightSide === 'function' ? rightSide() : rightSide;
    const handleExternalNavigation = (item) => {
        if (item?.type === 'external') {
            setIsMobileMenuOpen(false);
            window.location.assign(item.destination);
        }
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
    const navigateToFirstOption = (item) => {
        const firstOption = item?.options?.[0];

        if (!firstOption) {
            return;
        }

        setIsMobileMenuOpen(false);
        if (firstOption.type === 'external') {
            window.location.assign(firstOption.destination);
            return;
        }

        navigate(firstOption.destination);
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
                                        ]
                                            .filter(Boolean)
                                            .join(' ')}
                                        active={hasActiveChild}
                                        type="button"
                                        aria-haspopup="menu"
                                        onClick={() => navigateToFirstOption(item)}
                                    >
                                        {item?.icon ? (
                                            <span className={styles.navbarIcon}>{item.icon}</span>
                                        ) : null}
                                        <span className={styles.navbarLabel}>{item?.name}</span>
                                        <span className={styles.navbarCaret} aria-hidden="true" />
                                    </Button>
                                    <div className={styles.navbarMenu} role="menu">
                                        {(item?.options || []).map((option, optionIndex) =>
                                            option?.type === 'external' ? (
                                                <Button
                                                    key={`${key}-option-${optionIndex}`}
                                                    className={[
                                                        styles.navbarButton,
                                                        styles.navbarMenuLink,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(' ')}
                                                    type="button"
                                                    onClick={() => handleExternalNavigation(option)}
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
                                            ) : (
                                                <Link
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
                                                    to={option.destination}
                                                    aria-current={
                                                        isPathActive(option.destination)
                                                            ? 'page'
                                                            : undefined
                                                    }
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    {option?.icon ? (
                                                        <span className={styles.navbarIcon}>
                                                            {option.icon}
                                                        </span>
                                                    ) : null}
                                                    <span className={styles.navbarLabel}>
                                                        {option?.name}
                                                    </span>
                                                </Link>
                                            )
                                        )}
                                    </div>
                                </div>
                            );
                        }

                        return item?.type === 'external' ? (
                            <Button
                                key={key}
                                className={[styles.navbarButton, styles.navbarLink]
                                    .filter(Boolean)
                                    .join(' ')}
                                type="button"
                                onClick={() => handleExternalNavigation(item)}
                            >
                                {item?.icon ? (
                                    <span className={styles.navbarIcon}>{item.icon}</span>
                                ) : null}
                                <span className={styles.navbarLabel}>{item?.name}</span>
                            </Button>
                        ) : (
                            <Link
                                key={key}
                                className={[
                                    styles.navbarButton,
                                    styles.navbarLink,
                                    isPathActive(item.destination)
                                        ? styles.navbarLinkActive
                                        : null,
                                ]
                                    .filter(Boolean)
                                    .join(' ')}
                                to={item.destination}
                                aria-current={
                                    isPathActive(item.destination) ? 'page' : undefined
                                }
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {item?.icon ? (
                                    <span className={styles.navbarIcon}>{item.icon}</span>
                                ) : null}
                                <span className={styles.navbarLabel}>{item?.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
            <div className={styles.navbarRight}>{renderRightSide}</div>
        </nav>
    );
};
