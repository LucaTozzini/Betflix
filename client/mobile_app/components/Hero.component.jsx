import { useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ImageBackground, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

// Contexts
import themeContext from '../contexts/theme.context';

const size = 268;

const Hero = ({title, data}) => {
    const { textColor, sideMargin } = useContext(themeContext);
    const navigation = useNavigation();

    const Item = ({title, mediaId, episodeId, image, logo, episodeTitle, progress}) => 
        <TouchableOpacity style={{alignItems: 'center'}} onPress={() => navigation.navigate('player', { mediaId, episodeId })}>
            <>
            <ImageBackground 
            source={{uri:image}} 
            style={styles.backdrop}
            borderRadius={size / 50}
            >
                <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,.9)']} style={styles.linearGradient}>
                    <Image source={{uri:logo}} style={styles.logo}/>
                    <View/>
                </LinearGradient>
            </ImageBackground>
            <Text numberOfLines={1} style={[styles.itemTitle, {color: textColor}]}>{episodeTitle || title}</Text>
            </>
        </TouchableOpacity>

    if(data && data.length > 0) return (
        <View style={{gap:8}}>
        <Text style={[{color: textColor, marginHorizontal: sideMargin}, styles.title]}>{title}</Text>
        <FlatList
        contentContainerStyle={[styles.container, {paddingHorizontal: sideMargin}]}
        showsHorizontalScrollIndicator={false}
        horizontal={true}
        data={data}
        renderItem={({item}) => <Item title={item.TITLE} mediaId={item.MEDIA_ID} episodeId={item.EPISODE_ID} image={item.STILL_S || item.BACKDROP_S} logo={item.LOGO_S} episodeTitle={item.TYPE == 2 ? `S${item.SEASON_NUM}:E${item.EPISODE_NUM} - ${item.EPISODE_TITLE}` : null}/>}
        keyExtractor={item => item.MEDIA_ID}
        />
        </View>
    )
};

const styles = StyleSheet.create({
    title: {
        fontSize: 25,
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
    container: {
        gap: 6
    },
    backdrop: {
        width: size,
        height: size / 1.5,
        resizeMode: 'cover',
    },
    linearGradient: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        borderRadius: size / 50
    },
    logo: {
        marginVertical: size * 0.03,
        height: size / 5,
        width: size * 0.9,
        resizeMode: 'contain',
    },
    itemTitle: {
        fontSize: 15,
        textAlign: 'center',
        width: '70%'
    }
});

export default Hero