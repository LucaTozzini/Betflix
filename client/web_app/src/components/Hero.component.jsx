// Icons
import { IoPlay, IoCheckmarkSharp, IoChevronBack, IoChevronForward } from 'react-icons/io5';

import { FiPlus } from "react-icons/fi";

// Contexts
import { useEffect, useState } from 'react';

// CSS
import styles from '../styles/ContinueWatching.component.module.css';


const Hero = ({ items }) => {
    const [ index, setIndex ] = useState(0);
    const [ currentItem, setCurrentItem ] = useState(null);

    useEffect(() => {
        if(items && items[0]){
            setCurrentItem(items[0])
        }
    }, [items]);

    useEffect(() => {
        if(!items) return;
        else if(index > items.length - 1) setIndex(items.length - 1); 
        else if(index < 0) setIndex(0);
        else setCurrentItem(items[index]);
    }, [index])

    if(items && items.length > 0 && currentItem) return (
        <div className={styles.container} style={{backgroundImage: currentItem ? currentItem.STILL_L ? `url(${currentItem.STILL_L})` : `url(${currentItem.BACKDROP_L})` : '', opacity: currentItem ? 1 : 0 }} onClick={() => window.location.href = `/browse/item/${currentItem.MEDIA_ID}`}>
            <div className={styles.backdropOverlay}> 
                {(currentItem.LOGO_L) ? <img src={currentItem.LOGO_L} className={styles.logo} /> : <></>}

                <h2 className={styles.title}>{currentItem.TITLE}</h2>
                { (currentItem.TYPE == 2) ? <h3 className={styles.episodeTitle}> {`S${currentItem.SEASON_NUM}.E${currentItem.EPISODE_NUM} - ${currentItem.EPISODE_TITLE}`}</h3> : <></>}

                <div className={styles.buttonsBar}>
                    <button className={styles.playButton} onClick={(e) => { e.stopPropagation(); window.location.href = `/player/${currentItem.MEDIA_ID}/${currentItem.TYPE == 2 ? currentItem.EPISODE_ID : 'a'}` }}> <IoPlay size={'1.5rem'} onClick={(e) => { e.stopPropagation()  }}/> 
                        {
                            currentItem.PROGRESS_TIME > 0 ? 'Continue' : 'Watch Now'
                        }
                    </button>
                    <button className={styles.watchlistButton} onClick={(e) => { e.stopPropagation()  }}> <FiPlus/> </button>
                </div>

                <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{
                        width:  currentItem.TYPE == 1 ? 
                                `${(currentItem.PROGRESS_TIME / currentItem.DURATION)*100}%` : 
                                `${(currentItem.PROGRESS_TIME / currentItem.EPISODE_DURATION)*100}%` 
                    }}/>
                </div>

                <div className={styles.navigateBar}>
                    <button className={styles.navigateButton} onClick={(e) => {e.stopPropagation(); setIndex(index - 1)}}>
                        <IoChevronBack style={{marginRight: '.2rem'}}/>
                    </button>
                    <button className={styles.navigateButton} onClick={(e) => {e.stopPropagation(); setIndex(index + 1)}}>
                    <IoChevronForward style={{marginLeft: '.2rem'}}/>
                    </button>
                </div>
            </div>
        </div>
    )
};

export default Hero;