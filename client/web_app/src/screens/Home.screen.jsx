import { useEffect, useContext, useState } from "react";

// Icons
import {
  PiCardsBold,
  PiFilmReel,
  PiTelevisionSimpleBold,
  PiPlusBold,
} from "react-icons/pi";

// Context
import currentUserContext from "../contexts/currentUser.context";
import browseContext from "../contexts/browse.context";
import serverContext from "../contexts/server.context";

// Components
import Hero from "../components/Hero.component";
import MediaSection from "../components/MediaSection.component";

// CSS
import styles from "../styles/Browse.screen.module.css";

const Home = () => {
  const { serverAddress } = useContext(serverContext);
  const { userId, userPin } = useContext(currentUserContext);

  const [againMedia, setAgainMedia] = useState(null);
  const [latestMedia, setLatestMedia] = useState(null);
  const [topRatedMedia, setTopRatedMedia] = useState(null);
  const [continueMedia, setContinueMedia] = useState(null);
  const [watchlistMedia, setWatchlistMedia] = useState(null);

  const [showGenres, setShowGenres] = useState(null);
  const [movieGenres, setMovieGenres] = useState(null);

  const [browseState, setBrowseState] = useState(0);

  const fetchGenres = (type) =>
    new Promise(async (res, rej) => {
      try {
        let genres = await fetch(`${serverAddress}/browse/genres/available`);
        genres = await genres.json();
        console.log(genres)
        const data = [];
        for (const genre of genres) {
          const response = await fetch(
            `${serverAddress}/browse/genres?genreName=${genre}&type=${type}&orderBy=random&limit=40`
          );
          const json = await response.json();
          data.push({ genre, media: json });
        }
        res(data);
      } catch (err) {
        rej(err);
      }
    });

  const fetchMovieGenres = async () => {
    try {
      const data = await fetchGenres(1);
      setMovieGenres(data);
    } catch (err) {
      console.error(err.message);
    }
  };

  const fetchShowGenres = async () => {
    try {
      const data = await fetchGenres(2);
      setShowGenres(data);
    } catch (err) {}
  };

  const fetchContinue = async () => {
    try {
      const response = await fetch(`${serverAddress}/user/continue?userId=${userId}&limit=50`);
      const json = await response.json();
      setContinueMedia(json);
    } catch (err) {}
  };

  const fetchWatchlist = async () => {
    try {
      const response = await fetch(`${serverAddress}/user/watchlist?userId=${userId}`);
      const json = await response.json();
      setWatchlistMedia(json);
    } catch (err) {}
  };

  const fetchWatchAgain = async () => {
    try {
      const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, userPin, limit: 30 }),
      };
      const response = await fetch(
        `${serverAddress}/browse/watch-again`,
        options
      );
      const json = await response.json();
      setAgainMedia(json);
    } catch (err) {}
  };

  const fetchLatestReleases = async () => {
    try {
      const response = await fetch(
        `${serverAddress}/browse/latest/releases?limit=30`
      );
      const json = await response.json();
      setLatestMedia(json);
    } catch (err) {}
  };

  const fetchTopRated = async () => {
    try {
      const response = await fetch(
        `${serverAddress}/browse/range/vote?minVote=8.5&maxVote=10&orderBy=random&limit=40`
      );
      const json = await response.json();
      setTopRatedMedia(json);
    } catch (err) {}
  };

  useEffect(() => {
    console.log(browseState)
    if (browseState == 0) {
      if (!continueMedia) {
        fetchContinue();
      }
      if (!latestMedia) {
        fetchLatestReleases();
      }
      if (!topRatedMedia) {
        fetchTopRated();
      }
    } else if (browseState == 1) {
      if (!movieGenres) {
        fetchMovieGenres();
      }
    } else if (browseState == 2) {
      if (!showGenres) {
        fetchShowGenres();
      }
    } else if (browseState == 3) {
      if (!watchlistMedia) {
        fetchWatchlist();
      }
      if (!againMedia) {
        fetchWatchAgain();
      }
    }
  }, [browseState]);

  return (
    <div className={styles.container}>
      <Hero
        key={"hr"}
        items={continueMedia}
        autoPlay={browseState == 0}
        heroTitle={browseState == 0 ? "Continue Watching" : ""}
      />

      <div className={styles.sectionsBar}>
        <button
          className={styles.sectionButton}
          onClick={() => setBrowseState(0)}
        >
          <PiCardsBold />
          <h3>Browse</h3>
        </button>
        <button
          className={styles.sectionButton}
          onClick={() => setBrowseState(1)}
        >
          <PiFilmReel />
          <h3>Movies</h3>
        </button>
        <button
          className={styles.sectionButton}
          onClick={() => setBrowseState(2)}
        >
          <PiTelevisionSimpleBold />
          <h3>TV Shows</h3>
        </button>
        <button
          className={styles.sectionButton}
          onClick={() => setBrowseState(3)}
        >
          <PiPlusBold />
          <h3>Watchlist</h3>
        </button>
      </div>

      {browseState == 0 ? (
        <>
          <MediaSection
            key={"lr"}
            title={"Latest Releases"}
            items={latestMedia}
          />
          <MediaSection key={"tr"} title={"Top Rated"} items={topRatedMedia} />
        </>
      ) : browseState == 1 ? (
        <>
          {movieGenres ? (
            movieGenres.map((i) => (
              <MediaSection key={"movie_"+i.genre} title={i.genre} items={i.media} />
            ))
          ) : (
            <></>
          )}
        </>
      ) : browseState == 2 ? (
        <>
          {showGenres ? showGenres.map((i) => (
            <MediaSection key={"show_"+i.genre} title={i.genre} items={i.media} />
          )) : <></>}
        </>
      ) : browseState == 3 ? (
        <>
          <MediaSection key={"wl"} title={"My List"} items={watchlistMedia} />
          <MediaSection key={"wa"} title={"Watch Again"} items={againMedia} />
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default Home;
