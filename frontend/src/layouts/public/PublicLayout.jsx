import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/navbar/Navbar';
import { BasicButton } from '../../components/buttons/basic-button/BasicButton';
import { useAuth } from '../../hooks/useAuth';
import layoutStyles from '../Layout.module.css';
import styles from './PublicLayout.module.css';
import navbarStyles from '../../components/navbar/Navbar.module.css';

import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { openInNewTab, sendEmail } from '../../utils/utils';

const publicLeftSide = [
    { name: 'Home', destination: '/', type: 'final' },
    { name: 'Login', destination: '/login', type: 'final' },
    { name: 'Communicate', destination: '/communicate', type: 'final' },

    // { name: 'test', destination: '/test', type: 'final' },
    // {
    //     name: 'Explore',
    //     type: 'parent',
    //     options: [
    //         { name: 'Landing', destination: '/', type: 'final' },
    //         { name: 'Login', destination: '/login', type: 'final' },
    //     ],
    // },
    // {
    //     name: 'Explore2',
    //     type: 'parent',
    //     options: [
    //         { name: 'test2', destination: '/test2', type: 'final' },
    //         {
    //             name: 'Explore',
    //             type: 'parent',
    //             options: [
    //                 { name: 'Landing', destination: '/', type: 'final' },
    //                 { name: 'Login', destination: '/login', type: 'final' },
    //             ],
    //         },
    //     ],
    // },
];

export const PublicLayout = ({ children }) => {
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth();

    const handleLogout = async () => {
        navigate('/', { replace: true });
        await logout();
    };

    const buildButton = (Icon, size, onClick) => {
        return <Icon size={size} onClick={onClick} className={styles.findMeButtons} />;
    };

    const rightSide = () => (
        <div className={navbarStyles.navbarActions}>
            <div className={styles.name}>Chalkidis Theodoros</div>
            <div className={styles.seperator}></div>
            {buildButton(MdEmail, 25, sendEmail)}
            {buildButton(FaGithub, 20, () => openInNewTab('https://github.com/dodos626'))}
            {buildButton(FaLinkedin, 20, () =>
                openInNewTab('https://www.linkedin.com/in/theodoros-chalkidis-a76879245/')
            )}
        </div>
    );

    return (
        <div className={`${layoutStyles.layoutShell} ${styles.layoutPublic}`}>
            <Navbar leftSide={publicLeftSide} rightSide={rightSide} />
            <main className={`${layoutStyles.layoutContent} ${styles.layoutContent}`}>
                {children}
            </main>
        </div>
    );
};
