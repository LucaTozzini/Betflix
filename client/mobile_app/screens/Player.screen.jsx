import { useContext, useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, StatusBar, ImageBackground, Image } from 'react-native';

import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { hideNavigationBar, showNavigationBar } from 'react-native-navigation-bar-color';
import { useRemoteMediaClient, useMediaStatus, useCastState, useStreamPosition } from 'react-native-google-cast';

// Icons
import FontAwesome5 from 'react-native-vector-icons/dist/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/dist/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Contexts
import serverContext from '../contexts/server.context';
import currentUserContext from '../contexts/currentUser.context';

// Hooks
import Authenticator from '../hooks/Authenticator.hook';


// Components
import Header from '../components/Header.component';
import Loading from '../components/Loading.component';
import GoogleCastDevicesModal from '../components/GoogleCastDevicesModal.component';

const Player = ({ route }) => {
    const castState = useCastState();
    const navigation = useNavigation();
    const mediaStatus = useMediaStatus();
    const client = useRemoteMediaClient();
    const streamPosition = useStreamPosition();
    const { mediaId, episodeId } = route.params;
    const { serverAddress } = useContext(serverContext);
    const { userId, userPin } = useContext(currentUserContext);
    
    const [canUpdate, setCanUpdate] = useState(true);
    const [ mediaData, setMediaData] = useState(null);
    const [ episodeData, setEpisodeData ] = useState(null);
    const [ nextEpisode, setNextEpisode ] = useState(null);   
    
    // Player states
    const videoRef = useRef(null);
    const [ paused, setPaused ] = useState(false);
    const [ resumeTime, setResumeTime ] = useState(null);
    const [ currentTime, setCurrentTime ] = useState(null);
    const [ durationTime, setDurationTime ] = useState(null);
    const [ showSubtitles, setShowSubtitles ] = useState(false);
    const [ subtitlesLanguage, setSubtitlesLanguage ] = useState('en');
    
    // UI states
    const hideTime = 5000;
    const [ castModal, setCastModal ] = useState(false);
    const [ showControls, setShowControls ] = useState(true);
    const [ totalTimeString, setTotalTimeString ] = useState(null);
    const [ currentTimeString, setCurrentTimeString ] = useState(null);
    const [ controlsTimeout, setControlsTimeout ] = useState(() => setTimeout(() => setShowControls(false), hideTime));

    const FetchItem = async () => {
        try{
            const options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({mediaId, userId, userPin}) };
            const response = await fetch(`${serverAddress}/browse/item`, options);
            const json = await response.json();
            setMediaData(json);
        }
        catch(err){

        }
    };

    const FetchEpisode = async () => {
        try{
            const options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({episodeId, userId, userPin}) };
            const response = await fetch(`${serverAddress}/browse/episode`, options);
            const json = await response.json();
            setEpisodeData(json);
        }
        catch(err){
            
        }
    };

    const FetchCurrentEpisode = async () => {
        try {
            const options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({mediaId, userId, userPin}) };
            const response = await fetch(`${serverAddress}/player/current-episode`, options);
            const json = await response.json();
            setEpisodeData(json);
        }
        catch(err) {

        }
    };

    const FetchResume = async () => {
        try {
            const options = mediaData.TYPE == 1 ? 
            { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({userId, userPin, mediaId}) } :
            { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({userId, userPin, episodeId: episodeData.EPISODE_ID}) }
            const response = await fetch(`${serverAddress}/player/resume`, options);
            const json = await response.json();
            setResumeTime(json);
        }
        catch(err) {

        }
    };

    const FetchNext = async () => {
        try {
            const options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({episodeId: episodeData.EPISODE_ID}) };
            const response = await fetch(`${serverAddress}/player/next-episode`, options);
            const json = await response.json();
            setNextEpisode(json);
        }
        catch(err) {

        }
    };

    const updateContinue = async () => {
        if(canUpdate && !paused && currentTime) {
            try {
                const body = {
                    userId, 
                    userPin, 
                    mediaId: mediaData.MEDIA_ID, 
                    episodeId: episodeData ? episodeData.EPISODE_ID : -1,
                    progressTime: currentTime,
                    endTime: durationTime - currentTime
                };
                const options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
                await fetch(`${serverAddress}/users/update-continue`, options);
                setCanUpdate(false);
                setTimeout(() => setCanUpdate(true), 1000);
            }
            catch(err) {
                setCanUpdate(true);
            }
        }
    };
    
    const handleLoad = (e) => {
        setDurationTime(e.duration); 
        videoRef.current.seek(currentTime || resumeTime);
    };

    const handleProgress = (e) => {
        setCurrentTime(e.currentTime);
        updateContinue();
    };

    const handleSkipForw = () => {
        if(!currentTime) return;
        videoRef.current.seek(currentTime + 15);  
    };

    const handleSkipBack = () => {
        if(!currentTime) return;
        videoRef.current.seek(currentTime - 15);
    };

    const handlePressIn = () => {
        clearTimeout(controlsTimeout);
    };

    const handlePressOut = () => {
        const timeout = setTimeout(() => setShowControls(false), hideTime);
        setControlsTimeout(timeout);
    };

    const handleSeek = (time) => {
        if(videoRef.current) {
            videoRef.current.seek(time);
        }
    };

    const handleCastSeek = async (position) => {
        try {
            if(client) await client.seek({position});
        }
        catch(err) {

        }
    };

    const handleCastSkipFrw = async () => {
        try {
            if(client) await client.seek({ relative: true, position: 15 })
        }
        catch(err) {

        }
    };

    const handleCastSkipBack = async () => {
        try {
            if(client) await client.seek({ relative: true, position: -15 })
        }
        catch(err) {

        }
    };

    const handleStartCast = async () => {
        if(castState == 'connected' && resumeTime >= 0 && client && mediaData && mediaData.TYPE && (mediaData.TYPE == 1 || episodeData)) {
            const videoUrl = `${serverAddress}/player/video?type=${mediaData.TYPE}&mediaId=${mediaId}&episodeId=${episodeData ? episodeData.EPISODE_ID : -1}`;
            try {
                await client.loadMedia({
                    autoplay: true,
                    mediaInfo: {
                        contentUrl: videoUrl,
                    },
                    startTime: currentTime || resumeTime
                });
            }
            catch(err) {

            }
        }
    };

    const handleCastPausePlay = async () => {
        if(client) {
            try {
                if(paused) await client.pause();
                else await client.play();
            }
            catch(err) {

            }
        }
    };

    useEffect(() => {
        FetchItem();
        return () => {
            showNavigationBar();
        }
    }, []);

    useEffect(() => {
        if(castState != 'connected') hideNavigationBar();
        else showNavigationBar();
        setPaused(false);
    }, [castState]);
    
    useEffect(() => {
        if(!mediaData) return;
        if(mediaData.TYPE == 2) episodeId ? FetchEpisode() : FetchCurrentEpisode();
        else FetchResume();
    }, [mediaData]);
    
    useEffect(() => {
        if(!episodeData) return;
        FetchNext();
        FetchResume();
    }, [episodeData]);

    useEffect(() => {
        if(!durationTime) return;
        const totalHour = Math.floor(durationTime / 3600);
        const totalMinute = ('0' + Math.floor((durationTime - (totalHour * 3600)) / 60)).slice(-2);
        const totalSecond = ('0' + Math.floor(durationTime - (totalMinute * 60) - (totalHour * 3600))).slice(-2);
        const totalString = `${totalHour > 0 ? `${totalHour}:` : ''}${totalMinute}:${totalSecond}`;
        setTotalTimeString(totalString);
    }, [durationTime]);

    useEffect(() => {
        if(!currentTime) return;
        const currentHour = Math.floor(currentTime / 3600);
        const currentMinute = ('0' + Math.floor((currentTime - (currentHour * 3600)) / 60)).slice(-2);
        const currentSecond = ('0' + Math.floor(currentTime - (currentMinute * 60) - (currentHour * 3600))).slice(-2);
        const currentString = `${currentHour > 0 ? `${currentHour}:` : ''}${currentMinute}:${currentSecond}`;
        setCurrentTimeString(currentString);
    }, [currentTime]);

    useEffect(() => {
        handleCastPausePlay();
    }, [paused, client]);

    useEffect(() => {
        handleStartCast();
    }, [resumeTime, castState, client, mediaData, episodeData]);

    useEffect(() => {
        if(mediaStatus && !durationTime) {
            setDurationTime(mediaStatus.mediaInfo.streamDuration);
        }
    }, [mediaStatus])

    useEffect(() => {
        if(streamPosition) {
            setCurrentTime(streamPosition);
            updateContinue();
        }
    }, [streamPosition]);
    
    if(resumeTime >= 0 && mediaData && mediaData.TYPE && (mediaData.TYPE == 1 || episodeData)) {
        const videoUrl = `${serverAddress}/player/video?type=${mediaData.TYPE}&mediaId=${mediaId}&episodeId=${episodeData ? episodeData.EPISODE_ID : -1}`;

        if(["noDevicesAvailable", "notConnected"].includes(castState)) return (
            <>
            <GoogleCastDevicesModal show={castModal} setShow={setCastModal} initBackground={false}/>
            <Authenticator/>
            <StatusBar hidden/>
            <Video
            ref={videoRef}
            source={{uri: videoUrl}}
            style={styles.video}
            onLoad={handleLoad}
            onProgress={handleProgress}
            paused={paused}
            selectedTextTrack={{type: 'language', value: subtitlesLanguage}}
            textTracks={ !showSubtitles ? null :
                [{
                    language: subtitlesLanguage,
                    type: 'text/vtt',
                    uri: `${serverAddress}/player/subtitles?mediaId=${mediaId}&episodeId=${episodeData ? episodeData.EPISODE_ID : null}&extension=vtt`,
                }]
            }
            />
            <TouchableOpacity activeOpacity={.8} style={styles.overlay} onPress={() => setShowControls(!showControls)} onPressIn={handlePressIn} onPressOut={handlePressOut}>
                { showControls ? <>
                <LinearGradient colors={['black', 'transparent']} style={[styles.overlaySection, { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start', paddingHorizontal: 15, paddingTop: 10,  }]}>
                    <TouchableOpacity onPress={navigation.goBack}>
                        <FontAwesome5 name="arrow-left" color="white" size={20}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={{paddingHorizontal: 20, maxWidth: 300}} onPress={() => navigation.navigate('item', { mediaId })}>
                        <Text numberOfLines={1} style={styles.title}>{mediaData.TITLE}</Text>
                        { episodeData ? <Text numberOfLines={1} style={styles.episodeTitle}>S{episodeData.SEASON_NUM}:E{episodeData.EPISODE_NUM} - {episodeData.TITLE}</Text> : <></>}
                    </TouchableOpacity>
                    <View style={styles.buttonsTop}>
                        <TouchableOpacity onPress={() => {setShowSubtitles(!showSubtitles)}}>
                            <MaterialCommunityIcons name={showSubtitles ? "subtitles" : "subtitles-outline"} color="white" size={28}/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {setCastModal(true); setPaused(true)}}>
                            <MaterialIcons name="cast" color="white" size={25}/>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                <View style={[styles.overlaySection, { flexDirection: 'row', gap: 35 }]}>
                    <TouchableOpacity style={styles.buttonSmall} onPress={handleSkipBack} onPressIn={handlePressIn} onPressOut={handlePressOut}>
                        <MaterialCommunityIcons name="rewind-15" size={20} color="white"/>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => setPaused(!paused)} onPressIn={handlePressIn} onPressOut={handlePressOut}>
                        <FontAwesome5 name={paused ? "play" : "pause"} size={30} color="white"/>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonSmall} onPress={handleSkipForw} onPressIn={handlePressIn} onPressOut={handlePressOut}>
                        <MaterialCommunityIcons name="fast-forward-15" size={20} color="white"/>
                    </TouchableOpacity>
                </View>

                <LinearGradient colors={['transparent', 'black']} style={[styles.overlaySection, { justifyContent: 'flex-end', paddingBottom: 30, gap: 6 }]}>
                    <Slider 
                    style={styles.slider} 
                    thumbTintColor='orange'
                    minimumTrackTintColor='orange'
                    maximumTrackTintColor='rgba(255, 255, 255, 0.7)'

                    minimumValue={0} 
                    maximumValue={durationTime} 
                    value={currentTime}
                    step={0.1}

                    onValueChange={handleSeek}
                    onPressIn={handlePressIn} 
                    onPressOut={handlePressOut}
                    />

                    <View style={styles.timeContainer}>
                        <Text style={styles.time}>{currentTimeString}</Text>
                        <Text style={[styles.time, {color: 'rgb(150, 150, 150)'}]}>/{totalTimeString}</Text>
                    </View>
                </LinearGradient>
                </> : <></>}
            </TouchableOpacity>
            </>
        )

        else {
            return (
                <>
                <Header showHeader expandHeader={false}/>
                <GoogleCastDevicesModal show={castModal} setShow={setCastModal} initBackground={false}/>
                <StatusBar translucent={false} backgroundColor={'black'}/>
                <ImageBackground source={{uri:mediaData.POSTER_NT_L || mediaData.BACKDROP_L}} style={castStyles.container}>
                    <LinearGradient colors={['black', 'transparent', 'black']} style={castStyles.linearGradient}>
                        <View style={castStyles.topBar}>
                            <TouchableOpacity onPress={navigation.goBack}>
                                <FontAwesome5 name="arrow-left" color="white" size={20}/>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setCastModal(true)}>
                                <MaterialIcons name="cast-connected" color='white' size={25}/>
                            </TouchableOpacity>    
                        </View>
                        <View style={castStyles.controls}>
                            <TouchableOpacity style={styles.buttonSmall} onPress={handleCastSkipBack}>
                                <MaterialCommunityIcons name="rewind-15" size={20} color="white"/>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.button} onPress={() => setPaused(!paused)}>
                                {!mediaStatus || ['loading', 'buffering'].includes(mediaStatus.playerState) ? <Image style={{height: 30, width: 30, objectFit:'contain' }} source={{uri: 'https://media.tenor.com/On7kvXhzml4AAAAj/loading-gif.gif'}}/> : <FontAwesome5 name={paused ? "play" : "pause"} size={30} color="white"/>}
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.buttonSmall} onPress={handleCastSkipFrw}>
                                <MaterialCommunityIcons name="fast-forward-15" size={20} color="white"/>
                            </TouchableOpacity>
                        </View>
                        <Slider
                        style={{width: '100%'}}
                        thumbTintColor='orange'
                        minimumTrackTintColor='orange'
                        maximumTrackTintColor='rgba(255, 255, 255, 0.7)'
    
                        minimumValue={0} 
                        maximumValue={mediaStatus ? mediaStatus.mediaInfo.streamDuration : 0} 
                        value={streamPosition}
                        step={0.1}
    
                        onValueChange={handleCastSeek}
                        />
                    </LinearGradient>
                </ImageBackground>
                </>
            )
        } 
    }
    else {
        return <Loading/>
    }
};

const styles = StyleSheet.create({
    video: {
        position: 'absolute',
        height: '100%',
        width: '100%',
    },
    overlay: { 
        flex: 1,
    },
    overlaySection: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        color: 'white',
        fontSize: 17
    },
    episodeTitle: {
        color: 'rgb(190, 190, 190)',
        fontSize: 14
    },
    buttonsTop: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 15,
        alignItems: 'center'
    },
    button: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        height: 70,
        width: 70,
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonSmall: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        height: 50,
        width: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeContainer: {
        flexDirection: 'row',
        width: '100%',
        marginLeft: 30,
    },
    time: {
        fontSize: 13,
        color: 'white',
        fontFamily: 'monospace',
    },
    slider: {
        width: '100%'
    }
});

const castStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    linearGradient: {
        flex: 1,
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',

    },
    controls: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 30
    },
    slider: {
        width: '100%',
    }
});

export default Player;