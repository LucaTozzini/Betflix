import { useContext, useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, Image, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Contexts
import themeContext from '../contexts/theme.context';

const gap = 7;

const MediaRow = ({ title, data }) => {
    const { sideMargin } = useContext(themeContext);
    const { width } = useWindowDimensions();
    const navigation = useNavigation();
    const [ itemWidth, setItemWidth ] = useState(null);
    const [ itemsPerWidth, setItemsPerWidth ] = useState(3);
    

    useEffect(() => {
        const w = (width - ((itemsPerWidth-1) * gap) - (2 * sideMargin)) / itemsPerWidth;
        setItemWidth(w);
    }, [width])
    
    const Item = ({poster, title, mediaId}) => {
        return (
            <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('item', { mediaId })}>
                <>
                <Image style={[styles.poster, { width: itemWidth, height: itemWidth * 1.5, borderRadius: itemWidth * 0.03 }]} source={{uri:poster || null}}/>
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
        gap,
    },
    title: {
        fontSize: 25,
        fontWeight: "bold",
        textTransform: "capitalize",
        color: "white"
    },
    items: {
        gap: 10,
    },
    item: {
        alignItems: "center",
    },
    poster: {
        resizeMode: "cover",
        backgroundColor: "grey",
    },
    itemTitle: {
        maxWidth: size * 0.9,
        fontWeight: "300",
        color: "white",
    }
});


export default MediaRow