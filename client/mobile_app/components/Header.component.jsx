import { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, StatusBar, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/AntDesign';

// Contexts
import themeContext from '../contexts/theme.context';
import currentUserContext from '../contexts/currentUser.context';
import serverContext from '../contexts/server.context';

const Header = () => {
    const { backgroundColor, sideMargin, textColor } = useContext(themeContext);
    const { userData } = useContext(currentUserContext);
    const { serverAddress } = useContext(serverContext);
    const [ show, setShow ] = useState(true);
    const [ expand, setExpand ] = useState(true);
    const [ route, setRoute ] = useState(null);
    
    const navigation = useNavigation();

    useEffect(() => {
        const handleChange = () => {
        const name = navigation.getCurrentRoute().name;
        setRoute(name);
        };
        navigation.addListener('state', handleChange);
    }, []);

    useEffect(() => {
        setShow(!['player', 'item'].includes(route));
        setExpand(['browse'].includes(route))
    }, [route]);
    

    if(!show) return null;
    else if(!expand) return <View style={[styles.container, { paddingTop: StatusBar.currentHeight, backgroundColor }]}/>
    
    return (
        <View style={[styles.container, { paddingTop: StatusBar.currentHeight + 10, backgroundColor, paddingHorizontal: sideMargin, paddingBottom: 6 }]}>
            <Image style={styles.logo} source={{uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Netflix_2015_N_logo.svg/1128px-Netflix_2015_N_logo.svg.png'}} />
            <View style={styles.leftSection}>
                <TouchableOpacity onPress={() => navigation.navigate('search')} style={styles.button}>
                    <Icon name="search1" color={textColor} size={25}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('selectUser')} style={styles.button}>
                    <Image style={styles.userImage} source={{uri:`${serverAddress}/${userData?userData.USER_IMAGE: ''}`}}/>
                </TouchableOpacity>
            </View>
        </View>
    )
    

};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    logo: {
        height: 30,
        width: 18,
        resizeMode: 'cover',
    },
    leftSection: {
        flexDirection: 'row', 
        alignItems: 'center',
        gap: 25,
    },
    button: {
        height: 30,
        width: 30,
        alignItems: 'center',
        justifyContent: 'center'
    },
    userImage: {
        height: 26,
        width: 26,
        borderRadius: 13
    }
});

export default Header;