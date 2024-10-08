import {ScrollView, StatusBar} from 'react-native';
import {useContext, useState} from 'react';

// Components
import MediaRow, {ContinueRow} from '../components/media row-comp';
import {BrowseHeader} from '../components/header-comp';
import Hero from '../components/hero-comp';

// Hooks
import useTitles from '../hooks/useTitles-hook';
import {useEffect} from 'react';

// Contexts
import {globalContext} from '../../App';

export default function BrowseScreen() {
  const {useWatchlist, useContinue} = useContext(globalContext);
  const [latest, setLatest] = useState(null);
  const [voted, setVoted] = useState(null);
  const {fetchLatest, fetchVoted} = useTitles();

  async function initialize() {
    useWatchlist.get();
    useContinue.fetchContinues();
    const latest = await fetchLatest();
    setLatest(latest);
    const voted = await fetchVoted();
    setVoted(voted);
  }

  useEffect(() => {
    initialize();
  }, []);

  return (
    <>
      <StatusBar backgroundColor={'black'} translucent={false} />
      <BrowseHeader />
      <ScrollView contentContainerStyle={{gap: 10, paddingBottom: 30}}>
        {latest && <Hero item={latest[10]} />}
        {useContinue.continues && (
          <ContinueRow header={'Continue'} data={useContinue.continues} />
        )}
        {useWatchlist.watchlist && (
          <MediaRow
            header={'Watchlist'}
            data={useWatchlist.watchlist}
            orientation={'poster'}
          />
        )}
        {latest && <MediaRow header={'Latest'} data={latest} />}
        {voted && <MediaRow header={'Top Rated'} data={voted} />}
      </ScrollView>
    </>
  );
}
