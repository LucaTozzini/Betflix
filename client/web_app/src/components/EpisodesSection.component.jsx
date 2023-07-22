import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaAngleLeft, FaAngleRight} from 'react-icons/fa6';

// CSS
import { useEffect } from 'react';
import styles from '../styles/EpisodesSection.component.module.css';
import { useRef } from 'react';

const EpisodesSection = ({ data, mediaId }) => {
    const scrollRef = useRef(null);
    const [ secondPass, setSecondPass ] = useState(false);
    const [ itemWidth, setItemWidth ] = useState(0); 
    const [ itemGap, setItemGap ] = useState(0);
    const [ itemsOnPage, setItemsOnPage ] = useState(0);
    const [ scrollIndex, setScrollIndex ] = useState(0);
    const [ scrollEnd, setScrollEnd ] = useState(false);
    const [ tailLength, setTailLength] = useState();

    let debounce;

    const ItemSize = (time) => {
        time = time ? time : 0;
        if(!scrollRef.current) return;
        if(!scrollRef.current.offsetWidth) return;
        clearTimeout(debounce);
        debounce = setTimeout(() => {
            const width = scrollRef.current.offsetWidth;
            const num = 
            width >= 1800 ?  6 :
            width >= 1600 ?  4 :
            width >= 900 ?  3 : 2;
    
            const gapSpace = num == 1 ? 0 : width * 0.05;
            const available = num == 1 ? width : width * 0.95;
            setItemWidth(available / num);
            setItemGap(gapSpace / (num - 1));
            setItemsOnPage(num);
            if(!secondPass){
                setSecondPass(true);
            } 
        }, time);
    };

    const TailCalc = () => {
        const rem = data.length % itemsOnPage;
        const units = rem == 0 ? 0 :  itemsOnPage - rem;
        const length = (units * itemWidth) + ((units - 1) * itemGap);
        setTailLength(length);
    };

    const ChekScrollEnd = () => {
        if(scrollRef.current){
            const condition = (scrollIndex + 2) * scrollRef.current.offsetWidth > scrollRef.current.scrollWidth;
            setScrollEnd(condition);
        }
    };

    useEffect(() => {
        if(scrollIndex < 0) setScrollIndex(0);
        scrollRef.current.scrollTo({
            left: (scrollIndex * scrollRef.current.offsetWidth) + (scrollIndex * itemGap)
        });
        if((scrollIndex + 1) * scrollRef.current.offsetWidth > scrollRef.current.scrollWidth) setScrollIndex(scrollIndex - 1);
    }, [scrollIndex]);

    useEffect(() => {
        const handleResize = () => ItemSize(500)
        window.addEventListener('resize', handleResize);
        ItemSize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(ItemSize, [secondPass]);

    useEffect(TailCalc, [itemsOnPage, itemWidth, data]);

    useEffect(ChekScrollEnd, [tailLength, scrollIndex, data]);

    const Item = ({ episodeId, still, title, seasonNum, episodeNum, airDate, progress}) => {
        const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const dates = airDate.split('-');
        const month = months[parseInt(dates[1])];
        const day = dates[2]
        const year = dates[0]
        return (
            <Link to={`/player/${mediaId}/${episodeId}`}>
                <div className={styles.item} style={{width:itemWidth+'px'}}>
                    <div className={styles.image} style={{backgroundImage: `url(${still})`, height: (itemWidth * 0.6)+'px'}}>
                        <div className={styles.imageOverlay}>
                            <h1 className={styles.seasonEpisode}>{`S${seasonNum} E${episodeNum}`}</h1>
                            <div className={styles.progressBar}>
                                <div className={styles.progressFill} style={{width: `${progress}%`}}/>
                            </div>
                        </div>
                    </div>
                    <h5 className={styles.title}>{title}</h5>
                    <h6 className={styles.airDate}>{`${month} ${day}, ${year}`}</h6>
                </div>
            </Link>
        );
    };

    const Dud = () => <div style={{height:'1px', width: tailLength+'px', flexShrink: '0'}}/>;

    const LeftArrow = () => {
        return (
            <button 
            className={styles.button} 
            style={scrollIndex == 0 ? {opacity: 0.2, pointerEvents: 'none'} : {}} 
            onClick={() => setScrollIndex(scrollIndex - 1)}>
                <FaAngleLeft color='white' size={'1.4rem'}/>
            </button>
        )
    };

    const RightArraow = () => {
        return (
            <button 
            className={styles.button} 
            style={scrollEnd ? {opacity: 0.2, pointerEvents: 'none'} : {}} 
            onClick={() => setScrollIndex(scrollIndex + 1)}>
                <FaAngleRight color='white' size={'1.4rem'}/>
            </button>
        )
    };

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <h2 className={styles.topTitle}></h2>
                <div className={styles.buttons}> 
                    <LeftArrow/>
                    <RightArraow/>
                </div>
            </div>
            <div className={styles.items} style={{gap: itemGap+'px'}} ref={scrollRef}>
                {data.map(i => <Item key={i.EPISODE_ID} episodeId={i.EPISODE_ID} still={i.STILL_S} title={i.TITLE} seasonNum={i.SEASON_NUM} episodeNum={i.EPISODE_NUM} airDate={i.AIR_DATE} progress={i.PROGRESS_TIME ? (i.PROGRESS_TIME / i.DURATION) * 100  : 0} />)}
                <Dud/>
            </div>
        </div>
    );
};

export default EpisodesSection;