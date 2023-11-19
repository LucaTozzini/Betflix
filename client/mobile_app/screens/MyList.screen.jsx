import { useState, useContext, useEffect } from "react";
import { ScrollView, StyleSheet } from "react-native";

// Components
import Header from "../components/Header.component";
import MediaRow from "../components/MediaRow.component";
import MediaWide from "../components/MediaWide.component";

// Contexts
import serverContext from "../contexts/server.context";
import currentUserContext from "../contexts/currentUser.context";

const MyList = () => {
    const { serverAddress } = useContext(serverContext);
    const { userId, userPin } = useContext(currentUserContext);

    const [ watchlistMedia, setWatchlistMedia ] = useState(null);
    const [ againMedia, setAgainMedia ] = useState(null);

    const FetchWatchlist = async () => {
        try{
            const options = {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({userId, userPin})};
            const response = await fetch(`${serverAddress}/watchlist/`, options);
            const json = await response.json();
            if(json.length > 0) {
                setWatchlistMedia(json);
            }
        }
        catch(err){
    
        }
    };
    
    const FetchWatchAgain = async () => {
        try{
            const options = {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({userId, userPin, limit: 30})};
            const response = await fetch(`${serverAddress}/browse/watch-again`, options);
            const json = await response.json();
            if(json.length > 0) {
                setAgainMedia(json);
            }
        }
        catch(err){
            
        }
    }

    useEffect(() => {
        FetchWatchAgain();
        FetchWatchlist();
    }, []);

    return (
        <ScrollView stickyHeaderIndices={0} contentContainerStyle={styles.container}>
            <Header showHeader/>
            { watchlistMedia ? <MediaWide title={"My List"} data={watchlistMedia}/> : <></> }
            { againMedia ? <MediaRow title={"Watch Again"} data={watchlistMedia}/> : <></> }
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 20,
        paddingBottom: 30
    }
})

export default MyList;
