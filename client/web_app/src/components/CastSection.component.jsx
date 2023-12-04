import { useRef } from 'react';
import { FaCircleUser} from 'react-icons/fa6';

// Components
import NavButtons from './NavButtons.component';

// CSS
import styles from '../styles/CastSection.component.module.css';

const CastSection = ({ data }) => {
    const ref = useRef(null);

    const Item = ({personId, image, character, name}) => {
        return (
            <a className={styles.item} href={`/browse/person/${personId}`}>
                {!image ? <FaCircleUser className={styles.image}/> : <img className={styles.image} src={image}/>}
                <h4 className={styles.name}>{name}</h4>
                <h5 className={styles.character}>{character}</h5>
            </a>    
        )
    };
    if(data && data.length > 0) return (
        <div className={styles.container}>
            <div className={styles.top}>
                <h2 className={styles.topTitle}>Cast</h2>
                <NavButtons scrollRef={ref} items={data}/>
            </div>
            <div className={styles.items} ref={ref}>
                {data.map(i => <Item key={i.PERSON_ID} image={i.PROFILE_IMAGE} personId={i.PERSON_ID} name={i.NAME} character={i.CHARACTER}/>)}
            </div>
        </div>
    );

    else return <></>
};

export default CastSection;