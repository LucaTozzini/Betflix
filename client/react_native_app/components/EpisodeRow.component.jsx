import {
  FlatList,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {useState} from 'react';

const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export default ({items, header, width, gap, margin}) => {
  const navigation = useNavigation();

  const Item = ({
    episodeId,
    mediaId,
    image,
    seasonNum,
    episodeNum,
    title,
    overview,
    progress,
    date,
  }) => {
    const [modal, setModal] = useState(false);
    const splitDate = date.split('-');
    const year = splitDate[0];
    const month = months[parseInt(splitDate[1]) - 1];
    const day = splitDate[2];

    const dateString = `${month} ${day}, ${year}`;
    return (
      <>
        <TouchableOpacity
          style={[styles.item, {width}]}
          activeOpacity={1}
          onPress={() => navigation.navigate('player', {episodeId, mediaId})}
          onLongPress={() => setModal(true)}>
          <ImageBackground
            style={[
              styles.image,
              {width, height: width * 0.6, borderRadius: width * 0.02},
            ]}
            imageStyle={{borderRadius: width * 0.02}}
            source={{uri: image}}>
            <View style={[styles.progressBar, {width: progress + '%'}]} />
          </ImageBackground>
          <View style={styles.info}>
            <Text numberOfLines={1} style={styles.title}>
              S{seasonNum}:E{episodeNum} {title}
            </Text>
            <Text style={styles.date}>{dateString}</Text>
          </View>
        </TouchableOpacity>

        <Modal
          transparent
          statusBarTranslucent
          animationType="slide"
          visible={modal}
          onRequestClose={() => setModal(false)}>
          <TouchableOpacity
            style={styles.modalTouch}
            onPress={() => setModal(false)}>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              <TouchableOpacity
                style={styles.modalInfo}
                onPress={() => {}}
                activeOpacity={1}>
                <Text style={styles.modalNums}>
                  S{seasonNum}:E{episodeNum}
                </Text>
                <Text style={styles.modalTitle}>{title}</Text>
                <Text style={styles.modalDate}>{dateString}</Text>
                <Text style={styles.modalOverview}>{overview}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalButton} onPress={() => navigation.navigate('player', {episodeId, mediaId})}>
                <MaterialIcon name="play-arrow" color="white" size={30} />
                <Text style={styles.modalText}>Play Episode</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => navigation.navigate('player', {episodeId, mediaId, fromStart: true})}>
                <MaterialIcon name="replay" color="white" size={30} />
                <Text style={styles.modalText}>Play from start</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton}>
                <MaterialIcon name="done-all" color="white" size={30} />
                <Text style={styles.modalText}>Mark as watched</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton}>
                <MaterialIcon name="remove-done" color="white" size={30} />
                <Text style={styles.modalText}>Mark as unwatched</Text>
              </TouchableOpacity>

            </ScrollView>
          </TouchableOpacity>
        </Modal>
      </>
    );
  };

  if (items) {
    return (
      <View style={styles.container}>
        {header && (
          <Text style={[styles.header, {marginHorizontal: margin}]}>
            {header}
          </Text>
        )}
        <FlatList
          contentContainerStyle={{paddingHorizontal: margin, gap}}
          data={items}
          renderItem={({item}) => (
            <Item
              key={item.EPISODE_ID}
              mediaId={item.MEDIA_ID}
              episodeId={item.EPISODE_ID}
              image={item.STILL_L}
              seasonNum={item.SEASON_NUM}
              episodeNum={item.EPISODE_NUM}
              title={item.TITLE}
              overview={item.OVERVIEW}
              date={item.AIR_DATE}
              progress={(item.PROGRESS_TIME / item.DURATION) * 100}
            />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>
    );
  }
};

const mdlClr = '#212121';

const styles = StyleSheet.create({
  container: {
    gap: 5,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  item: {gap: 3},
  image: {
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  progressBar: {height: 6, backgroundColor: 'dodgerblue'},
  info: {
    paddingHorizontal: 5,
  },
  title: {color: 'white', fontSize: 16, fontWeight: '600'},
  date: {color: 'rgb(190, 190, 190)', fontSize: 13},
  overview: {color: 'white', paddingHorizontal: 10, fontSize: 13},

  modalTouch: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalScroll: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  modalInfo: {
    backgroundColor: mdlClr,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgb(50,50,50)',
  },
  modalNums: {
    color: "white",
    fontSize: 20,
  },
  modalTitle: {
    color: "white",
    fontWeight: "bold",
    fontSize: 25
  },
  modalDate: {
    marginBottom: 10,
    color: "silver",
    fontSize: 18,
  },
  modalOverview: {
    color: 'gainsboro',
    fontSize: 15,
  },
  modalButton: {
    flexDirection: 'row',
    backgroundColor: mdlClr,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 10,
  },
  modalText: {
    color: 'white',
    fontWeight: "600",
    fontSize: 14,
  },
});
