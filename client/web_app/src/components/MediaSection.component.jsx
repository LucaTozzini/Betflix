import { useRef } from 'react';

// CSS
import styles from '../styles/MediaSection.component.module.css';

// Components
import NavButtons from './NavButtons.component';

const MediaSection = ({ title, items, forceShow }) => {
    const scrollRef = useRef(null);

    const Item = ({ title, image, link }) => {
        return (
            <a className={styles.item} href={link}>
                <img className={styles.itemImage} src={image}/>
                <div className={styles.itemTitle}>{title}</div>
            </a>
        )
    };

    if((items && items.length > 0) || forceShow) return (
        <div className={styles.container}>
            <div className={styles.top}>
                <div className={styles.title}>{title}</div>
                <NavButtons scrollRef={scrollRef} items={items}/>
            </div>
            <div className={styles.items} ref={scrollRef}>
                { items ? 
                    items.map(i => 
                        <Item 
                        key={i.MEDIA_ID} 
                        title={i.TITLE} 
                        image={i.POSTER_W_S || i.BACKDROP_S} 
                        link={`/browse/item/${i.MEDIA_ID}`}
                        />
                    ) 
                    : 'No Items' 
                }
            </div>
        </div>
    )
}

export default MediaSection