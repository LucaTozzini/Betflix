// Icons
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';

// Contexts
import { useEffect, useRef, useState } from 'react';

// CSS
import styles from '../styles/Hero.component.module.css';


const Hero = ({ items, autoPlay }) => {
    const [ scrollRef, setScrollRef ] = useState(null);
    const [ navLeft, setNavLeft ] = useState(null);
    const [ navRight, setNavRight ] = useState(null);

    const handleScroll = () => {
        if(scrollRef) {
            handleShowLeft();
            handleShowRight();
            const index = Math.round(scrollRef.scrollLeft / (scrollRef.scrollWidth / items.length));
            for(let i = 0; i < scrollRef.children.length; i++) {
                if(i != index && scrollRef.children[i].classList.contains(styles.spotLight)) {
                    scrollRef.children[i].classList.remove(styles.spotLight);
                }
            }
            scrollRef.children[index].classList.add(styles.spotLight);
        }
    };

    const scrollLeft = () => {
        if(scrollRef) {
            const index = Math.round(scrollRef.scrollLeft / (scrollRef.scrollWidth / items.length)) - 1;
            if(index >= 0) {
                scrollRef.children[index].scrollIntoView({behavior: "smooth", block: 'end', inline: "start"});
            }
        }
    };

    const scrollRight = () => {
        if(scrollRef) {
            const index = Math.round(scrollRef.scrollLeft / (scrollRef.scrollWidth / items.length)) + 1;
            if(scrollRef.children.length > index) {
                scrollRef.children[index].scrollIntoView({behavior: "smooth", block: 'end', inline: "start"});
            }
        }
    };

    const handleShowLeft = () => {
        if(navLeft) {
            if(scrollRef && scrollRef.scrollLeft > 0) {
                navLeft.classList.add(styles.show);
            }
            else {
                navLeft.classList.remove(styles.show);
            }
        }
    };

    const handleShowRight = () => {
        if(navRight) {
            if(items.length > 1 && scrollRef && scrollRef.scrollWidth > scrollRef.scrollLeft + (2 * scrollRef.children[0].clientWidth)) {
                navRight.classList.add(styles.show);
            }
            else {
                navRight.classList.remove(styles.show);
            }
        }
    };

    useEffect(() => {
        if(scrollRef) {
            scrollRef.addEventListener("scroll", handleScroll);
        }
    }, [scrollRef]);

    useEffect(() => {
        if(scrollRef) {
            handleScroll();
        }
    }, [items, scrollRef, navRight, navLeft]);
    

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

        useEffect(() => {
            handleScroll();
        }, []);

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
            <div className={styles.scroll} ref={setScrollRef}>
                { items.map(i => <Item key={i.MEDIA_ID + i.EPISODE_ID} data={i}/>) }
            </div>
            <div className={styles.overlayContainer}>
                <button className={styles.navButton} ref={setNavLeft} onClick={scrollLeft}>
                    <IoChevronBack/>
                </button>
                <button className={styles.navButton} ref={setNavRight} onClick={scrollRight}>
                    <IoChevronForward/>
                </button>
            </div>
        </div>
    )
};

export default Hero;