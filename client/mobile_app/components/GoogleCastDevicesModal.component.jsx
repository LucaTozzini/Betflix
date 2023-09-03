import {  } from 'react';
import GoogleCast, { useDevices, useRemoteMediaClient, useCastDevice } from 'react-native-google-cast';
import { StyleSheet, ScrollView, Modal, Image, View, Text, TouchableOpacity, TouchableHighlight } from 'react-native';

const GoogleCastDevicesModal = ({show, setShow, initBackground}) => {
  const castDevice = useCastDevice();
  const devices = useDevices();
  const uniqueDevices = [];
  for(const device of devices) {
    if(!uniqueDevices.map(i => i.deviceId).includes(device.deviceId)) uniqueDevices.push(device);
  };
  const sessionManager = GoogleCast.getSessionManager();
  const client = useRemoteMediaClient();

  const startCasting = async (device) => {
    try {
      await sessionManager.startSession(device.deviceId);
      setShow(false);
    } 
    catch (err) {
      console.error(err.message);
    }
  };

  const stopCasting = async () => {
    try {
      await sessionManager.endCurrentSession();
      setShow(false);
    }
    catch(err) {
      console.err(err.message)
    }
  };

  const SetCastImage = async () => {
    if(client && initBackground) {
      try {
        await client.loadMedia({
          autoplay: true,
          mediaInfo: {
            contentUrl: 'https://chromeunboxed.com/wp-content/uploads/2020/02/netflixOldUI-1200x900.jpg',
          }
        });
      }
      catch(err) {
  
      }
    };
  }

  SetCastImage();

  const Item = ({ data }) => {
    let image = '';
    const string = data.modelName.toLowerCase();
    if(string.includes('home mini') || string.includes('nest mini')) image = 'https://media.wired.com/photos/59d50d86238ef462c78efa50/master/w_2560%2Cc_limit/Mini-TA.jpg';
    else if (string.includes('group')) image = 'https://ih1.redbubble.net/image.443539786.9962/st,small,845x845-pad,1000x1000,f8f8f8.jpg';
    else if (string.includes('chromecast')) image = 'https://m.media-amazon.com/images/I/612mod-xowL.jpg';
    const isActive = castDevice ? data.deviceId == castDevice.deviceId : false;

    return (
      <TouchableHighlight underlayColor={'rgba(255, 255, 255, 0.1)'} style={[styles.item, isActive ? {backgroundColor: 'rgba(0, 100, 255, 0.2)'} : {}]} onPress={() => isActive ? stopCasting() : startCasting(data)}>
        <>
        <Image style={styles.itemImage} src={image}/>
        <View>
          <Text style={{color: 'white', fontSize: 17}}>{data.friendlyName}</Text>
          <Text style={{color: 'rgb(200, 200, 200)'}}>{data.modelName}</Text>
        </View>
        </>
      </TouchableHighlight>
    ) 
  }

  return <Modal visible={show} animationType='slide' onRequestClose={() => setShow(false)}>
    <View style={styles.header}>
      <Text style={styles.headerText}>Choose a device</Text>
    </View>
    <ScrollView style={styles.scrollview}>
      { uniqueDevices.map((item) => <Item key={item.ipAddress+item.friendlyName} data={item}/>) }
      <View style={{height: 30, width: 1}}/>
    </ScrollView>
  </Modal>
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    borderBottomWidth: 1, 
    backgroundColor: 'rgb(20, 20, 20)',
    borderBottomColor: 'rgb(60, 60, 60)', 
  },
  headerText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold', 
  },
  scrollview: {
    backgroundColor: 'rgb(20, 20, 20)'
  },
  item: {
    gap: 10, 
    padding: 20,
    flexDirection: 'row', 
  },
  itemImage: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: 'rgb(230, 230, 230)',
  },

});

export default GoogleCastDevicesModal;