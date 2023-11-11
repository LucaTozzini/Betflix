import { useState, useEffect, useRef } from 'react';

// CSS
import styles from '../styles/NavButtons.component.module.css';

// Icons
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6';

const NavButtons = ({scrollRef, items}) => {
    const [ dimLeft, setDimLeft ] = useState(false);
    const [ dimRight, setDimRight ] = useState(false);
    const [ showButtons, setShowButtons ] = useState(true);

    const handleScrollRight = () => {
        if(scrollRef && scrollRef.current) {
            const left = scrollRef.current.scrollLeft += scrollRef.current.offsetWidth;
            scrollRef.current.scrollTo({left});
        }
    };

    const handleScrollLeft = () => {
        if(scrollRef && scrollRef.current) {
            const left = scrollRef.current.scrollLeft -= scrollRef.current.offsetWidth;
            scrollRef.current.scrollTo({left});
        }
    };

    const handleResize = () => {
        if(scrollRef && scrollRef.current) {
            setShowButtons(scrollRef.current.offsetWidth < scrollRef.current.scrollWidth);
            setDimLeft(scrollRef.current.scrollLeft == 0);
            setDimRight(scrollRef.current.scrollLeft + scrollRef.current.offsetWidth >= scrollRef.current.scrollWidth)
        }
    };

    const handleScroll = (e) => {
        const scrollLeft = e.target.scrollLeft;
        const offsetWidth = e.target.offsetWidth;
        const scrollWidth = e.target.scrollWidth;

        setDimLeft(scrollLeft == 0);
        setDimRight(Math.abs(scrollLeft + offsetWidth - scrollWidth) < 10);
    };

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        handleResize();
    }, []);

    useEffect(() => {
        handleResize();
        if(scrollRef && scrollRef.current) {
            scrollRef.current.addEventListener('scrollend', handleScroll);
        }
    }, [scrollRef]);

    useEffect(() => {
        handleResize();
    }, [items]);

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