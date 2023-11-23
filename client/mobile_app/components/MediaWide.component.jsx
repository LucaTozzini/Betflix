import { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ImageBackground, useWindowDimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { isTablet } from 'react-native-device-info';

// Contexts
import themeContext from '../contexts/theme.context';

const gap = 10;

const MediaWide = ({title, data, autoPlay}) => {
    const { sideMargin } = useContext(themeContext);
    const { width } = useWindowDimensions();
    const navigation = useNavigation();
    const [ itemsPerWidth, setItemsPerWidth ] = useState(1);
    const [ itemWidth, setItemWidth ] = useState(null);
    
    const calcItemWidth = () => {
        const w = (width - ((itemsPerWidth-1) * gap) - (2 * sideMargin)) / itemsPerWidth;
        setItemWidth(w);
    };

    const calcItemsPerWidth = () => {
        if(isTablet()) {
            setItemsPerWidth(3);
        }
        else {
            setItemsPerWidth(1);
        }
    };

    useEffect(() => {
        calcItemsPerWidth();
    }, []);

    useEffect(() => {
        calcItemWidth();
    }, [ itemsPerWidth, sideMargin, itemsPerWidth ]);

    const Item = ({title, mediaId, episodeId, progress, image, seasonNum, episodeNum}) => {
        return (
            <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate(autoPlay ? "player" : "item", {mediaId, episodeId})}>
                <View style={{gap: 7}}>
                    <View style={{borderRadius: 7, overflow: "hidden", backgroundColor: "grey"}}>
                        <ImageBackground style={{width: itemWidth, height: itemWidth*0.55}} source={{uri:image}}>
                            <LinearGradient colors={["transparent", "rgba(0,0,0,0.6)"]} style={styles.linearGradient}>
                                {episodeId ? <Text style={styles.itemEpisodeTitle}>S{seasonNum}:E{episodeNum}</Text> : <></>}
                                <View style={{width: "100%", alignItems: "flex-start"}}>
                                    <View style={{width: `${progress}%`, backgroundColor: "orange", height: 5}}/>
                                </View>
                            </LinearGradient>
                        </ImageBackground>
                    </View>
                    <Text numberOfLines={1} style={styles.itemTitle}>{title}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <View style={styles.container}>
            { title ? <Text style={[styles.title, { marginHorizontal: sideMargin }]}>{title}</Text> : <></> }
            <FlatList
            horizontal
            data={data}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.scroll, {paddingHorizontal: sideMargin}]}
            renderItem={({item}) => 
                <Item 
                    title={item.TITLE} 
                    image={(item.TYPE == 2 || item.EPISODE_ID != null) ? item.STILL_S || item.POSTER_W_S || item.BACKDROP_S : item.POSTER_W_S || item.BACKDROP_S} 
                    mediaId={item.MEDIA_ID}
                    episodeId={item.EPISODE_ID}
                    seasonNum={item.SEASON_NUM}
                    episodeNum={item.EPISODE_NUM}
                    progress={item.PROGRESS_TIME / (item.TYPE == 2 ? item.EPISODE_DURATION : item.DURATION) * 100}
                />
            }
            keyExtractor={item => `${item.MEDIA_ID}_${item.EPISODE_ID || 0}`}
            bounces={false}
            />
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        gap
    },
    title: {
        fontSize: 25,
        fontWeight: "bold",
        textTransform: "capitalize",
        color: "white"
    },
    scroll: {
        gap: 10
    },
    linearGradient: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center"
    },
    itemEpisodeTitle: {
        paddingHorizontal: 10,
        color: "white",
        fontSize: 40,
        fontWeight: "bold"
    },
    itemTitle: {
        textAlign: "center",
        color: "white",
        fontSize: 15,
    }
});

export default MediaWide;