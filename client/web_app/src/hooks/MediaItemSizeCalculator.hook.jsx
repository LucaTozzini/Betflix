import { useContext, useEffect } from "react";

// Contexts
import mediaItemSizeContext from "../contexts/mediaItemSize.context";

const MediaItemSizeCalculator = () => {
    const { mediaScrollRef, setItemWidth, setItemsGap, setItemsOnPage, manualTrigger, setManualTrigger } = useContext(mediaItemSizeContext);
    let debounce;

    const setItemSize = (time) => {
        if(!mediaScrollRef.current) return;
        if(!mediaScrollRef.current.offsetWidth) return;
        clearTimeout(debounce);
        debounce = setTimeout(() => {
            const width = mediaScrollRef.current.offsetWidth;
            const num = 
                width >= 1000 ? 10 :
                width >= 750 ? 8 : 
                width >= 500 ? 6 :
                width >= 250 ? 4 : 2; 
            
            const gap_space = width * 0.05;
            const available = width * 0.95;
            setItemsOnPage(num);
            setItemWidth(available / num);
            setItemsGap(gap_space / (num - 1));
        }, time);
    };

    useEffect(() => {
        const handleResize = () => setItemSize(200);
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        setItemSize(0);
    }, [mediaScrollRef.current]);

    useEffect(() => {
        if(manualTrigger) setItemSize(200);
        setManualTrigger(false);
    }, [manualTrigger])
};

export default MediaItemSizeCalculator;