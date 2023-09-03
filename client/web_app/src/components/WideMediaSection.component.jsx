import { useContext, useEffect, useState, useRef } from 'react';

// CSS
import styles from '../styles/WideMediaSection.component.module.css';

// Contexts
import mediaItemSize from '../contexts/mediaItemSize.context';

const WideMediaSection = ({ title, items, forceShow }) => {
    const { itemWidth, itemsGap, itemsOnPage, mediaScrollRef } = useContext(mediaItemSize);
    const [ wideWidth, setWideWidth ] = useState(null);
    const [ showAll, setShowAll ] = useState(null);
    const [ itemsOverflow, setItemsOverflow ] = useState(false);

    const scrollableRef = useRef(null);

    useEffect(() => {
        console.log(itemsGap, itemWidth)
        const size = (itemWidth * 2) + itemsGap - .2;
        setWideWidth(size);
        if(items) setItemsOverflow(items.length > itemsOnPage / 2)
    }, [ itemWidth, itemsGap, itemsOnPage ]);

    useEffect(() => {
        if(mediaScrollRef.current == null) mediaScrollRef.current = scrollableRef.current;
        else if(mediaScrollRef.current.offsetWidth == 0) mediaScrollRef.current = scrollableRef.current;
    }, []);

    const Item = ({ title, year, image, showTitle, link }) => {
        return (
            <div 
            className={styles.item} 
            onClick={() => window.location.href = link}
            style={{ width: `${wideWidth}px`, height: `${wideWidth * 0.55}px`, backgroundImage: image ? `url(${image})` : null }}
            >
                { showTitle ? <div className={styles.itemOverlay}>{title}</div> : '' }
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <h2>{title}</h2>
                { itemsOverflow ? <button className={styles.button} onClick={() => setShowAll(!showAll)}>{showAll ? 'Show Less' : 'Show All'}</button> : <></> }
            </div>
            <div ref={scrollableRef} className={styles.items} style={{gap: itemsGap, gridTemplateColumns: `repeat(auto-fill, ${wideWidth}px)`, height: showAll ? null : `${wideWidth * 0.55}px`}}>
                { items ? 
                    items.map(i => 
                        <Item 
                        key={i.MEDIA_ID} 
                        title={i.TITLE} 
                        year={i.YEAR} 
                        image={i.POSTER_W_S || i.BACKDROP_S} 
                        showTitle={!i.POSTER_W_S}
                        link={'/browse/item/' + i.MEDIA_ID}
                        />
                    ) 
                    : 'No Items' 
                }
            </div>
        </div>
    )
}

export default WideMediaSection