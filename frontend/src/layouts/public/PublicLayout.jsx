import { Navbar } from '../../components/navbar/Navbar';
import { IconButton } from '../../components/buttons/IconButton';
import { useDayMode } from '../../hooks/useDayMode';
import layoutStyles from '../Layout.module.css';
import styles from './PublicLayout.module.css';
import navbarStyles from '../../components/navbar/Navbar.module.css';

import { FaGithub, FaLinkedin } from 'react-icons/fa';

import { MdEmail, MdNightlight, MdSunny } from 'react-icons/md';
import { openInNewTab, sendEmail } from '../../utils/utils';
import { Footer } from '../../components/footer/Footer';
import { isDevMode } from '../../config/features';

const publicLeftSide = [
    { name: 'Home', destination: '/', type: 'final' },
    { name: 'Projects', destination: '/projects', type: 'final' },
    { name: 'About', destination: '/about', type: 'final' },
    ...(isDevMode ? [{ name: 'Login', destination: '/login', type: 'final' }] : []),
    // { name: 'Communicate', destination: '/communicate', type: 'final' },
];

export const PublicLayout = ({ children }) => {
    const { dayMode, toggleDayMode } = useDayMode();

    const buildButton = (Icon, size, onClick, label, mobilePriority = false) => {
        return (
            <IconButton
                type="button"
                className={[
                    navbarStyles.navbarActionButton,
                    mobilePriority ? navbarStyles.navbarActionMobilePriority : null,
                ]
                    .filter(Boolean)
                    .join(' ')}
                onClick={onClick}
                aria-label={label}
                title={label}
            >
                <Icon size={size} aria-hidden="true" />
            </IconButton>
        );
    };

    const rightSide = () => (
        <div className={navbarStyles.navbarActions}>
            <div className={`${styles.name} ${navbarStyles.navbarIdentity}`}>
                Chalkidis Theodoros
            </div>
            <div className={`${styles.seperator} ${navbarStyles.navbarSeparator}`}></div>
            {buildButton(
                MdEmail,
                30,
                sendEmail,
                'Send email',
                true
            )}
            {buildButton(
                FaGithub,
                25,
                () => openInNewTab('https://github.com/dodos626'),
                'Open GitHub profile',
                true
            )}
            {buildButton(
                FaLinkedin,
                25,
                () => openInNewTab('https://www.linkedin.com/in/theodoros-chalkidis-a76879245/'),
                'Open LinkedIn profile'
            )}
            <div className={`${styles.seperator} ${navbarStyles.navbarSeparator}`}></div>
            {buildButton(
                dayMode ? MdNightlight : MdSunny,
                25,
                toggleDayMode,
                dayMode ? 'Enable night theme' : 'Enable day theme'
            )}
        </div>
    );

    return (
        <div className={`${layoutStyles.layoutShell} ${styles.layoutPublic}`}>
            <Navbar leftSide={publicLeftSide} rightSide={rightSide} />
            <main className={`${layoutStyles.layoutContent} ${styles.layoutContent}`}>
                <div className={styles.body}>{children}</div>
            </main>
            <Footer />
        </div>
    );
};
