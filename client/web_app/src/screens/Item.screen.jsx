import { useContext, useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Select from 'react-select';

// Icons
import { FiPlus } from "react-icons/fi";
import { SiThemoviedatabase } from "react-icons/si";
import { IoPlay, IoCheckmarkSharp } from 'react-icons/io5';


// Contexts
import serverContext from '../contexts/server.context';
import MediaSection from '../components/MediaSection.component';
import currentUserContext from '../contexts/currentUser.context';

// CSS
import styles from '../styles/Item.screen.module.css';

// Components
import CastSection from '../components/CastSection.component';
import EpisodesSection from '../components/EpisodesSection.component';

const Item = () => {
    const { serverAddress } = useContext(serverContext);
    const { mediaId } = useParams();
    const { userId, userPin } = useContext(currentUserContext);

    const [ data, setData ] = useState(null);
    const [ added, setAdded ] = useState(false);
    const [ resumeTime, setResumeTime ] = useState(null);
    const [ seasonData, setSeasonData ] = useState(null);
    const [ overviewShow, setOverviewShow ] = useState(false);
    const [ currentSeason, setCurrentSeason ] = useState(null);
    const [ currentEpisode, setCurrentEpisode ] = useState(null);
    const [ moreWith, setMoreWith ] = useState(null);

    const FetchMediaInfo = async () => {
        try{
            const options = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({mediaId, userId})};
            const response = await fetch(`${serverAddress}/browse/item`, options);
            const json = await response.json();
            setAdded(json.IN_WATCHLIST);
            console.log(json);
            setData(json);
        }
        catch(err){
            console.error(err.message);
        }
    };

    const FetchSeasonData = async (seasonNum) => {
        try{
            const options = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({mediaId, userId, seasonNum})};
            const response = await fetch(`${serverAddress}/browse/season`, options);
            const json = await response.json();
            setCurrentSeason(json.SEASON_NUM);
            setSeasonData(json.EPISODES);
        }
        catch(err){
            console.error(err.message);
        }
    };

    const FetchCurrentEpisode = async () => {
        try{
            const options = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({mediaId, userId})};
            const response = await fetch(`${serverAddress}/player/current-episode`, options);
            const json = await response.json();
            setCurrentEpisode(json);
            setCurrentSeason(json.SEASON_NUM);
        }
        catch(err){
            console.error(err.message);
        }
    };

    const FetchResume = async () => {
        const options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({userId, userPin, mediaId}) }

        const response = await fetch(`${serverAddress}/player/resume`, options);
        if(response.status != 200) return;
        const time = await response.json();
        setResumeTime(time);
    };

    const FetchMoreWith = async () => {
        if(data) {
            const len = data.CAST.length; 
            if(len > 0) {
                const max = len >= 3 ? 2 : len - 1; 
                const rand = Math.floor(Math.random() * max);
                const person = data.CAST[rand];
                console.log(person);
                const response = await fetch(`${serverAddress}/browse/filmography?personId=${person.PERSON_ID}&limit=30`);
                const json = await response.json();
                setMoreWith({name: person.NAME, filmography: json.filter(i => i.MEDIA_ID != mediaId)});
            }
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

    useEffect(() => {
        FetchMediaInfo();
        FetchResume();
    }, []);

    useEffect(() => {
        if(data) {
            if(data.TYPE == 2) {
                FetchCurrentEpisode();
            }
            FetchMoreWith();
        } 
    }, [data]);

    useEffect(() => {
        if(currentSeason) FetchSeasonData(currentSeason)
    }, [currentSeason]);

    const InfoBar = () => {
        return (
            <div className={styles.headerInfoBar}>
                { data.VOTE ?
                    <div className={styles.tmdb}>
                        <SiThemoviedatabase/>
                        {Math.trunc(data.VOTE * 10) / 10}
                    </div> : <></>
                }
                <div className={styles.contentRating}>{data.CONTENT_RATING}</div>
            </div>
        );
    };

    const Selector = () => {
        const options = data.AVAILABLE_SEASONS
            .filter(i => i.SEASON_NUM != currentSeason)
            .map(i => ({ 
                value: i.SEASON_NUM, 
                label: `Season ${i.SEASON_NUM}` 
            }));

        const handleChange = (e) => {
            setCurrentSeason(e.value);
        };

        const bClr = 'rgb(40, 40, 40)'
        const customStyles = {
            control: base => ({
                ...base,
                border: 0,
                boxShadow: 'none',
                borderRadius: 0,
                backgroundColor: bClr,
            }),
            placeholder: (provider) => ({
                ...provider,
                color: 'white',
                fontSize: '1.5rem',
            }),
            dropdownIndicator: (provided) => ({
                ...provided,
                color: 'white',
                ':hover': {

                }
            }),
            option: (provided, state) => ({
                ...provided,
                color: 'white', // Set the desired text color here
                borderRadius: 0,
                backgroundColor: 'none',
                fontSize: '1.3rem', 
                ':hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)'
                }
            }),
            menu: (provider) => ({
                ...provider,
                borderRadius: 0,
                backgroundColor: bClr

            }),
            menuList: (provider) => ({
                ...provider,
                padding: 0,
            })
        };
        
        if(data.TYPE == 2 && data.AVAILABLE_SEASONS && data.AVAILABLE_SEASONS.length > 1) return (
            <Select 
            options={options} 
            onChange={handleChange} 
            placeholder={`Season ${currentSeason}`}
            styles={customStyles}
            />
        )
        else return <div/>
    };

    const PlayButtonText = () => {
        if(data.TYPE == 2) {
            if(currentEpisode) {
                return <>S{currentEpisode.SEASON_NUM}:E{currentEpisode.EPISODE_NUM}</>;
            }
        } 
        if(data.TYPE == 1) {
            if(data && resumeTime && resumeTime > 0) {
                const durationTime = data.DURATION;
                const left = durationTime - resumeTime;
                const hr = Math.trunc(left / 3600);
                const mn = Math.trunc((left - (hr * 3600)) / 60);
                const sc = Math.trunc(left - (hr * 3600) - (mn * 60));
                const string = `${hr > 0 ? `${hr}h`:''}${hr > 0 && (mn > 0 || sc > 0) ? ', ' : ''}${mn > 0 ? `${mn}m`:''}${mn > 0 && sc > 0 && mn == 0 && hr == 0 ? ', ' : ''}${sc > 0 && mn == 0 && hr == 0  ? `${sc}s`:''} Left`
                
                return <>Resume <span style={{color: 'gray'}}>{string}</span></>
            }
            else {
                return <>Watch Now</>
            }
        }
    };

    if(data) return (
        <div className={styles.container}>
            <div className={styles.heroSection} style={{backgroundImage: `url(${data.BACKDROP_L})`}}>
                <div className={styles.heroOverlay}>
                    <img className={styles.logo} src={data.LOGO_L} style={{opacity: data.LOGO_L ? 1 : 0}}/>
                    <InfoBar/>
                    {/* <div className={styles.genres}>{data.GENRES.map(i => i.GENRE_NAME).join(' | ').split(' ').map(i => <h3>{i}</h3>)}</div> */}
                    {/* <div className={styles.year}>{data.YEAR}</div> */}
                    <h1 className={styles.title}>{data.TITLE}</h1>
                    <div className={styles.buttonBar}>
                        <Link className={styles.playButton} to={`/player/${data.MEDIA_ID}/a`}>
                            <IoPlay className={styles.playButtonIcon}/>
                            <PlayButtonText/>
                        </Link>
                        <button className={styles.watchlistButton}>
                            { added ?
                                <IoCheckmarkSharp onClick={handleRemove}/>
                                :
                                <FiPlus onClick={handleAdd}/>
                            }
                        </button>
                    </div>
                </div>
            </div>
            <div className={styles.infoSection}>
                
                <div 
                className={styles.overview} 
                onClick={() => setOverviewShow(!overviewShow)}
                style={{ WebkitLineClamp: overviewShow ? 100000 : 2}}
                > 
                    {data.OVERVIEW} 
                </div>
                {data.TYPE == 2 ? <EpisodesSection  Selector={Selector} data={seasonData || []} mediaId={data.MEDIA_ID}/> : <></>}
                {data.CAST.length > 0 ? <CastSection data={data.CAST}/> : <></>}
                {moreWith ? <MediaSection title={`More With: ${moreWith.name}`} items={moreWith.filmography}/> : <></>}
            </div>
        </div>
    );
};

export default Item;