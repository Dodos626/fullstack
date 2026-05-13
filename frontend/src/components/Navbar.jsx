import { NavLink } from 'react-router-dom';
import { BasicButton } from './BasicButton';
import './Navbar.css';

export const Navbar = ({ leftSide = [], rightSide = () => null }) => {
    const renderRightSide = typeof rightSide === 'function' ? rightSide() : rightSide;

    return (
        <nav className="navbar">
            <div className="navbar-left">
                {leftSide.map((item, index) => {
                    const key = `${item?.name || 'item'}-${index}`;

                    if (item?.type === 'parent') {
                        return (
                            <div className="navbar-parent" key={key}>
                                <BasicButton className="navbar-parent-button" type="button">
                                    {item?.icon ? (
                                        <span className="navbar-icon">{item.icon}</span>
                                    ) : null}
                                    <span className="navbar-label">{item?.name}</span>
                                    <span className="navbar-caret" aria-hidden="true" />
                                </BasicButton>
                                <div className="navbar-menu" role="menu">
                                    {(item?.options || []).map((option, optionIndex) => (
                                        <NavLink
                                            key={`${key}-option-${optionIndex}`}
                                            to={option.destination}
                                            className="navbar-menu-link"
                                        >
                                            {option?.icon ? (
                                                <span className="navbar-icon">{option.icon}</span>
                                            ) : null}
                                            <span className="navbar-label">{option?.name}</span>
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
                                `navbar-link${isActive ? ' navbar-link-active' : ''}`
                            }
                        >
                            {item?.icon ? <span className="navbar-icon">{item.icon}</span> : null}
                            <span className="navbar-label">{item?.name}</span>
                        </NavLink>
                    );
                })}
            </div>
            <div className="navbar-right">{renderRightSide}</div>
        </nav>
    );
};
