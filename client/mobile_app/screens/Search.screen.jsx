import { useState, useContext } from 'react';
import { View, Text, SafeAreaView, TextInput, StyleSheet, TouchableOpacity, FlatList, StatusBar } from 'react-native';

import FontAwesome5 from 'react-native-vector-icons/dist/FontAwesome5';
import { useNavigation } from '@react-navigation/native';

// Contexts
import themeContext from '../contexts/theme.context';
import serverContext from '../contexts/server.context';

// Hooks
import Authenticator from '../hooks/Authenticator.hook';

const Search = () => {
    const { sideMargin, textColor } = useContext(themeContext);
    const { serverAddress } = useContext(serverContext);
    const [ searchMedia, setSearchMedia ] = useState(null);
    const [ canSearch, setCanSearch ] = useState(true);

    let searchTimeout;
    const navigation = useNavigation();


    const handleSearch = async (text) => {
        try {
            clearTimeout(searchTimeout)
            const search = async () => {
                try{
                    const response = await fetch(`${serverAddress}/browse/search?value=${text}`);
                    const json = await response.json();
                    setSearchMedia(json);
                }
                catch(err) {
                    setSearchMedia([]);
                }
            }

            searchTimeout = setTimeout(search, 500);
        }
        catch(err) {

        }
    };

    const Item = ({ mediaId, title, year }) => 
        <TouchableOpacity style={[styles.item, { paddingHorizontal: sideMargin }]} onPress={() => navigation.navigate('item', { mediaId })}>
            <FontAwesome5 name="search" color='white'/>
                <Text style={{color: textColor, fontSize: 18, flex: 1}}>{title} ({year})</Text>
        </TouchableOpacity>

    return (
        <SafeAreaView>
            <Authenticator/>
            <View style={{marginHorizontal: sideMargin, flexDirection: 'row', gap: 10, alignItems: 'center'}}>
                <TouchableOpacity onPress={navigation.goBack}>
                    <FontAwesome5 name="arrow-left" color="white" size={20}/>
                </TouchableOpacity>
                <TextInput 
                style={styles.input}
                placeholder='Search media...'
                placeholderTextColor={'rgb(180, 180, 180)'}
                cursorColor={'rgb(0, 100, 255)'}
                onChangeText={handleSearch}
                />
            </View>

            <FlatList
            data={searchMedia}
            renderItem={({item}) => <Item mediaId={item.MEDIA_ID} title={item.TITLE} year={item.YEAR}/>}
            />
            
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        paddingVertical: 5,
        paddingHorizontal: 20,
        borderRadius: 30,
        fontSize: 20,
        color: 'white',
        flex: 1,
        fontWeight: '500',
        marginVertical: 10 
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        paddingVertical: 10,
    },
});

export default Search;