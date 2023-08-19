import { useEffect, useState } from 'react';
import { getData } from "../helpers/asyncStorage.helper";

const GetStorage = ({ setServerAddress, setUserId, setUserPin, setUserData }) => {
    const FetchStorage = async () => {
        const userId = await getData("userId");
        const userPin = await getData("userPin");
        const userData = await getData("userData");
        const serverAddress = await getData("serverAddress");

        setUserId(userId || -1);
        setUserPin(userPin || -1);
        setUserData(userData || -1)
        setServerAddress(serverAddress || -1);
    };

    useEffect(() => {FetchStorage()}, []);
};

export default GetStorage;