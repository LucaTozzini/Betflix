import { useContext } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Contexts
import themeContext from '../contexts/theme.context';

const z = 'https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg'

const MediaRow = ({ title, data}) => {
    const { textColor, sideMargin } = useContext(themeContext);
    const navigation = useNavigation();
    
    const Item = ({poster, title, mediaId}) => <TouchableOpacity onPress={() => navigation.navigate('item', { mediaId })}>
        <>
        <Image style={styles.poster} source={{uri:poster || z}}/>
        <Text 
        numberOfLines={1} 
        ellipsizeMode="tail" 
        style={[styles.itemTitle, { color: textColor }]}>{title}</Text>
        </>
    </TouchableOpacity>

    if(data && data.length > 0) return (
        <View style={styles.container}>
            <Text style={[styles.title, {color: textColor, paddingHorizontal: sideMargin}]}>{title}</Text>
            
            <FlatList 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.items, {paddingHorizontal: sideMargin}]}
            horizontal={true}
            style={styles.items}
            data={data}
            renderItem={({item}) => <Item id={item.MEDIA_ID} poster={item.POSTER_S || item.POSTER_NT_S } title={item.TITLE} mediaId={item.MEDIA_ID}/>}
            keyExtractor={item => item.MEDIA_ID}
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
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
    items: {
        // backgroundColor: 'blue',
        gap: 8,
    },
    item: {

    },
    poster: {
        height: size * 1.5,
        width: size,
        resizeMode: 'cover',
        borderRadius: size / 40,
        backgroundColor: 'grey'
    },
    itemTitle: {
        width: size * 0.9,
        fontWeight: '300'
    }
});


export default MediaRow