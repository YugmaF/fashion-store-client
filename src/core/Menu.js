import React, {useState} from "react";
import {Link, withRouter} from "react-router-dom";
import {signout, isAuthenticate} from "../auth";
import {totalItems} from "./CartHelper";
import {totalWishlistItems} from "./WishlistHelper";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import MenuLogo from '../assets/Logos/Logo_Menu-v1.png';
import {
    faShoppingCart,
    faUserCircle,
    faSignOutAlt,
    faUsersCog,
    faSignInAlt,
    faUserPlus,
    faHeart,
    faPalette
} from '@fortawesome/free-solid-svg-icons'

/* Storefront theme switcher — toggles between the "modern" design
   system and the original Bootstrap/MDB look. Persists the choice. */
const getStoredTheme = () => {
    try {
        const t = window.localStorage.getItem('st-theme');
        return (t === 'original' || t === 'modern') ? t : 'modern';
    } catch (e) { return 'modern'; }
};

const applyTheme = (theme) => {
    try { window.localStorage.setItem('st-theme', theme); } catch (e) { /* ignore */ }
    document.documentElement.setAttribute('data-st-theme', theme);
    window.__stTheme = theme;
};

const isActive = (history, path) => {
    if (history.location.pathname === path) {
        return {color: '#ffffff', className: 'st-active'};
    } else {
        return {color: 'rgba(255,255,255,0.8)'};
    }
};

const Menu = ({history}) => {
    const [theme, setTheme] = useState(getStoredTheme());

    const switchTheme = (next) => {
        applyTheme(next);
        setTheme(next);
    };

    const themePicker = (
        <div className="st-theme-picker" title="Select theme">
            <span className="st-theme-picker-icon"><FontAwesomeIcon icon={faPalette}/></span>
            <span
                className={"st-theme-option" + (theme === 'modern' ? ' st-theme-option-active' : '')}
                onClick={() => switchTheme('modern')}
            >Modern</span>
            <span
                className={"st-theme-option" + (theme === 'original' ? ' st-theme-option-active' : '')}
                onClick={() => switchTheme('original')}
            >Original</span>
        </div>
    );

    return (
    <nav className="navbar navbar-expand-lg navbar-dark st-topnav mb-2">
        {(history.location.pathname !== '/' && history.location.pathname !== '/shop') ? <Link className="navbar-brand text-white font-weight-bolder" to="/"><img src={MenuLogo} height="34" alt="Fashion Store"/></Link> : ''}
        <button className="navbar-toggler st-btn-outline" type="button" data-toggle="collapse" data-target="#basicExampleNav"
                aria-controls="basicExampleNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="basicExampleNav">

            <ul className="navbar-nav mr-auto">
                {isAuthenticate() && (Number.parseInt(isAuthenticate().user.role) === 0 || Number.parseInt(isAuthenticate().user.role) === 1 || Number.parseInt(isAuthenticate().user.role) === 2) && (
                    <li className="nav-item">
                        <Link className="nav-link" style={isActive(history, '/user/dashboard')}
                              to="/user/dashboard">Dashboard</Link>
                    </li>
                )}

                <li className="nav-item">
                    <Link className="nav-link" style={isActive(history, '/')} to="/">Home</Link>
                </li>

                <li className="nav-item">
                    <Link className="nav-link" style={isActive(history, '/shop')} to="/shop">Collection</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" style={isActive(history, '/offers')} to="/offers">Offers</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" style={isActive(history, '/aboutUs')} to="/aboutUs">About Us</Link>
                </li>
            </ul>

            <ul className="navbar-nav">
                <li className="nav-item">
                    <Link className="nav-link st-icon-btn" style={isActive(history, '/cart')}
                          to="/cart"><FontAwesomeIcon size={"lg"} icon={faShoppingCart}/>
                        <sup><small className="st-badge"> {totalItems()}</small></sup>
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link st-icon-btn" style={isActive(history, '/wishlist')}
                          to="/wishlist"><FontAwesomeIcon size={"lg"} icon={faHeart}/>
                        <sup><small className="st-badge"> {totalWishlistItems()}</small></sup>
                    </Link>
                </li>

                {!isAuthenticate() && (
                    <li className="nav-item dropdown">
                        <a className="nav-link st-auth-link dropdown-toggle" id="navbarDropdownMenuLink"
                           style={{cursor: 'pointer', color: '#ffffff'}}
                           data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <FontAwesomeIcon size={"lg"} icon={faUserCircle}/>
                            {'  '} Sign in | Join
                        </a>
                        <div className="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                            <div className="pb-2">
                                <Link className="dropdown-item st-auth-cta d-block" style={isActive(history, '/signin')} to="/signin">
                                    <FontAwesomeIcon icon={faSignInAlt}/> {'  '} Sign in
                                </Link>
                            </div>
                            <Link className="dropdown-item" style={isActive(history, '/signup')} to="/signup">
                                <FontAwesomeIcon icon={faUserPlus}/> {'  '} Sign up
                            </Link>
                        </div>
                    </li>
                )}


                {isAuthenticate() && (
                    <li className="nav-item dropdown" style={{cursor: 'pointer', color: '#ffffff'}}>
                        <a className="nav-link st-auth-link dropdown-toggle" id="navbarDropdownMenuLink"
                           style={{cursor: 'pointer', color: '#ffffff'}}
                           data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <FontAwesomeIcon size={"lg"} icon={faUserCircle}/>
                            {' '} Hi! {isAuthenticate().user.name}
                        </a>
                        <div className="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                            {isAuthenticate() && (Number.parseInt(isAuthenticate().user.role) === 1 || Number.parseInt(isAuthenticate().user.role) === 2) && (
                                <div className="pb-2">
                                    <Link className="dropdown-item st-auth-cta d-block" style={isActive(history, '/admin/dashboard')}
                                          to="/admin/dashboard"><FontAwesomeIcon icon={faUsersCog}/>
                                          {' '} Admin Panel</Link>
                                    <div className="dropdown-divider"></div>
                                </div>
                            )}
                            <span className="dropdown-item" style={{cursor: 'pointer', color: '#7a7a7a'}}
                                  onClick={() => signout(() => {
                                      history.push('/');
                                  })}> <FontAwesomeIcon size={"sm"} icon={faSignOutAlt}/> {' '} Sign out</span>
                        </div>
                    </li>
                )}

                            {themePicker}
            </ul>

        </div>

    </nav>
    );
};

export default withRouter(Menu);
