import { useContext } from 'react';
import { FlatList, Text, StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Contexts
import themeContext from '../contexts/theme.context';

const EpisodeRow = ({ title, data }) => {
    const { sideMargin } = useContext(themeContext);
    const navigation = useNavigation();

    const Item = ({mediaId, episodeId, title, still, seasonNum, episodeNum}) => <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('player', {mediaId, episodeId})}>
        <Image style={styles.still} source={{uri:still}}/>
        <Text numberOfLines={1} style={styles.title}>{`S${seasonNum}:E${episodeNum} - ${title}`}</Text>
    </TouchableOpacity>

    return (
        <FlatList
        horizontal
        contentContainerStyle={[styles.items, {paddingHorizontal: sideMargin}]}
        data={data}
        renderItem={({item}) => <Item mediaId={item.MEDIA_ID} episodeId={item.EPISODE_ID} title={item.TITLE} still={item.STILL_S} seasonNum={item.SEASON_NUM} episodeNum={item.EPISODE_NUM}/>}
        keyExtractor={item => item.EPISODE_ID}
        />
    )
};

const styles = StyleSheet.create({
    items: {
        gap: 6
    },
    item: {
        gap: 2
    },
    still: {
        width: 200,
        height: 120,
        borderRadius: 4,
        backgroundColor: "gray",
    },
    title: {
        width: 180,
        color: "white",
    }
});

export default EpisodeRow;