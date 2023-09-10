import { useState, useRef, useEffect } from 'react';

// Components
import NavButtons from './NavButtons.component';

// CSS
import styles from '../styles/EpisodesSection.component.module.css';

const EpisodesSection = ({ data, mediaId }) => {
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
    }, [data])

    const Item = ({ episodeId, still, title, seasonNum, episodeNum, airDate, progress, overview }) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const dates = airDate.split('-');
        const month = months[parseInt(dates[1]) - 1];
        const day = dates[2];
        const year = dates[0];

        const playLink = () => window.location.href = `/player/${mediaId}/${episodeId}`; 

        return (
            <div className={styles.item} onClick={playLink}>
                <div className={styles.image} style={{backgroundImage: `url(${still})`}}>
                    <div className={styles.imageOverlay}>
                        <h1 className={styles.seasonEpisode}>{`S${seasonNum}:E${episodeNum}`}</h1>
                        <div className={styles.progressBar}>
                            <div className={styles.progressFill} style={{width: `${progress}%`}}/>
                        </div>
                    </div>
                </div>
                <div className={styles.infoContainer}>
                    <div className={styles.title}>{title}</div>
                    <div className={styles.airDate}>{`${month} ${day}, ${year}`}</div>
                    <div className={styles.overview}>{overview}</div>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <h2 className={styles.topTitle}></h2>
                <NavButtons
                    showButtons={showButtons}
                    handleScrollLeft={handleScrollLeft}
                    handleScrollRight={handleScrollRight}
                    dimLeft={dimLeft}
                    dimRight={dimRight}
                />
            </div>
            <div className={styles.items} ref={ref}>
                {data.map(i => 
                    <Item 
                    key={i.EPISODE_ID} 
                    episodeId={i.EPISODE_ID} 
                    still={i.STILL_S} 
                    title={i.TITLE} 
                    seasonNum={i.SEASON_NUM} 
                    episodeNum={i.EPISODE_NUM} 
                    airDate={i.AIR_DATE} 
                    progress={i.PROGRESS_TIME ? (i.PROGRESS_TIME / i.DURATION) * 100  : 0}
                    overview={i.OVERVIEW}
                    />
                )}
            </div>
        </div>
    );
};

export default EpisodesSection;