import { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// Contexts
import currentUserContext from '../contexts/currentUser.context';

// CSS
import styles from '../styles/Menu.component.module.css';

const Menu = () => {
    const { userData } = useContext(currentUserContext);
    const menuRef = useRef(null);
    const userButtonRef = useRef(null);
    const [ dropDown, setDropDown ] = useState(false);

    const handleScroll = () => {
        if(!menuRef.current) return;
        const scroll = document.getElementById('root').scrollTop;
        const css = menuRef.current.style;
        css.background = scroll > 0 ? 'black' : 'transparent';
        css.outline = scroll > 0 ? '1px solid rgba(255, 255, 255, 0.2) ' : 'none';
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
                <Link className={styles.link} to="/">Home</Link>
                <Link className={styles.link} to="/database">Database</Link>
            </div>

            <div className={styles.section}>
                <button className={styles.userButton} onClick={() => setDropDown(!dropDown)} ref={userButtonRef}>
                    <h3 className={styles.userName}>{userData.userName}</h3>
                    <img className={styles.userImage} src={'http://localhost/'+userData.userImage}/>
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