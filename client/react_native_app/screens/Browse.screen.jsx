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
import MediaRowComponent from '../components/posterRow.component';
import FooterComponent from '../components/Footer.component';
import HeroComponent from '../components/Hero.component';

// Hooks
import useMediaRow from '../hooks/useRowSize.hook';
import useBrowseHook from '../hooks/useBrowse.hook';

import {CastButton} from 'react-native-google-cast';

// Contexts
import {globalContext} from '../App';
import MediaWideComponent from '../components/continueRow.component';
import LinearGradient from 'react-native-linear-gradient';

export default () => {
  const {
    userName,
    continueList,
    watchlist,
    fetchContinue,
    fetchWatchlist,
    posterRowSize,
    continueRowSize,
    horizontalMargin,
    rowGap,
  } = useContext(globalContext);

  const {topVoted, latest, fetchLatest, fetchTopVoted} = useBrowseHook();

  // Animation Refs
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 20],
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
          width={posterRowSize.itemWidth}
          gap={rowGap}
          margin={horizontalMargin}
        />

        <MediaWideComponent
          header={'Continue'}
          items={continueList}
          width={continueRowSize.itemWidth}
          gap={rowGap}
          margin={horizontalMargin}
        />

        <MediaRowComponent
          header={'My List'}
          items={watchlist}
          width={posterRowSize.itemWidth}
          gap={rowGap}
          margin={horizontalMargin}
        />

        <MediaRowComponent
          header={'Top Rated'}
          items={topVoted}
          width={posterRowSize.itemWidth}
          gap={rowGap}
          margin={horizontalMargin}
        />
      </>
    );
  };

  return (
    <>
      <LinearGradient
        colors={['#00000080', 'transparent']}
        style={[styles.top, {paddingHorizontal: horizontalMargin}]}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={styles.topHeader}>Browse for {userName}</Text>
          <View
            style={styles.topView}>
            <CastButton style={styles.castButton} />
          </View>
        </View>
        <Animated.View style={[styles.topBack, {opacity: headerOpacity}]} />
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: false},
        )}>
        <HeroComponent margin={horizontalMargin} item={latest[7] || {}} />
        <View style={{height: 30}} />
        <View style={styles.rows}>
          <Home />
        </View>
        <FooterComponent />
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {},
  top: {
    position: 'absolute',
    zIndex: 1000,
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: 5,
    paddingTop: StatusBar.currentHeight + 5,
  },
  topHeader: {
    color: 'white',
    fontSize: 20,
    padding: 5,
  },
  topBack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
    zIndex: -1,
  },
  topView: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  castButton: {width: 30, height: 30, tintColor: 'white'},
  rows: {
    gap: 20,
  },
});
