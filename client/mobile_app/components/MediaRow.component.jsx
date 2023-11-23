import { useContext, useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, Image, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { isTablet } from 'react-native-device-info';

// Contexts
import themeContext from '../contexts/theme.context';

const gap = 10;

const MediaRow = ({ title, data }) => {
    const { sideMargin } = useContext(themeContext);
    const { width } = useWindowDimensions();

    const navigation = useNavigation();
    const [ itemWidth, setItemWidth ] = useState(null);
    const [ itemsPerWidth, setItemsPerWidth ] = useState(3);

    const calcItemWidth = () => {
        const w = (width - ((itemsPerWidth-1) * gap) - (2 * sideMargin)) / itemsPerWidth;
        setItemWidth(w);
    };

    const calcItemsPerWidth = () => {
        if(isTablet()) {
            setItemsPerWidth(8);
        }
        else {
            setItemsPerWidth(3);
        }
    };

    useEffect(() => {
        calcItemsPerWidth();
    }, []);

    useEffect(() => {
        calcItemWidth();
    }, [ itemsPerWidth, sideMargin, itemsPerWidth ]);
    
    const Item = ({poster, title, mediaId}) => {
        return (
            <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('item', { mediaId })}>
                <>
                <Image style={[styles.poster, { width: itemWidth, height: itemWidth * 1.5, borderRadius: itemWidth * 0.03 }]} source={{uri:poster || null}}/>
                <Text 
                numberOfLines={1} 
                ellipsizeMode="tail" 
                style={[styles.itemTitle, {width: itemWidth * 0.85}]}>{title}</Text>
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
        gap,
    },
    item: {
        alignItems: "center",
    },
    poster: {
        resizeMode: "cover",
        backgroundColor: "grey",
    },
    itemTitle: {
        fontWeight: "300",
        color: "white",
    }
});


export default MediaRow