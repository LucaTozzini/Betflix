import { useEffect, useRef, useState } from "react";

// CSS
import styles from '../styles/SearchAddress.screen.module.css';

const SearchAddress = ({address, set, valid}) => {
    const found = useRef(false);
    const addressVar = useRef(0);
    const [logText, setLogText] = useState(null);
    const [lost, setLost] = useState(false);

    const isAddress = (address, lastKnown) => {
        setLogText(`Checking ${address}...`)
        fetch(`${address}/ciao`).then(async (data) => {
            const text = await data.text();
            if(text == 'yellow'){
                console.log(text)
                set(address);
                valid(true);
                found.current = true;
            }
            else if(lastKnown) setLost(true);

        }).catch((err) => {if(lastKnown) setLost(true)});
    };

    const loop = async () => {
        const curr = addressVar.current;
        for(let i = 0; i <= 255 ; i++) {
            if(found.current || curr != addressVar.current) break;
            isAddress(`http://192.168.${addressVar.current}.${i}:2000`, false);
            await new Promise (res => setTimeout(res, 100)); 
        }
    };

    const handleChange = (e) => {
        if(e.target.value < 0) e.target.value = 0;
        else if(e.target.value > 255) e.target.value = 255;
        addressVar.current = e.target.value;
        loop();
    };

    useEffect(() => {
        isAddress(address, true);
    }, []);

    useEffect(() => {
        if(lost) loop();
    }, [lost]);

    if(lost) return (
        <div className={styles.container}>
            <span className={styles.inputSpan}>
                192.168.<input className={styles.numberInput} type="number" placeholder="0" onChange={handleChange}/>.XX
            </span>
            <div style={{color: 'white'}}>{logText || '...'}</div>
        </div>
    );

    else return <div style={{background: 'black', flex: 1}}/>
}

export default SearchAddress