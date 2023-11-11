import { useContext } from 'react';
import { View, StyleSheet, Text, Image, FlatList, TouchableOpacity } from 'react-native';

// Contexts
import themeContext from '../contexts/theme.context';

const CastRow = ({ title, data }) => {
    const { sideMargin } = useContext(themeContext);
    const Item = ({ image, name, character }) => <TouchableOpacity style={styles.item}>
        { image ? <Image style={styles.image} source={{uri:image}}/> : <View style={styles.image}/> }
        <Text numberOfLines={1} style={styles.name}>{name}</Text>
        <Text numberOfLines={1} style={styles.character}>{character}</Text>
    </TouchableOpacity>

    if(data && data.length > 0) return (
        <View style={styles.conatiner}>
            <Text style={[styles.title, {marginHorizontal: sideMargin}]}>{title}</Text>
            <FlatList
                horizontal
                data={data}
                bounces={false}
                keyExtractor={item => item.PERSON_ID}
                contentContainerStyle={[styles.items, {paddingHorizontal: sideMargin}]}
                renderItem={({item}) => <Item image={item.PROFILE_IMAGE} name={item.NAME} character={item.CHARACTER} />}
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
        color: "white",
        fontWeight: "bold",
        textTransform: "capitalize",
    },
    items: {
        gap: 15,
    },
    item: {
        alignItems: "center",
    },
    image: {
        height: 120,
        width: 120,
        borderRadius: 60,
        backgroundColor: "gray",
        resizeMode: "cover",
    },
    name: {
        width: 100,
        color: "white",
        textAlign: "center",
    },
    character: {
        width: 100,
        color: "gray",
        textAlign: "center",
    }
});

export default CastRow;
