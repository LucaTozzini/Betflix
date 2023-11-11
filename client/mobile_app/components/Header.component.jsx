import { useContext, useState } from 'react';
import { View, StyleSheet, StatusBar, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { useCastState } from 'react-native-google-cast'
import LinearGradient from 'react-native-linear-gradient';

// Icons
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Contexts
import themeContext from '../contexts/theme.context';
import currentUserContext from '../contexts/currentUser.context';
import serverContext from '../contexts/server.context';

// Components
import GoogleCastDevicesModal from './GoogleCastDevicesModal.component';

const Header = ({showHeader, transparent, backButton}) => {
    const { sideMargin } = useContext(themeContext);
    const { userImage } = useContext(currentUserContext);
    const { serverAddress } = useContext(serverContext);
    const navigation = useNavigation();

    const [ modal, setModal ] = useState(false);
    const castState = useCastState();

    if(!showHeader) return null;
    
    return (
        <LinearGradient colors={['black', transparent ? 'rgba(0,0,0,0.7)' : 'black', transparent ? 'transparent' : 'black']} style={[styles.container, { paddingTop: StatusBar.currentHeight + 10, paddingHorizontal: sideMargin, paddingBottom: 6 }]}>
            <GoogleCastDevicesModal show={modal} setShow={setModal} initBackground={true}/>

            {backButton ?
            <TouchableOpacity onPress={navigation.goBack}>
                <MaterialIcons name='arrow-back' size={30} color='white'/>
            </TouchableOpacity>
            :<Image style={styles.logo} source={{uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Netflix_2015_N_logo.svg/1128px-Netflix_2015_N_logo.svg.png'}} />
            }
            <View style={styles.leftSection}>
                <TouchableOpacity style={styles.button} onPress={() => setModal(true)}>
                    {castState == 'connecting' ? 
                        <Image 
                        style={{height: 25, width: 25, objectFit: 'contain'}} 
                        source={{uri: 'https://media.tenor.com/On7kvXhzml4AAAAj/loading-gif.gif'}}
                        />  
                        : 
                        <MaterialIcons name={castState == 'connected' ? "cast-connected" : "cast"} size={25} color="white"/>
                    }
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('selectUser')} style={styles.button}>
                    <Image style={styles.userImage} source={{uri:`${serverAddress}/${userImage}`}}/>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 100
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
        borderRadius: 13,
        backgroundColor: 'red'
    }
});

export default Header;