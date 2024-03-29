import { useEffect } from "react";
import { useParams } from "react-router-dom"

const PlayerReroute = () => {
    const { mediaId, episodeId } = useParams();

    useEffect(() => {
        window.location.replace(`/player/${mediaId}/${episodeId}`);
    }, []);

    return <></>
}

export default PlayerReroute