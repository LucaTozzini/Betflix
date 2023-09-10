import { useEffect, useRef, useState } from 'react';
import { FaCircleUser} from 'react-icons/fa6';

// Components
import NavButtons from './NavButtons.component';

// CSS
import styles from '../styles/CastSection.component.module.css';

const CastSection = ({ data }) => {
    const ref = useRef(null);
    const [ scroll, setScroll ] = useState(null);
    useEffect(() => {
        setScroll(ref.current);
    }, [ref.current]);

    const Item = ({image, character, name}) => {
        return (
            <div className={styles.item}>
                {!image ? <FaCircleUser className={styles.image}/> : <img className={styles.image} src={image}/>}
                <h4 className={styles.name}>{name}</h4>
                <h5 className={styles.character}>{character}</h5>
            </div>    
        )
    };

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <h2 className={styles.topTitle}>Cast</h2>
                <NavButtons scroll={scroll} items={data}/>
            </div>
            <div className={styles.items} ref={ref}>
                {data.map(i => <Item key={i.PERSON_ID} image={i.PROFILE_IMAGE} name={i.NAME} character={i.CHARACTER}/>)}
            </div>
        </div>
    );
};

export default CastSection;