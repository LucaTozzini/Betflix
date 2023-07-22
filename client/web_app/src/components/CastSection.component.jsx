import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaAngleLeft, FaAngleRight, FaCircleUser} from 'react-icons/fa6';

// CSS
import { useEffect } from 'react';
import styles from '../styles/CastSection.component.module.css';
import { useRef } from 'react';

const CastSection = ({ data }) => {
    const scrollRef = useRef(null);
    const [ itemWidth, setItemWidth ] = useState(0);
    const [ secondPass, setSecondPass ] = useState(false);
    const [ itemGap, setItemGap ] = useState(0);
    const [ itemsOnPage, setItemsOnPage ] = useState(12);
    const [ scrollIndex, setScrollIndex ] = useState(0);
    const [ scrollEnd, setScrollEnd ] = useState(false);
    const [ tailLength, setTailLength] = useState();

    let debounce;

    const ItemSize = (time) => {
        time = time ? time : 0;
        clearTimeout(debounce);
        debounce = setTimeout(() => {
            let num;
            if(!scrollRef.current) return;
            const width = scrollRef.current.offsetWidth;
            if(width >= 1500) num = 10;
            else if(width >= 1250) num = 8;
            else if(width >= 1000) num = 6;
            else if(width >= 750) num = 5;
            else if(width >= 500) num = 4;
            else num = 3;
    
            const gapSpace = width * 0.15;
            const available = width * 0.85;
            setItemWidth(available / num);
            setItemGap(gapSpace / (num - 1));
            setItemsOnPage(num);

            if(!secondPass) setSecondPass(true);
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
        ItemSize(0);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(TailCalc, [itemsOnPage, itemWidth]);

    useEffect(ChekScrollEnd, [tailLength, scrollIndex]);

    useEffect(ItemSize, [secondPass]);

    const Item = ({image, character, name}) => {
        return (
            <Link>
                <div className={styles.item} style={{width:itemWidth+'px'}}>
                    {!image ? <FaCircleUser className={styles.image} style={{height: (itemWidth)+'px'}}/> : <img className={styles.image} src={image} style={{height: (itemWidth)+'px'}}/>}
                    <h5 className={styles.name}>{name}</h5>
                    <h6 className={styles.character}>{character}</h6>
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
                <h2 className={styles.topTitle}>Cast</h2>
                <div className={styles.buttons}> 
                    <LeftArrow/>
                    <RightArraow/>
                </div>
            </div>
            <div className={styles.items} style={{gap: itemGap+'px'}} ref={scrollRef}>
                {data.map(i => <Item key={i.PERSON_ID} image={i.PROFILE_IMAGE} name={i.NAME} character={i.CHARACTER}/>)}
                <Dud/>
            </div>
        </div>
    );
};

export default CastSection;