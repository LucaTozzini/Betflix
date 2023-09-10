import { useEffect, useRef, useState } from 'react';

// CSS
import styles from '../styles/MediaSection.component.module.css';

// Components
import NavButtons from './NavButtons.component';

const MediaSection = ({ title, items, forceShow }) => {
    const [ showButtons, setShowButtons ] = useState(false);
    const [ dimLeft, setDimLeft ] = useState(true);
    const [ dimRight, setDimRight ] = useState(true);
    const ref = useRef(null);

    const handleScrollRight = () => {
        if(ref.current) {
            const left = ref.current.scrollLeft += ref.current.offsetWidth;
            ref.current.scrollTo({left, behavior: "smooth"});
        }
    };

    const handleScrollLeft = () => {
        if(ref.current) {
            const left = ref.current.scrollLeft -= ref.current.offsetWidth;
            ref.current.scrollTo({top: 0, left, behavior: 'smooth'});
        }
    };

    const handleResize = () => {
        if(ref.current) {
            setShowButtons(ref.current.offsetWidth < ref.current.scrollWidth);
            setDimLeft(ref.current.scrollLeft == 0);
            setDimRight(ref.current.scrollLeft + ref.current.offsetWidth >= ref.current.scrollWidth)
        }
    };

    const handleScroll = (e) => {
        const scrollLeft = e.target.scrollLeft;
        const offsetWidth = e.target.offsetWidth;
        const scrollWidth = e.target.scrollWidth;

        setDimLeft(scrollLeft == 0);
        setDimRight(Math.abs(scrollLeft + offsetWidth - scrollWidth) < 1);
    };

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        handleResize();
        if(ref.current) {
            ref.current.addEventListener('scrollend', handleScroll);
        }
    }, [ref.current]);

    useEffect(() => {
        handleResize();
    }, [items]);

    const Item = ({ title, image, link }) => {
        return (
            <div className={styles.item} onClick={() => window.location.href = link}>
                <img className={styles.itemImage} src={image}/>
                <div className={styles.itemTitle}>{title}</div>
            </div>
        )
    };

    if((items && items.length > 0) || forceShow) return (
        <div className={styles.container}>
            <div className={styles.top}>
                <div className={styles.title}>{title}</div>
                <NavButtons
                    showButtons={showButtons}
                    handleScrollLeft={handleScrollLeft}
                    handleScrollRight={handleScrollRight}
                    dimLeft={dimLeft}
                    dimRight={dimRight}
                />
            </div>
            <div className={styles.items} ref={ref}>
                { items ? 
                    items.map(i => 
                        <Item 
                        key={i.MEDIA_ID} 
                        title={i.TITLE} 
                        image={i.POSTER_W_S || i.BACKDROP_S} 
                        link={'/browse/item/' + i.MEDIA_ID}
                        />
                    ) 
                    : 'No Items' 
                }
            </div>
        </div>
    )
}

export default MediaSection