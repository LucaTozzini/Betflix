import { useContext, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

// Icons
import { IoHomeSharp, IoHomeOutline, IoSearchSharp, IoSearchOutline, IoServerSharp, IoServerOutline } from "react-icons/io5";


// Contexts
import serverContext from '../contexts/server.context';
import currentUserContext from '../contexts/currentUser.context';

// CSS
import styles from '../styles/Menu.component.module.css';

const Menu = () => {
    const { userData } = useContext(currentUserContext);
    const { serverAddress } = useContext(serverContext);
    const menuRef = useRef(null);
    const userButtonRef = useRef(null);
    const [ dropDown, setDropDown ] = useState(false);
    const location = useLocation();

    const handleScroll = () => {
        if(!menuRef.current) return;
        const scroll = document.getElementById('root').scrollTop;
        const css = menuRef.current.style;
        css.background = scroll > 0 ? 'black' : 'transparent';
        css.outline = scroll > 0 ? '1px solid rgb(50, 50, 50) ' : 'none';
        setDropDown(false)
    };

    const handleClick = (e) => {
        if(!(userButtonRef.current && userButtonRef.current.contains(e.target))) setDropDown(false);
    };
   
    useEffect(() => {
        const root = document.getElementById('root'); 
        root.addEventListener('scroll', handleScroll);
        root.addEventListener('click', handleClick);
        handleScroll();
        return () => {
            root.removeEventListener('scroll', handleScroll);
            root.removeEventListener('click', handleClick);
        }
    }, []);

    return (
        <nav className={styles.container} ref={menuRef}>
            <div className={styles.section}>
                <img className={styles.logo} src={'https://www.nicepng.com/png/full/60-609637_nike-logo-png-white.png'}/>
                <Link className={styles.link} to="/browse">
                    { location.pathname == '/browse' || location.pathname == '/browse/' ? <IoHomeSharp/> : <IoHomeOutline/>}
                    <h3>Home</h3>
                </Link>
                <Link className={styles.link} to="/browse/search">
                    { location.pathname == '/browse/search' || location.pathname == '/browse/search/' ? <IoSearchSharp/> : <IoSearchOutline/>}
                    <h3>Search</h3>
                </Link>
                <Link className={styles.link} to="/database">
                    { location.pathname == '/database' || location.pathname == '/database/' ? <IoServerSharp/> : <IoServerOutline/>}
                    <h3>Server</h3>
                </Link>
            </div>

            <div className={styles.section}>
                <button className={styles.userButton} onClick={() => setDropDown(!dropDown)} ref={userButtonRef}>
                    <h3 className={styles.userName}>{userData.userName}</h3>
                    <img className={styles.userImage} src={`${serverAddress}/${userData.userImage}`}/>
                </button>
            </div>


            { dropDown ? <div className={styles.dropDown}>
                <Link>User Settings</Link>
                <Link to={'/users/select'}>Change User</Link>
            </div> : <></>}

        </nav>
    );
};

export default Menu;