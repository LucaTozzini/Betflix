import {useEffect, useRef, useState} from 'react';
import {
  Text,
  View,
  Animated,
  StatusBar,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

// Components
import MediaRowComponent from '../components/MediaRow.component';
import FooterComponent from '../components/Footer.component';
import HeroComponent from '../components/Hero.component';

// Hooks
import useMediaRow from '../hooks/useMediaRow.hook';

// Icons
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default ({route}) => {
  const {address, userName, setShowCast} = route.params;
  const gap = 6;
  const margin = 8;
  const numItems = 3;
  const [latest, setLatest] = useState([]);
  const {itemWidth} = useMediaRow({gap, margin, numItems});

  // Animation Refs
  const scrollY = useRef(new Animated.Value(0)).current;
  const clampY = Animated.diffClamp(scrollY, 0, 180);
  const headerY = clampY.interpolate({
    inputRange: [0, 180],
    outputRange: [0, -40],
  });
  const headerOpacity = clampY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0],
  });
  const borderOpacity = scrollY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const fetchLatest = async () => {
    try {
      const response = await fetch(
        `${address}/browse/latest/releases?limit=30`,
      );
      const json = await response.json();
      setLatest(json);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchLatest();
  }, []);

  return (
    <>
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          zIndex: 100,
          transform: [{translateY: headerY}],
          backgroundColor: 'black',
          paddingTop: StatusBar.currentHeight + 10,
        }}>
        <Animated.View
          style={{
            opacity: headerOpacity,

            paddingHorizontal: 12,
            height: 40,

            flexDirection: 'row',
            justifyContent: 'space-between',
            zIndex: 99,
          }}>
          <Text style={{color: 'white', fontSize: 23, fontWeight: 'bold'}}>
            For {userName}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setShowCast(true);
            }}>
            <Icon name="cast" color="white" size={25} />
          </TouchableOpacity>
        </Animated.View>

        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 12,
            paddingBottom: 7,
            backgroundColor: 'black',
            zIndex: 100,
            gap: 5,
          }}>
          <TouchableOpacity style={styles.expandButton}>
            <Text style={styles.expandText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.expandButton}>
            <Text style={styles.expandText}>Movies</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.expandButton}>
            <Text style={styles.expandText}>Shows</Text>
          </TouchableOpacity>
        </View>

        <Animated.View
          style={{
            height: 1,
            backgroundColor: 'rgb(40, 40, 40)',
            opacity: borderOpacity,
          }}
        />
      </Animated.View>

      <ScrollView
        style={styles.container}
        onScroll={Animated.event([
          {nativeEvent: {contentOffset: {y: scrollY}}},
        ])}>
        <View
          style={{
            height: StatusBar.currentHeight + 100,
          }}></View>

        <HeroComponent margin={20} item={latest[1] || {}} />
        <View style={styles.rows}>
          <MediaRowComponent
            header={'Latest Releases'}
            items={latest}
            width={itemWidth}
            gap={gap}
            margin={margin}
          />
          <MediaRowComponent
            header={'Latest Releases'}
            items={latest}
            width={itemWidth}
            gap={gap}
            margin={margin}
          />
          <MediaRowComponent
            header={'Latest Releases'}
            items={latest}
            width={itemWidth}
            gap={gap}
            margin={margin}
          />
          <MediaRowComponent
            header={'Latest Releases'}
            items={latest}
            width={itemWidth}
            gap={gap}
            margin={margin}
          />
        </View>
        <FooterComponent />
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {},
  expand: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    // backgroundColor: 'black',
    gap: 7,
    zIndex: 999,
    paddingBottom: 10,
  },
  expandButton: {
    backgroundColor: 'rgb(30, 30, 30)',
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgb(60, 60, 60)',
    borderRadius: 10,
  },
  expandText: {
    fontSize: 17,
    color: 'white',
  },
  rows: {
    gap: 20,
  },
});
