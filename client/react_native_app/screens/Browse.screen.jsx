import {useContext, useEffect, useRef, useState} from 'react';
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
import useBrowseHook from '../hooks/useBrowse.hook';

import { CastButton } from 'react-native-google-cast'


// Icons
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Contexts
import {globalContext} from '../App';
import MediaWideComponent from '../components/MediaWide.component';

// Variables
const gap = 10;
const margin = 8;
const numItems = 3;

export default () => {
  const {
    userName,
    continueList,
    watchlist,
    fetchContinue,
    fetchWatchlist,
  } = useContext(globalContext);
  const {topVoted, latest, fetchLatest, fetchTopVoted} = useBrowseHook();

  const mediaHook = useMediaRow({gap, margin, numItems});
  const wideHook = useMediaRow({gap, margin, numItems: 1});

  // Animation Refs
  const scrollY = useRef(new Animated.Value(0)).current;
  const clampY = Animated.diffClamp(scrollY, 0, 40);
  const headerY = clampY.interpolate({
    inputRange: [0, 40],
    outputRange: [0, -40],
  });
  const headerOpacity = clampY.interpolate({
    inputRange: [0, 30],
    outputRange: [1, 0],
  });
  const borderOpacity = scrollY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  useEffect(() => {
    fetchLatest();
    fetchContinue();
    fetchWatchlist();
    fetchTopVoted();
  }, []);

  const Home = () => {
    return (
      <>
        <MediaRowComponent
          header={'Latest Releases'}
          items={latest}
          width={mediaHook.itemWidth}
          gap={gap}
          margin={margin}
        />

        <MediaWideComponent
          header={'Continue'}
          items={continueList}
          width={wideHook.itemWidth}
          gap={gap}
          margin={margin}
        />

        <MediaRowComponent
          header={'My List'}
          items={watchlist}
          width={mediaHook.itemWidth}
          gap={gap}
          margin={margin}
        />

        <MediaRowComponent
          header={'Top Rated'}
          items={topVoted}
          width={mediaHook.itemWidth}
          gap={gap}
          margin={margin}
        />
      </>
    );
  };

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
          <CastButton style={{tintColor: "white", height: 40, width: 40}}/>
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
          {/* <TouchableOpacity style={styles.resetButton}>
            <Text style={styles.expandText}>X</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.expandButton}>
            <Text style={styles.expandText}>Movies</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.expandButton}>
            <Text style={styles.expandText}>Shows</Text>
          </TouchableOpacity> */}
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
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        // onScroll={Animated.event(
        //   [{nativeEvent: {contentOffset: {y: scrollY}}}],
        //   {useNativeDriver: false},
        // )}
        >
        <View
          style={{
            height: StatusBar.currentHeight + 80,
          }}
        />

        <HeroComponent margin={20} item={latest[12] || {}} />
        <View style={{height: 30}} />
        <View style={styles.rows}>
          <Home/>
        </View>
        <FooterComponent />
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    // gap: 20
  },
  expand: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    // backgroundColor: 'black',
    gap: 7,
    zIndex: 999,
    paddingBottom: 10,
  },
  resetButton: {
    height: 40,
    width: 40,

    backgroundColor: 'rgb(30, 30, 30)',

    borderColor: 'rgb(60, 60, 60)',
    borderRadius: 20,
    borderWidth: 1,

    alignItems: 'center',
    justifyContent: 'center',
  },
  expandButton: {
    backgroundColor: 'rgb(30, 30, 30)',
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgb(60, 60, 60)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandText: {
    fontSize: 17,
    color: 'white',
  },
  rows: {
    gap: 20,
  },
});
