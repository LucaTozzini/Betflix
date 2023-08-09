import { useContext, useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import LinesEllipsis from 'react-lines-ellipsis'

// Icons
import { IoPlay, IoCheckmarkSharp, IoChevronDownOutline, IoChevronUpOutline } from 'react-icons/io5';
import { IoStar } from 'react-icons/io5';
import { FiPlus } from "react-icons/fi";

// Contexts
import currentUserContext from '../contexts/currentUser.context';
import serverContext from '../contexts/server.context';

// CSS
import styles from '../styles/Item.screen.module.css';

// Components
import CastSection from '../components/CastSection.component';
import EpisodesSection from '../components/EpisodesSection.component';

const Item = () => {
    const { serverAddress } = useContext(serverContext);
    const { mediaId } = useParams();
    const { userId, userPin } = useContext(currentUserContext);
    
    const filterRef = useRef(null);
    const overviewRef = useRef(null);

    const [ data, setData ] = useState(null);
    const [ added, setAdded ] = useState(false);
    const [ overviewShow, setOverviewShow ] = useState(false);
    const [ overviewOverflow, setOverviewOverflow ] = useState();
    const [ currentSeason, setCurrentSeason ] = useState(null)
    const [ seasonData, setSeasonData ] = useState(null);

    const FetchMediaInfo = async () => {
        try{
            const options = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({mediaId, userId})}
            const response = await fetch(`${serverAddress}/browse/item`, options);
            const json = await response.json();
            setAdded(json.IN_WATCHLIST);
            setData(json);
        }
        catch(err){
            console.error(err.message);
        }
    };

    const FetchSeasonData = async (seasonNum) => {
        try{
            const options = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({mediaId, userId, seasonNum})}
            const response = await fetch(`${serverAddress}/browse/season`, options);
            const json = await response.json();
            console.log(json)
            setCurrentSeason(json.SEASON_NUM);
            setSeasonData(json.EPISODES);
        }
        catch(err){
            console.error(err.message);
        }
    };

    const FetchCurrentEpisode = async () => {
        try{
            const options = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({mediaId, userId})}
            const response = await fetch(`${serverAddress}/player/current-episode`, options);
            const json = await response.json();
            setCurrentSeason(json.SEASON_NUM);
        }
        catch(err){
            console.error(err.message);
        }
    };

    const handleAdd = async () => {
        try{
            const options = {method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({mediaId, userId, userPin})};
            const response = await fetch(`${serverAddress}/watchlist/add`, options);
            if(response.status == 201){
                setAdded(true);
            }
        }
        catch(err){
            console.error(err.message);
        }
    };

    const handleRemove = async () => {
        try{
            const options = {method: 'DELETE', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({mediaId, userId, userPin})};
            const response = await fetch(`${serverAddress}/watchlist/remove`, options);
            if(response.status == 202) setAdded(false);
        }
        catch(err){
            console.error(err.message);
        }
    };

    const overviewCheck = () => {
        if(!overviewRef.current) return;
        if(overviewShow) setOverviewOverflow(true);
        else setOverviewOverflow(overviewRef.current.clamped);
    };

    const handleScroll = () => {
        if(!filterRef.current) return;
        const css = filterRef.current.style;
        const scroll = document.getElementById('root').scrollTop;
        const value = Math.min(1, (1 / 200) * scroll);
        css.backdropFilter = `blur(${value}rem) grayscale(${value /2})`

    };

    useEffect(() => {
        FetchMediaInfo();
        overviewCheck();
        handleScroll();
        window.addEventListener('resize', overviewCheck);
        document.getElementById('root').addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('resize', overviewCheck);
            document.getElementById('root').removeEventListener('scroll', handleScroll);
        }
    }, []);

    useEffect(() => {if(data && data.TYPE == 2) FetchCurrentEpisode()}, [data]);

    useEffect(() => {if(currentSeason) FetchSeasonData(currentSeason)}, [currentSeason]);

    if(data) return (
        <div className={styles.container}>
            <div className={styles.backdrop} style={{backgroundImage: `url(${data.BACKDROP_L})`}}>
                <div className={styles.backdropFilter} ref={filterRef}>
                    <div className={styles.main}>
                        <img className={styles.logo} src={data.LOGO_L} style={{opacity: data.LOGO_L ? 1 : 0}}/>
                        <div className={styles.genres}>{data.GENRES.map(i => i.GENRE_NAME).join(' | ').split(' ').map(i => <h3>{i}</h3>)}</div>
                        <h1 className={styles.title}>{data.TITLE}</h1>
                        <div className={styles.infoBar}>
                            <h3>{data.YEAR}</h3>
                            <h3>|</h3>
                            <div style={{display: 'flex', alignItems: 'center', gap: '.2rem'}}>
                                <h3>{Math.trunc(data.VOTE * 10)}</h3>
                                <IoStar/>
                            </div>
                            <h3>|</h3>
                            <h3>{data.CONTENT_RATING}</h3>
                        </div>
                        
                        <LinesEllipsis
                            className={styles.overview}
                            text={data.OVERVIEW}
                            maxLine={overviewShow ? 100000 : 2}
                            ellipsis='...'
                            trimRight
                            basedOn='words'
                            ref={overviewRef}
                            onReflow={overviewCheck}
                        />
                        
                        { overviewOverflow ?  
                            <button className={styles.overviewButton} onClick={() => setOverviewShow(!overviewShow)}>
                                { overviewShow ? <>Less <IoChevronUpOutline size={25}/> </> : <>More <IoChevronDownOutline size={25}/> </> }
                            </button>
                            : <></>
                        }

                        <div className={styles.buttonBar}>
                            <Link className={styles.playButton} to={`/player/${data.MEDIA_ID}/a`}>
                                <IoPlay size={'1.8rem'}/>
                                Watch Now
                            </Link>
                            <button className={styles.watchlistButton}>
                                { added ?
                                    <IoCheckmarkSharp size={30} onClick={handleRemove}/>
                                    :
                                    <FiPlus size={35} onClick={handleAdd}/>
                                }
                            </button>
                        </div>
                        { data.TYPE == 2 && data.AVAILABLE_SEASONS && data.AVAILABLE_SEASONS.length > 1 ?
                        <select className={styles.seasonSelect} value={currentSeason} onChange={(e) => setCurrentSeason(e.target.value)}>
                            { data.AVAILABLE_SEASONS.map(i => <option key={i.SEASON_NUM} value={i.SEASON_NUM}> Season {i.SEASON_NUM} </option>
                            )}
                        </select> : <></>
                        }
                        {data.TYPE == 2 ? <EpisodesSection data={seasonData || []} mediaId={data.MEDIA_ID}/> : <></>}
                        {data.CAST.length > 0 ? <CastSection data={data.CAST}/> : <></>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Item;