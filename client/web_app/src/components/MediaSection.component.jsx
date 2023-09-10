import { useEffect, useRef, useState } from 'react';

// CSS
import styles from '../styles/MediaSection.component.module.css';

// Components
import NavButtons from './NavButtons.component';

const MediaSection = ({ title, items, forceShow }) => {
    const ref = useRef(null);
    const [ scroll, setScroll ] = useState(null);
    
    useEffect(() => {
        setScroll(ref.current);
    }, [ref, ref.current]);

    const Item = ({ title, image, link }) => {
        return (
            <div className={styles.item} onClick={() => window.location.href = link}>
                <img className={styles.itemImage} src={image}/>
                <div className={styles.itemTitle}>{title}</div>
            </div>
        )
    };

    if((items && items.length > 0) || forceShow) return (
        <div className={styles.container}>
            <div className={styles.top}>
                <div className={styles.title}>{title}</div>
                <NavButtons scroll={scroll} items={items}/>
            </div>
            <div className={styles.items} ref={ref}>
                { items ? 
                    items.map(i => 
                        <Item 
                        key={i.MEDIA_ID} 
                        title={i.TITLE} 
                        image={i.POSTER_W_S || i.BACKDROP_S} 
                        link={'/browse/item/' + i.MEDIA_ID}
                        />
                    ) 
                    : 'No Items' 
                }
            </div>
        </div>
    )
}

export default MediaSection