// Icons
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';

// Contexts
import { useEffect, useRef, useState } from 'react';

// CSS
import styles from '../styles/Hero.component.module.css';


const Hero = ({ items, autoPlay }) => {
    const [ dimLeft, setDimLeft ] = useState(true);
    const [ dimRight, setDimRight ] = useState(true);
    const ref = useRef(null);

    const itemDimVal = "0.5";

    const dimAll = () => {
        const items = document.getElementsByClassName(styles.item);
        for(const item of items) {
            item.style.opacity = itemDimVal; 
        }
    };

    const handleScrollRight = () => {
        if(ref.current) {
            dimAll();
            const pad = 2 * parseFloat(getComputedStyle(ref.current).getPropertyValue('padding').split('px')[1]);
            const left = ref.current.scrollLeft + ref.current.offsetWidth - pad;
            ref.current.scrollTo({left})
        }
    };

    const handleScrollLeft = () => {
        if(ref.current) {
            dimAll();
            const pad = 2 * parseFloat(getComputedStyle(ref.current).getPropertyValue('padding').split('px')[1]);
            const left = ref.current.scrollLeft - ref.current.offsetWidth - pad;
            ref.current.scrollTo({left})
        }
    };

    const handleShowNav = () => {
        if(ref.current) {
            const left = ref.current.scrollLeft;
            const offset = ref.current.offsetWidth;
            const scroll = ref.current.scrollWidth;

            setDimLeft(left == 0);
            setDimRight(Math.abs((left + offset) - scroll) < 10);
        }
    };

    const handleItemDims = () => {
        if(ref.current) {
            const left = ref.current.scrollLeft;
            const items = document.getElementsByClassName(styles.item) 
            const itemWidth = parseFloat(getComputedStyle(items[0]).getPropertyValue('width').replace('px', ''));
            const itemsGap = parseFloat(getComputedStyle(ref.current).getPropertyValue('gap').replace('px', ''));
            
            const curr = Math.round(left / (itemWidth + itemsGap));

            let i = 0;
            for(const item of items) {
                item.style.opacity = i == curr ? "1" : itemDimVal;
                i++;
            };
        }
    };

    useEffect(() => {
        if(ref.current) {
            ref.current.addEventListener('scrollend', handleShowNav);
            ref.current.addEventListener('scrollend', handleItemDims);
            handleShowNav();
            handleItemDims();
        }
    }, [ ref.current ]);

    const Item = ({data}) => {
        useEffect(() => {
            handleItemDims();
        }, []);

        const Completion = () => {
            const dur = data.DURATION || data.EPISODE_DURATION;
            const prog = data.PROGRESS_TIME || 0;
            const left = dur - prog;
            const hr = Math.trunc(left / 3600);
            const mn = Math.trunc((left - (hr * 3600)) / 60);
            const sc = Math.trunc(left - (hr * 3600) - (mn * 60));
            const string = `${hr > 0 ? `${hr}h`:''}${hr > 0 && (mn > 0 || sc > 0) ? ', ' : ''}${mn > 0 ? `${mn}m`:''}${mn > 0 && sc > 0 && mn == 0 && hr == 0 ? ', ' : ''}${sc > 0 && mn == 0 && hr == 0  ? `${sc}s`:''} Left`
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
                        <img className={styles.logo} src={data.LOGO_S}/> 
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
            <div className={styles.scroll} ref={ref}>
                { items.map(i => <Item key={i.MEDIA_ID + i.EPISODE_ID} data={i}/>) }
            </div>
            <div className={styles.overlayContainer}>
                <button onClick={handleScrollLeft} className={styles.navButton} style={ !dimLeft ? { opacity: 1, pointerEvents: 'all' } : {} }>
                    <IoChevronBack/>
                </button>
                <button onClick={handleScrollRight} className={styles.navButton} style={ !dimRight ? { opacity: 1, pointerEvents: 'all' } : {} }>
                    <IoChevronForward/>
                </button>
            </div>
        </div>
    )
};

export default Hero;