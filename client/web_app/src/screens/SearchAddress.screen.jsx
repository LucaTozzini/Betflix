import { useEffect, useRef } from "react"

const SearchAddress = ({address, set}) => {
    const found = useRef(false);
    const isAddress = (address) => {
        fetch(`${address}/ciao`).then(async (data) => {
            const text = await data.text();
            if(text == 'yellow'){
                console.log(text)
                set(address)
                found.current = true;
            };
        }).catch((err) => {});
    };

    const loop = async () => {
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
        <div style={{color: 'white'}}>Searching...</div>
    )
}

export default SearchAddress