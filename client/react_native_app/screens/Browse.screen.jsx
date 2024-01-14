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
  const expandAnim = useRef(new Animated.Value(0)).current;
  const expandSlide = expand => {
    Animated.timing(expandAnim, {
      toValue: expand ? 0 : -80,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

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
    if (y < 50) {
      setExpandTop(true);
    } else if (y < lastY !== expandTop) {
      setExpandTop(y < lastY);
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

  const Top = () => {
    const styles = StyleSheet.create({
      container: {
        backgroundColor: 'black',

        paddingBottom: 10,
        paddingHorizontal: 20,
        paddingTop: StatusBar.currentHeight + 10,

        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,

        zIndex: 1000,

        flex: 1,
        height: StatusBar.currentHeight + 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
    });
    return (
      <>
        <View style={styles.container}>
          <Text style={{color: 'white', fontSize: 23, fontWeight: 'bold'}}>
            For {userName}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setShowCast(true);
            }}>
            <Icon name="cast" color="white" size={25} />
          </TouchableOpacity>
        </View>
      </>
    );
  };

  const Expand = () => {
    const styles = StyleSheet.create({
      expand: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        backgroundColor: 'black',
        gap: 7,
        zIndex: 999,
        paddingBottom: 10,
      },

      button: {
        backgroundColor: 'white',
        padding: 5,
        borderRadius: 10,
      },
      text: {
        fontSize: 17,
        color: 'black',
      },
    });

    const Button = ({text}) => {
      return (
        <TouchableOpacity style={styles.button}>
          <Text style={styles.text}>{text}</Text>
        </TouchableOpacity>
      );
    };

    return (
      <View style={styles.expand}>
        <Button text="Home" />
        <Button text="Movies" />
        <Button text="Shows" />
      </View>
    );
  };

  return (
    <>
      <Top />
      <ScrollView
        style={styles.container}
        onScroll={handleScroll}
        scrollEventThrottle={100}
        stickyHeaderIndices={[0]}>
        <View
          style={{
            height: StatusBar.currentHeight + 92,
            flexDirection: 'row',
            alignItems: 'flex-end',
          }}>
          <Animated.View style={{translateY: expandAnim}}>
            <Expand />
          </Animated.View>
        </View>
        <HeroComponent margin={20} />
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
  rows: {
    gap: 20,
  },
});
