import { useEffect, useState, useRef } from "react";
import { Text, View, StyleSheet, TextInput } from "react-native";
import { getData } from '../helpers/asyncStorage.helper';


const SearchAddress = ({ setServerAddress, setAddressValid }) => {
    const [ subNet, setSubNet ] = useState(0);
    const [ currHost, setCurrHost ] = useState('---');
    const subNetRef = useRef(null);
    useEffect(() => {subNetRef.current = subNet}, [subNet])

    const isAddress = (addr) => {
        fetch(`${addr}/ciao`).then(async (data) => {
            const text = await data.text();
            if(text == 'yellow'){
                setServerAddress(addr)
                setAddressValid(true);
            };
        }).catch((err) => {});
    };

    const loop = async () => {
        const curr = subNet;
        const lastAddress = await getData("serverAddress");
        isAddress(lastAddress);
        await new Promise (res => setTimeout(res, 1000)); 

        for(let i = 0; i <= 255 ; i++) {
            if(i % 10 == 0) setCurrHost(i);
            if(curr != subNetRef.current) break;
            isAddress(`http://192.168.${subNet}.${i}:2000`);
            await new Promise (res => setTimeout(res, 100)); 
        }
    };

    const onChange = (e) => {
        const text = e.nativeEvent.text;
        const int = parseInt(text);
        if(!isNaN(int) && int <= 255 && int >= 0) {
            setSubNet(int)
        }
    };

    useEffect(() => {
        loop();
    }, [subNet]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Searching...</Text>
            <View style={styles.inline}>
                <Text style={styles.text}>192.168.</Text>
                <TextInput style={styles.input} keyboardType="numeric" defaultValue="0" textAlign="center" onChange={onChange}/>
                <Text style={styles.text}>.{currHost}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        alignItems: 'center'
    },
    title: {
        color: 'white',
        fontSize: 20
    },
    inline: {
        flexDirection: 'row'
    }, 
    text: {
        color: 'white',
        fontSize: 30
    },
    input: {
        height: 55,
        width: 55,
        fontSize: 30,
        borderRadius: 10,
        backgroundColor: 'white',
    }
});

export default SearchAddress