import { useContext } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Contexts
import themeContext from '../contexts/theme.context';

const MediaRow = ({ title, data }) => {
    const { sideMargin } = useContext(themeContext);
    const navigation = useNavigation();
    
    const Item = ({poster, title, mediaId}) => {
        return (
            <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('item', { mediaId })}>
                <>
                <Image style={styles.poster} source={{uri:poster || null}}/>
                <Text 
                numberOfLines={1} 
                ellipsizeMode="tail" 
                style={[styles.itemTitle]}>{title}</Text>
                </>
            </TouchableOpacity>
        );
    }

    if(data && data.length > 0) return (
        <View style={styles.container}>
            <Text style={[styles.title, {paddingHorizontal: sideMargin}]}>{title}</Text>
            
            <FlatList 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.items, {paddingHorizontal: sideMargin}]}
            horizontal={true}
            style={styles.items}
            data={data}
            renderItem={({item}) => <Item id={item.MEDIA_ID} poster={item.POSTER_S || item.POSTER_NT_S } title={item.TITLE} mediaId={item.MEDIA_ID}/>}
            keyExtractor={item => item.MEDIA_ID}
            bounces={false}
            />

        </View>
    )
};

const size = 100;
const styles = StyleSheet.create({
    container: {
        gap: 7,
    },
    title: {
        fontSize: 25,
        fontWeight: "bold",
        textTransform: "capitalize",
        color: "white"
    },
    items: {
        gap: 8,
    },
    item: {
        alignItems: "center",
    },
    poster: {
        height: size * 1.5,
        width: size,
        resizeMode: "cover",
        borderRadius: size / 40,
        backgroundColor: "grey",
    },
    itemTitle: {
        maxWidth: size * 0.9,
        fontWeight: "300",
        color: "white",
    }
});


export default MediaRow