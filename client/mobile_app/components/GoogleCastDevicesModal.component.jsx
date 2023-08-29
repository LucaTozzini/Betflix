import {  } from 'react';
import GoogleCast, { useDevices, useRemoteMediaClient, useCastDevice } from 'react-native-google-cast';
import { ScrollView, Modal, Image, View, Text, TouchableOpacity } from 'react-native';

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
      console.log(await sessionManager.getCurrentCastSession());
      await sessionManager.endCurrentSession();
      setShow(false);
    }
    catch(err) {
      console.log(err.message)
    }
  };

  if(client && initBackground) {
    try {
      client.loadMedia({
        autoplay: true,
        mediaInfo: {
          contentUrl: 'https://chromeunboxed.com/wp-content/uploads/2020/02/netflixOldUI-1200x900.jpg',
        }
      });
    }
    catch(err) {

    }
  };

  const Item = ({ data }) => {
    let image = '';
    const string = data.modelName.toLowerCase();
    if(string.includes('home mini') || string.includes('nest mini')) image = 'https://media.wired.com/photos/59d50d86238ef462c78efa50/master/w_2560%2Cc_limit/Mini-TA.jpg';
    else if (string.includes('group')) image = 'https://ih1.redbubble.net/image.443539786.9962/st,small,845x845-pad,1000x1000,f8f8f8.jpg';
    else if (string.includes('chromecast')) image = 'https://m.media-amazon.com/images/I/612mod-xowL.jpg';
    const isActive = castDevice ? data.deviceId == castDevice.deviceId : false;
    return (
      <TouchableOpacity style={{flexDirection: 'row', gap: 10, padding: 20, backgroundColor: isActive ? 'rgba(0, 100, 255, 0.2)' : 'rgba(0,0,0,0)' }} onPress={() => isActive ? stopCasting() : startCasting(data)}>
        <Image style={{height: 40, width: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgb(230, 230, 230)'}} src={image}/>
        <View>
          <Text style={{fontSize: 17}}>{data.friendlyName}</Text>
          <Text>{data.modelName}</Text>
        </View>
      </TouchableOpacity>
    ) 
  }

  return <Modal visible={show} animationType='slide' onRequestClose={() => setShow(false)}>
    <ScrollView>
      <View style={{borderBottomWidth: 1, borderBottomColor: 'rgb(200, 200, 200)', padding: 20}}>
        <Text style={{fontWeight: 'bold', fontSize: 20}}>Choose a device</Text>
      </View>
      <View>
        { uniqueDevices.map((item) => <Item key={item.ipAddress+item.friendlyName} data={item}/>) }
      </View>
    </ScrollView>
  </Modal>
};

export default GoogleCastDevicesModal;