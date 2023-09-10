// CSS
import styles from '../styles/NavButtons.component.module.css';

// Icons
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6';

const NavButtons = ({showButtons, handleScrollLeft, handleScrollRight, dimLeft, dimRight}) => {
    return (
        <div className={styles.buttons} style={ !showButtons ? {display: 'none'} : {}}>
            <button onClick={handleScrollLeft} style={dimLeft ? { opacity: 0.3, pointerEvents: 'none' } : {}}>
                <FaAngleLeft/>
            </button>
            <button onClick={handleScrollRight} style={dimRight ? { opacity: 0.3, pointerEvents: 'none' } : {}}>
                <FaAngleRight/>
            </button>
        </div>
    )
};

export default NavButtons