import { useState, useContext, useEffect, useRef } from 'react';
import { MdClear } from "react-icons/md";

// Components
import MediaSection from '../components/MediaSection.component';

// CSS 
import styles from '../styles/Search.screen.module.css';

// Contexts
import serverContext from '../contexts/server.context';

const Search = () => {
    const { serverAddress } = useContext(serverContext);
    const [ query, setQuery ] = useState(null);
    const [ results, setResults ] = useState(null);
    const ref = useRef(null);

    const FetchSearch = async () => {
        try {
            const response = await fetch(`${serverAddress}/browse/search?value=${query}`);
            const json = await response.json();
            console.log(json);
            setResults(json);
        }
        catch(err) {
            setResults([]);
        }
    };

    let queryTimeout;
    const handleInput = (value) => {
        clearTimeout(queryTimeout);
        queryTimeout = setTimeout(() => setQuery(value), 500);
    };

    const handleClear = () => {
        document.getElementsByClassName(styles.inputText)[0].value = '';
        setQuery('')
        setResults([]);
    };

    useEffect(() => {
        FetchSearch();
    }, [ query ]);

    useEffect(() => {
        if(ref.current) {
            ref.current.focus();
            ref.current.select();
        }
    }, [ref.current]);

    return (
        <div className={styles.container}>
            <div className={styles.searchBar}>
                <input className={styles.inputText} ref={ref} type='text' placeholder='Search media...' onChange={(e) => handleInput(e.target.value)}/>
                { query && query.length > 0 ? <button className={styles.clearButton} onClick={handleClear}> <MdClear size='2rem'/> </button> : <></> }
            </div>
            <div className={styles.items}>
                { results && results.length > 0 ?  <MediaSection title={'Results'} items={results}/> : <></>}
                { query && query.length != 0 && results && results.length == 0 && <h3 style={{color: 'white'}}>No Results</h3> }
            </div>
        </div>
    )
}

export default Search;