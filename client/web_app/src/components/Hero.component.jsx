// Icons
import { IoPlay, IoCheckmarkSharp, IoChevronBack, IoChevronForward } from 'react-icons/io5';

import { FiPlus } from "react-icons/fi";

// Contexts
import { useEffect, useRef, useState } from 'react';

// CSS
import styles from '../styles/Hero.component.module.css';


const Hero = ({ items }) => {
    const [ scrolling, setScrolling ] = useState(false);
    const scrollRef = useRef(false);
    const [ dimLeft, setDimLeft ] = useState(true);
    const [ dimRight, setDimRight ] = useState(true);
    const ref = useRef(null);

    const handleScrollRight = () => {
        if(ref.current) {
            const pad = 2 * parseFloat(getComputedStyle(ref.current).getPropertyValue('padding').split('px')[1]);
            const left = ref.current.scrollLeft + ref.current.offsetWidth - pad;
            ref.current.scrollTo({left})
        }
    };

    const handleScrollLeft = () => {
        if(ref.current) {
            const pad = 2 * parseFloat(getComputedStyle(ref.current).getPropertyValue('padding').split('px')[1]);
            const left = ref.current.scrollLeft - ref.current.offsetWidth - pad;
            ref.current.scrollTo({left})
        }
    };

    useEffect(() => {
        if(ref.current) {
            const snap = (doSnap) => {
                ref.current.style.scrollSnapType = doSnap ? 'x mandatory' : 'none';
            }
            const yes = () => {if(!scrollRef.current) {snap(false); scrollRef.current = true; setScrolling(true)}};
            const no = () => {snap(true); scrollRef.current = false; setScrolling(false)};
            ref.current.addEventListener('scroll', yes);
            ref.current.addEventListener('scrollend', no);
        }
    }, [ ref.current ]);

    useEffect(() => {
        if(!scrolling && ref.current) {
            const left = ref.current.scrollLeft;
            setDimLeft(left == 0);
            setDimRight(Math.abs(left + ref.current.offsetWidth - ref.current.scrollWidth) < 10);
        }
    }, [ scrolling, ref.current ]);


    const Item = ({data}) => {
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

        return (
            <div className={styles.item} style={{pointerEvents: scrolling ? 'none' : null}} onClick={() => window.location.href = window.location.href = `/player/${data.MEDIA_ID}/${data.EPISODE_ID || 'a'}`}>
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
                <button onClick={handleScrollLeft} className={styles.navButton} style={{ background: scrolling ? 'none' : null, pointerEvents: scrolling || dimLeft ? 'none' : null, opacity: scrolling ? 0.1 : dimLeft ? 0 : 1}}>
                    <IoChevronBack/>
                </button>
                <button onClick={handleScrollRight} className={styles.navButton} style={{ background: scrolling ? 'none' : null, pointerEvents: scrolling || dimRight ? 'none' : null, opacity: scrolling ? 0.2 : dimRight ? 0 : 1}}>
                    <IoChevronForward/>
                </button>
            </div>
        </div>
    )
};

export default Hero;