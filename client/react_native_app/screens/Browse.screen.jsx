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

  // For Expand Top
  const [lastY, setLastY] = useState(0);
  const [expandTop, setExpandTop] = useState(true);
  const translateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const borderOpacityAnim = useRef(new Animated.Value(1)).current;

  const expandSlide = expand => {
    Animated.timing(translateAnim, {
      toValue: expand ? 0 : -40,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.timing(opacityAnim, {
      toValue: expand ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const showBorder = show => {
    Animated.timing(borderOpacityAnim, {
      toValue: show ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }

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

  const handleScroll = e => {
    const {y} = e.nativeEvent.contentOffset;
    showBorder(y > 10);

    if (y < 50) {
      setExpandTop(true);
    } else if (y <= lastY !== expandTop) {
      setExpandTop(y <= lastY);
    }
    // finally
    setLastY(y);
  };

  useEffect(() => {
    fetchLatest();
  }, []);

  useEffect(() => {
    expandSlide(expandTop);
  }, [expandTop]);

  return (
    <>
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          zIndex: 100,
          transform: [{translateY: translateAnim}],
          backgroundColor: "black",
          paddingTop: StatusBar.currentHeight + 10
        }}>
        <Animated.View
          style={{
            opacity: opacityAnim,

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

        <Animated.View
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
        </Animated.View>

        <Animated.View style={{height: 1, backgroundColor: "rgb(40, 40, 40)", opacity: borderOpacityAnim}}/>
      </Animated.View>

      <ScrollView
        style={styles.container}
        onScroll={handleScroll}
        >
        <View
          style={{
            height: StatusBar.currentHeight + 100,
            // backgroundColor: 'red',
          }}></View>

        <HeroComponent margin={20} item={latest[1] || {}}/>
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
    borderColor: "rgb(60, 60, 60)",
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
