import AsyncStorage from '@react-native-async-storage/async-storage';

const storeData = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(err.message)
    }
};
  
const getData = (key) => new Promise(async (res, rej) => {
    try {
        const value = await AsyncStorage.getItem(key);
        res(value ? JSON.parse(value) : 1234);
    } catch (err) {
        rej(err);
    }
});

const removeItem = async (key) => {
    try {
        await AsyncStorage.removeItem(key);
    }
    catch(err) {
        console.error(err.message)
    }
};

export { storeData, getData, removeItem };