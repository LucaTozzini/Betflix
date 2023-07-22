import { useRef, useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';

// Icons
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6';
import { IoPlay, IoCheckmarkSharp } from 'react-icons/io5';
import { FiPlus } from "react-icons/fi";

// CSS
import styles from '../styles/MediaSection.component.module.css';

// Contexts
import mediaItemSizeContext from '../contexts/mediaItemSize.context';
import currentUserContext from '../contexts/currentUser.context';
import watchlistContext from '../contexts/browse.context';

const MediaSection = ({title, items, force}) => {
    const { mediaScrollRef, itemWidth, itemsGap, itemsOnPage } = useContext(mediaItemSizeContext);
    const { watchlistMediaIds, setWatchlistMediaIds } = useContext(watchlistContext)
    const { userId, userPin } = useContext(currentUserContext);
    const [ scrollIndex, setScrollIndex ] = useState(0);
    const [ scrollEnd, setScrollEnd ] = useState(false);
    const [ tailLength, setTailLength ] = useState();
    const scrollableRef = useRef(null);

    const TailCalc = () => {
        if(!scrollableRef.current) return;
        const rem = items.length % itemsOnPage;
        const units = rem == 0 ? 0 :  itemsOnPage - rem;
        const length = (units * itemWidth) + ((units - 1) * itemsGap);
        setTailLength(length);
    };

    const ChekScrollEnd = () => {
        if(scrollableRef.current){
            if((scrollIndex + 2) * scrollableRef.current.offsetWidth > scrollableRef.current.scrollWidth) setScrollEnd(true);
            else setScrollEnd(false);
        }
    };

    useEffect(() => {
        if(mediaScrollRef.current == null) mediaScrollRef.current = scrollableRef.current;
        else if(mediaScrollRef.current.offsetWidth == 0) mediaScrollRef.current = scrollableRef.current;
    }, []);

    useEffect(TailCalc, [ itemWidth, itemsOnPage, items ]);

    useEffect(ChekScrollEnd, [ tailLength ]);

    useEffect(() => {
        if(!scrollableRef.current) return;
        if(scrollIndex < 0) setScrollIndex(0);
        if((scrollIndex + 1) * scrollableRef.current.offsetWidth > scrollableRef.current.scrollWidth) setScrollIndex(scrollIndex - 1);
        ChekScrollEnd();
        scrollableRef.current.scrollTo({
            left: (scrollIndex * scrollableRef.current.offsetWidth) + (scrollIndex * itemsGap)
        });
    }, [scrollIndex]);

    const Item = ({mediaId, poster, title, year}) => {
        const handleAdd = async () => {
            try{
                const options = {method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({mediaId, userId, userPin})};
                const response = await fetch('http://localhost/watchlist/add', options);
                if(response.status == 201){
                    setWatchlistMediaIds([...watchlistMediaIds, mediaId]);
                }
            }
            catch(err){
                console.error(err.message);
            }
        };

        const handleRemove = async () => {
            try{
                const options = {method: 'DELETE', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({mediaId, userId, userPin})};
                const response = await fetch('http://localhost/watchlist/remove', options);
                if(response.status == 202){
                    setWatchlistMediaIds(watchlistMediaIds.filter(i => i !== mediaId));
                }
            }
            catch(err){
                console.error(err.message);
            }
        };

        return (
            <div className={styles.item} style={{width: itemWidth+'px'}}>
                <div className={styles.poster} style={{height: (itemWidth * 1.5)+'px', width: itemWidth+'px', backgroundImage: `url(${poster})`}} onClick={() => window.location.href = `/browse/item/${mediaId}`}>
                    <div className={styles.posterOverlay}>
                        <button className={styles.posterButton} onClick={(e) => {e.stopPropagation(); window.location.href = `/player/${mediaId}/a`}}>
                            <IoPlay size={'1.5rem'} style={{marginLeft: '.15rem'}}/>
                        </button>
                        { watchlistMediaIds.includes(mediaId) ? 
                            <button className={styles.posterButton} onClick={() => console.log('watchlist')}>
                                <IoCheckmarkSharp size={'1.5rem'} onClick={(e) => { e.stopPropagation(); handleRemove();}}/>
                            </button>
                            :
                            <button className={styles.posterButton} onClick={() => console.log('watchlist')}>
                                <FiPlus size={'2rem'} onClick={(e) => { e.stopPropagation(); handleAdd(); }}/>
                            </button>
                        }
                    </div>
                </div>
                <Link to={`/browse/item/${mediaId}`}>
                    <h3 className={styles.title}>{title}</h3>
                </Link>
                <h3 className={styles.year}>{year}</h3>
            </div>
        );
    };

    const Dud = () => {
        if(tailLength > 0) return <div style={{width: tailLength+'px', height: '1px', flexShrink: '0'}}/>
    };

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

    if(items.length > 0 || force) return (
        <div className={styles.container}>
            <div className={styles.top}>
                <h1 className={styles.topTitle}>{title}</h1>
                <div className={styles.buttons}> 
                    <LeftArrow/>
                    <RightArraow/>
                </div>
            </div>
            <div className={styles.items} style={{gap: itemsGap+'px'}} ref={scrollableRef}>
                {items.map(i => <Item key={i.MEDIA_ID} mediaId={i.MEDIA_ID} poster={i.POSTER_S} title={i.TITLE} year={i.YEAR}/>)}
                { items.length == 0 ? 'Section Empty' : <></> }
                <Dud/>
            </div>
        </div>
    );
}

export default MediaSection;