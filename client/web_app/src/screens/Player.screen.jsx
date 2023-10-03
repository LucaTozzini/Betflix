import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import styles from '../styles/Player.screen.module.css';
import { FaArrowLeft, FaPlay, FaPause, FaVolumeLow, FaVolumeOff, FaRegClosedCaptioning, FaClosedCaptioning } from "react-icons/fa6";
import { RiFullscreenLine } from "react-icons/ri";
import { useContext, useEffect } from 'react';

// Contexts
import currentUserContext from '../contexts/currentUser.context';
import serverContext from '../contexts/server.context';

const Player = () => {
    // 
    const { serverAddress } = useContext(serverContext);

    // data 
    const { userId, userPin } = useContext(currentUserContext);
    const { mediaId, episodeId } = useParams();
    const [ episodeData, setEpisodeData ] = useState(null);
    const [ mediaData, setMediaData ] = useState(null);
    const mediaRef = useRef(null);
    const episodeRef = useRef(null);
    const [ nextEpisode, setNextEpisode] = useState(null);
    
    // video
    const [ paused, setPaused ] = useState(true);
    const [ progress, setProgress ] = useState(null);
    const [ timeString, setTimeString ] = useState(null);
    const [ videoSource, setVideoSource ] = useState(null);
    const [ durationString, setDurationString ] = useState(null);
    const [ fullScreen, setFullScreen] = useState(document.fullscreenElement);
    const fillRef = useRef(null);
    const barRef = useRef(null);
    const videoRef = useRef(null);
    const seekRef = useRef(false);
    
    // volume
    const [ mute, setMute ] = useState(() => JSON.parse(window.localStorage.getItem('playerMuted')) || false);
    const [ volume, setVolume ] = useState(() => JSON.parse(window.localStorage.getItem('playerVolume')) || 1);
    const volumeSliderRef = useRef(null);
    const volumeFillRef = useRef(null);
    const setVolumeRef = useRef(false);

    // subtitles
    const trackRef = useRef(null);
    const [ showSubtitles, setShowSubtitles ] = useState(() => window.localStorage.getItem('showSubtitles') === "true");
    const [ subtitlesLanguage, setSubtitlesLanguage ] = useState(null);

    useEffect(() => window.localStorage.setItem('playerMuted', mute), [mute]);
    useEffect(() => window.localStorage.setItem('playerVolume', volume), [volume]);

    // overlay
    let overlayTimeout;
    const [ overlay, setOverlay ] = useState(true);
    const controlsHover = useRef(false);

    // upadte progress
    const updateRef = useRef(true);

    const FetchMedia = async () => {
        const options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, userPin, mediaId }) };
        const response = await fetch(`${serverAddress}/browse/item`, options);
        const json = await response.json();
        setMediaData(json);
    };
    const FetchSource = async () => {
        if(!mediaData) return;
        if(mediaData.TYPE == 1) setVideoSource(`${serverAddress}/player/stream/?type=1&mediaId=${mediaData.MEDIA_ID}`);
        else if(mediaData.TYPE == 2) {
            if(episodeId == 'a') {
                const options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, userPin, mediaId }) };
                const response = await fetch(`${serverAddress}/player/current-episode`, options);
                const json = await response.json();
                setEpisodeData(json);
                setVideoSource(`${serverAddress}/player/stream/?type=2&mediaId=${mediaId}&episodeId=${json.EPISODE_ID}`);
            }
            else {
                const options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ episodeId: Number(episodeId) }) };
                const response = await fetch(`${serverAddress}/browse/episode`, options);
                const json = await response.json();
                setEpisodeData(json);
                setVideoSource(`${serverAddress}/player/stream/?type=2&mediaId=${mediaId}&episodeId=${episodeId}`);
            }
        }
    };

    const FetchResume = async () => {
        const options = mediaData.TYPE == 1 ? 
            { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({userId, userPin, mediaId}) } :
            { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({userId, userPin, episodeId: episodeData.EPISODE_ID}) }

        const response = await fetch(`${serverAddress}/player/resume`, options);
        if(response.status != 200) return;
        const time = await response.json();
        videoRef.current.currentTime = time;
    };

    const FetchNext = async () => {
        const options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({episodeId: Number(episodeId)}) };
        const response = await fetch(`${serverAddress}/player/next`, options);
        const json = await response.json();  
        console.log(json);
        setNextEpisode(json);
    };

    const handleSeek = (e) => {
        if( !seekRef.current || !barRef.current || !videoRef.current ) return;
        const { clientX } = e;
        let perc = (clientX - barRef.current.offsetLeft) / barRef.current.offsetWidth;
        perc = Math.min(1, perc);
        perc = Math.max(0, perc);
        videoRef.current.currentTime = videoRef.current.duration * perc;
        fillRef.current.style.width = `${perc * 100}%`
    };

    const handleVolume = (e) => {
        if(!volumeSliderRef.current || !setVolumeRef.current || !volumeFillRef.current) return;
        const { clientX } = e;
        let perc = (clientX - volumeSliderRef.current.offsetLeft) / volumeSliderRef.current.offsetWidth;
        perc = Math.min(1, perc);
        perc = Math.max(0, perc);
        videoRef.current.volume = perc;
        setVolume(perc);
        volumeFillRef.current.style.width = `${perc * 100}%`;
    }

    const handleTimeString = () => {
        if(videoRef.current){
            const currentTime = videoRef.current.currentTime;
            const hours =  Math.floor(currentTime / 3600);
            let minutes = Math.floor((currentTime - (hours * 3600)) / 60);
            if(minutes < 10) minutes = '0'+minutes;
            let seconds = Math.floor(currentTime - (hours * 3600) - (minutes * 60));
            if(seconds < 10) seconds = '0'+seconds;
            const string = hours > 0 ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`;
            setTimeString(string);

            if(durationString == null) {
                const currentTime = videoRef.current.duration;
                const hours =  Math.floor(currentTime / 3600);
                let minutes = Math.floor((currentTime - (hours * 3600)) / 60);
                if(minutes < 10) minutes = '0'+minutes;
                let seconds = Math.floor(currentTime - (hours * 3600) - (minutes * 60));
                if(seconds < 10) seconds = '0'+seconds;
                const string = hours > 0 ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`;
                setDurationString(string);
            }
        }
    }

    const handleOverlay = () => {
        clearTimeout(overlayTimeout);
        setOverlay(true);
        if(controlsHover.current || setVolumeRef.current || seekRef.current) return;
        overlayTimeout = setTimeout(() => setOverlay(false), 2000);
    }

    const updateContinue = async () => {
        if(!updateRef.current || !mediaRef.current || (mediaRef.current.TYPE == 2 && !episodeRef.current)) return;
        updateRef.current = false;
        const body = JSON.stringify({ 
            userId,
            userPin,
            mediaId,
            episodeId: episodeRef.current ? episodeRef.current.EPISODE_ID : -1,
            progressTime: videoRef.current.currentTime,
            endTime: videoRef.current.duration - videoRef.current.currentTime
        });
        const options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body };
        await fetch(`${serverAddress}/users/update-continue`, options);
        setTimeout(() => { updateRef.current = true }, 3000);
    };

    const fetchSubtitle = async () => {
        try {
            const response = await fetch(`${serverAddress}/player/subtitles?mediaId=${mediaId}&episodeId=${episodeId > 0 ? episodeId : null}&extension=vtt`);
            const text = await response.text();
            console.log(text);
        }
        catch(err) {
            console.error(err.message);
        }
    };

    useEffect(()=>{
        FetchMedia();
        const mouseUp = () => {seekRef.current = false; setVolumeRef.current = false};
        document.body.addEventListener('mouseup', mouseUp);
        document.body.addEventListener('mousemove', handleSeek);
        document.body.addEventListener('mousemove', handleVolume);
        document.body.addEventListener('mousemove', handleOverlay);
        return () => {
            document.body.removeEventListener('mouseup', mouseUp);
            document.body.removeEventListener('mousemove', handleSeek);
            document.body.removeEventListener('mousemove', handleVolume);
            document.body.removeEventListener('mousemove', handleOverlay)
        }
    }, []);

    useEffect(() => {
        if(!mediaData) return;
        mediaRef.current = mediaData;
        FetchSource()
        if(mediaData.TYPE == 1) {
            FetchResume();
            fetchSubtitle();
        }
    }, [mediaData]);

    useEffect(() => {
        if(!episodeData) return;
        episodeRef.current = episodeData;        
        if(mediaData.TYPE == 2) {
            FetchResume();
            FetchNext();
        }
        fetchSubtitle();
    }, [episodeData])
    
    useEffect(() => {
        if(videoRef.current) paused ? videoRef.current.pause() : videoRef.current.play();
    }, [paused]);
    
    useEffect(() => {
        const updateProgress = () => {if(videoRef.current) setProgress(videoRef.current.currentTime / videoRef.current.duration)};
        videoRef.current.addEventListener('timeupdate', updateProgress);
        videoRef.current.addEventListener('timeupdate', updateContinue);
        videoRef.current.addEventListener('timeupdate', handleTimeString);
        videoRef.current.volume = volume;
    }, [videoRef])

    useEffect(() => {
        if(fillRef.current && !seekRef.current) {
            fillRef.current.style.width = `${progress * 100}%`;
        }
    }, [progress]);

    useEffect(() => {
        if(fullScreen) document.body.requestFullscreen();
        else if(document.fullscreenElement) document.exitFullscreen()
    }, [fullScreen]);

    useEffect(() => {
        if(!videoRef.current) return;
        videoRef.current.muted = mute;
    }, [mute]);

    useEffect(() => {
        window.localStorage.setItem('showSubtitles', showSubtitles);
    }, [showSubtitles]);

    return (
        <>
        <video ref={videoRef} src={videoSource} className={styles.video} crossOrigin='anonymous'>
            {/* Add your <track> element here */}
            { showSubtitles ? <track
            ref={trackRef}
            src={`${serverAddress}/player/subtitles?mediaId=${mediaId}&episodeId=${episodeId > 0 ? episodeId : null}&extension=vtt`}
            kind="subtitles"
            srcLang="en"
            label="English"
            default
            /> : <></>}
        </video>

        <div className={styles.overlay} style={{opacity: overlay ? 1 : 0, cursor: overlay ? 'default' : 'none'}}>
            <div className={styles.top}>
                <Link onClick={() => {videoRef.current.pause(); window.history.back()}}>
                    <FaArrowLeft/>
                </Link>
                <Link to={`/browse/item/${mediaId}`}>
                    { episodeData ? `S${episodeData.SEASON_NUM}:E${episodeData.EPISODE_NUM} - ` : <></>}
                    { episodeData ? episodeData.TITLE : mediaData ? mediaData.TITLE : '' }
                </Link>
            </div>

            <div className={styles.middle} onClick={() => setPaused(!paused)}>
                { paused ? <FaPlay className={styles.middlePlay}/> : <FaPause className={styles.middlePlay} size={'4.7rem'}/> }
            </div>

            <div className={styles.controls} onMouseEnter={() => controlsHover.current = true} onMouseLeave={() => controlsHover.current = false}>
                <div className={styles.progressFrame} onMouseUp={(e) => {if(seekRef.current) handleSeek(e)}} onMouseDown={() => seekRef.current = true}>
                    <div className={styles.progressBar} ref={barRef}>
                        <div className={styles.progressFill} ref={fillRef}>
                            <div className={styles.progressKnob}/>
                        </div>
                    </div>
                </div>
                <div className={styles.buttonRow}>
                    <div className={styles.buttonSection}>
                        <button className={styles.volume}>
                            { mute ? <FaVolumeOff size={'2rem'} onClick={() => setMute(false)}/> : <FaVolumeLow size={'2rem'} onClick={() => setMute(true)}/>}
                            <div className={styles.volumeSliderFrame} onMouseUp={(e) => {if(setVolumeRef.current) handleVolume(e)}} onMouseDown={() => setVolumeRef.current = true} ref={volumeSliderRef}>
                                <div className={styles.volumeSlider}>
                                    <div className={styles.volumeFill} style={{width: `${volume*100}%`}} ref={volumeFillRef}>
                                        <div className={styles.volumeKnob}/>
                                    </div>
                                </div>
                            </div>
                        </button>
                        <h3 className={styles.time}>{timeString || '--:--'} / {durationString || '--:--'}</h3>
                    </div>
                    <div className={styles.buttonSection}>
                        <button className={styles.b} onClick={() => setShowSubtitles(!showSubtitles)}>
                            { showSubtitles ? <FaClosedCaptioning/> : <FaRegClosedCaptioning/>}
                        </button>
                        <button className={styles.b} onClick={() => setFullScreen(!fullScreen)}>
                            <RiFullscreenLine/>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        { nextEpisode && videoRef.current && videoRef.current.duration - videoRef.current.currentTime < 60 ?
            <Link className={styles.nextUp} to={`/player/reroute/${nextEpisode.MEDIA_ID}/${nextEpisode.EPISODE_ID}`}>
                <FaPlay/>
                <div>S{ nextEpisode.SEASON_NUM }:E{nextEpisode.EPISODE_NUM} - {nextEpisode.TITLE}</div>
            </Link>
            :<></>
        }

        </>
    );
}

export default Player;