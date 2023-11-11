import { useEffect, useState } from 'react';
import { StyleSheet, View, Image } from 'react-native';

const Loading = ({awaitTime}) => {
  const [ show, setShow ] = useState(awaitTime == undefined);

  useEffect(() => {
    if(awaitTime != undefined) {
      setTimeout(() => setShow(true), awaitTime);
    }
  }, []);
  return (
    <View style={styles.container}>
      {show ? <Image source={{uri:'https://cdn.pixabay.com/animation/2023/05/02/04/29/04-29-06-428_512.gif'}} style={{height: 100, width: 100}}/> : <></>}
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center'
    }
});

export default Loading;