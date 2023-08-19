import { useEffect, useRef, useContext } from "react";
import { Text } from "react-native";

const SearchAddress = ({ set, address, valid }) => {
    const found = useRef(false);

    const isAddress = (addr) => {
        fetch(`${addr}/ciao`).then(async (data) => {
            const text = await data.text();
            if(text == 'yellow'){
                console.log(text)
                set(addr)
                found.current = true;
                valid(true);
            };
        }).catch((err) => {});
    };

    const loop = async () => {
        isAddress(address);
        await new Promise (res => setTimeout(res, 1000)); 

        for(let i = 0; i <= 255 ; i++) {
            console.log(i, found.current)
            if(found.current) break;
            isAddress(`http://192.168.1.${i}`);
            await new Promise (res => setTimeout(res, 100)); 
        }
    };

    useEffect(() => {
        loop()
    }, []);
    return (
        <Text>Searching...</Text>
    )
}

export default SearchAddress