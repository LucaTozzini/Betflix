import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';

const data = [
  {image: '', progress: 0.8},
  {image: '', progress: 0.3},
  {image: '', progress: 0.5},
  {image: '', progress: 0.08},
  {image: '', progress: 0.83},
];

export default function ContinueRow() {
  const Item = ({progress}) => (
    <TouchableOpacity>
      <ImageBackground>
        <View/>
      </ImageBackground>
    </TouchableOpacity>
  );
  return (
    <View>
      <Text>Continue Watching</Text>
      <FlatList 
      data={data}
      renderItem={({item: {progress}}) => <Item progress={progress}/>}
      />
    </View>
  );
}
