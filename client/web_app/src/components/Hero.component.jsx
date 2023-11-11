// Icons
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';

// Contexts
import { useEffect, useRef } from 'react';

// CSS
import styles from '../styles/Hero.component.module.css';


const Hero = ({ items, autoPlay }) => {
    const scrollRef = useRef(null);
    const navLeft = useRef(null);
    const navRight = useRef(null);

    const handleScroll = () => {
        handleShowLeft();
        handleShowRight();
        const index = Math.round(scrollRef.current.scrollLeft / (scrollRef.current.scrollWidth / items.length));
        for(let i = 0; i < scrollRef.current.children.length; i++) {
            if(i != index && scrollRef.current.children[i].classList.contains(styles.spotLight)) {
                scrollRef.current.children[i].classList.remove(styles.spotLight);
            }
        }
        scrollRef.current.children[index].classList.add(styles.spotLight);
    };

    const scrollLeft = () => {
        if(scrollRef.current) {
            const index = Math.round(scrollRef.current.scrollLeft / (scrollRef.current.scrollWidth / items.length)) - 1;
            if(index >= 0) {
                scrollRef.current.children[index].scrollIntoView({behavior: "smooth", block: 'end', inline: "start"});
            }
        }
    };

    const scrollRight = () => {
        if(scrollRef.current) {
            const index = Math.round(scrollRef.current.scrollLeft / (scrollRef.current.scrollWidth / items.length)) + 1;
            if(scrollRef.current.children.length > index) {
                scrollRef.current.children[index].scrollIntoView({behavior: "smooth", block: 'end', inline: "start"});
            }
        }
    };

    const handleShowLeft = () => {
        if(scrollRef.current.scrollLeft > 0) {
            navLeft.current.classList.add(styles.show);
        }
        else {
            navLeft.current.classList.remove(styles.show);
        }
    };

    const handleShowRight = () => {
        if(items.length > 1 && scrollRef.current.scrollWidth > scrollRef.current.scrollLeft + (2 * scrollRef.current.children[0].clientWidth) && navRight.current) {
            navRight.current.classList.add(styles.show);
        }
        else {
            navRight.current.classList.remove(styles.show);
        }
    };

    useEffect(() => {
        if(scrollRef.current) {
            scrollRef.current.addEventListener("scroll", handleScroll);
        }
    }, [scrollRef.current]);

    useEffect(() => {
        if(scrollRef.current) {
            handleScroll();
        }
    }, [items, scrollRef.current, navRight.current, navLeft.current]);
    

    const Item = ({data}) => {
        const Completion = () => {
            const dur = data.DURATION || data.EPISODE_DURATION;
            const prog = data.PROGRESS_TIME || 0;
            const left = dur - prog;
            const hr = Math.trunc(left / 3600);
            const mn = Math.trunc((left - (hr * 3600)) / 60);
            const sc = Math.trunc(left - (hr * 3600) - (mn * 60));
            const string = `${hr > 0 ? `${hr}h`:''}${hr > 0 && (mn > 0 || sc > 0) ? ', ' : ''}${mn > 0 ? `${mn}m`:''}${mn > 0 && sc > 0 && mn === 0 && hr === 0 ? ', ' : ''}${sc > 0 && mn === 0 && hr === 0  ? `${sc}s`:''} Left`
            return (
                <span style={{color:'rgb(180, 180, 180)'}}>{string}</span>
            );
        };

        const handleClick = () => {
            window.location.href = autoPlay ? `/player/${data.MEDIA_ID}/${data.EPISODE_ID || 'a'}` : `/browse/item/${data.MEDIA_ID}`;
        }

        return (
            <div className={styles.item} onClick={handleClick}>
                <div className={styles.imageContainer}>
                    <div className={styles.imageLarge} style={{backgroundImage: `url(${data.STILL_L || data.BACKDROP_L})`}}>
                        <div className={styles.imageOverlay}></div>
                    </div>
                    <div className={styles.imageSmall} style={{backgroundImage: `url(${data.STILL_S || data.BACKDROP_S})`}}>
                        <div className={styles.imageOverlay}></div>
                    </div>
                </div>
                <div className={styles.infoContainer}>
                    
                    { data.LOGO_S ? 
                        <img className={styles.logo} src={data.LOGO_S} alt=''/> 
                        : 
                        <div className={styles.title}>{data.TITLE}</div> 
                    }
                    <div className={styles.subTitle}>{data.EPISODE_ID ? <><span style={{color: 'orange'}}>{`S${data.SEASON_NUM}:E${data.EPISODE_NUM}`}</span> {data.EPISODE_TITLE} <Completion/> </> : <>{data.CONTENT_RATING}<Completion/></>}</div>
                    
                </div>
            </div>
        )
    };

    if(items && items.length > 0) return (
        <div className={styles.container}>
            <div className={styles.scroll} ref={scrollRef}>
                { items.map(i => <Item key={i.MEDIA_ID + i.EPISODE_ID} data={i}/>) }
            </div>
            <div className={styles.overlayContainer}>
                <button className={styles.navButton} ref={navLeft} onClick={scrollLeft}>
                    <IoChevronBack/>
                </button>
                <button className={styles.navButton} ref={navRight} onClick={scrollRight}>
                    <IoChevronForward/>
                </button>
            </div>
        </div>
    )
};

export default Hero;