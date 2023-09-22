import { useState, useRef, useEffect } from 'react';

// Components
import NavButtons from './NavButtons.component';

// CSS
import styles from '../styles/EpisodesSection.component.module.css';

const EpisodesSection = ({ data, mediaId, Selector }) => {
    const ref = useRef(null);

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
                {Selector ? <Selector/> : <div/>}
                <NavButtons scrollRef={ref} items={data}/>
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