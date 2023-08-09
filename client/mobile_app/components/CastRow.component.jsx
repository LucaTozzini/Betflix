import { useContext, useEffect } from 'react';
import { View, StyleSheet, Text, Image, FlatList, TouchableOpacity } from 'react-native';

// Contexts
import themeContext from '../contexts/theme.context';

const z = 'https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg'

const CastRow = ({ title, data }) => {
    const { textColor, sideMargin } = useContext(themeContext);
    const Item = ({ image, name, character }) => <TouchableOpacity style={styles.item}>
        <Image style={styles.image} source={{uri:image || z}}/>
        <Text numberOfLines={1} style={[{color: textColor}, styles.name]}>{name}</Text>
        <Text numberOfLines={1} style={styles.character}>{character}</Text>
    </TouchableOpacity>

    if(data && data.length > 0) return (
        <View style={styles.conatiner}>
            <Text style={[styles.title, {color: textColor, marginHorizontal: sideMargin}]}>{title}</Text>
            <FlatList
            contentContainerStyle={[styles.items, {paddingHorizontal: sideMargin}]}
            horizontal
            data={data}
            renderItem={({item}) => <Item image={item.PROFILE_IMAGE} name={item.NAME} character={item.CHARACTER} />}
            keyExtractor={item => item.PERSON_ID}
            />
        </View> 
    )
};

const styles = StyleSheet.create({
    conatiner: {
        flex: 1
    },
    title: {
        fontSize: 25,
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
    items: {
        gap: 15,
    },
    item: {
        alignItems: 'center',
    },
    image: {
        height: 120,
        width: 120,
        borderRadius: 60,
        backgroundColor: 'gray',
        resizeMode: 'cover'
    },
    name: {
        width: 100,
        textAlign: 'center',
    },
    character: {
        width: 100,
        color: 'gray',
        textAlign: 'center',
    }
});

export default CastRow;
