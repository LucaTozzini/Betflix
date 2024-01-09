import { useState, useContext, useEffect, useRef } from "react";
import { MdClear } from "react-icons/md";

// Components
import MediaSection from "../components/MediaSection.component";
import CastSection from "../components/CastSection.component";
import YifiSection from "../components/YifiSection.component";

// CSS
import styles from "../styles/Search.screen.module.css";

// Contexts
import serverContext from "../contexts/server.context";

const Search = () => {
  const { serverAddress } = useContext(serverContext);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [people, setPeople] = useState(null);
  const [yifiResults, setYifiResults] = useState(null);
  const ref = useRef(null);

  const fetchSearch = async () => {
    try {
      const response = await fetch(
        `${serverAddress}/search/title?value=${query}`
      );
      const json = await response.json();
      setResults(json);
    } catch (err) {
      setResults([]);
    }
  };

  const fetchPeople = async () => {
    try {
      if (query.length == 0) {
        return;
      }
      const response = await fetch(
        `${serverAddress}/search/person?value=${query}&limit=40`
      );
      const json = await response.json();
      setPeople(json);
    } catch (err) {}
  };

  const fetchYifiSearch = async () => {
    try {
      const response = await fetch(
        `https://yts.mx/api/v2/list_movies.json?query_term=${query}&order_by=seeds`
      );
      const json = await response.json();
      const movies = json.data.movies.map(
        ({ title, medium_cover_image, torrents, year }) => ({
          title,
          year,
          image: medium_cover_image,
          torrents,
        })
      );
      console.log(movies);
      setYifiResults(movies);
    } catch (err) {
      console.error(err.message);
    }
  };

  let queryTimeout;
  const handleInput = (value) => {
    if (value == " ") {
      ref.current.value = "";
    } else if (value.match(/\s+$/g)) {
      ref.current.value = value.trim() + " ";
    }
    clearTimeout(queryTimeout);
    queryTimeout = setTimeout(() => setQuery(value), 500);
  };

  const handleClear = () => {
    document.getElementsByClassName(styles.inputText)[0].value = "";
    setQuery("");
    setResults([]);
    setPeople([]);
    setYifiResults([]);
  };

  useEffect(() => {
    if(query.length) {
      fetchSearch();
      fetchPeople();
      fetchYifiSearch();
    } else {
      handleClear()
    }
  }, [query]);

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
      ref.current.select();
    }
  }, [ref.current]);

  return (
    <div className={styles.container}>
      <div className={styles.searchBar}>
        <input
          className={styles.inputText}
          ref={ref}
          type="text"
          placeholder="Search media..."
          onChange={(e) => handleInput(e.target.value)}
        />
        {query && query.length > 0 ? (
          <button className={styles.clearButton} onClick={handleClear}>
            {" "}
            <MdClear size="2rem" />{" "}
          </button>
        ) : (
          <></>
        )}
      </div>
      <div className={styles.items}>
        <MediaSection title={"Results"} items={results || []} />
        <CastSection title={"People"} data={people || []} />
        <YifiSection title={"Available Downloads"} items={yifiResults || []} />
        {query &&
          query.length &&
          results &&
          results.length == 0 &&
          people &&
          people.length == 0 &&
          yifiResults &&
          yifiResults.length == 0 && (
            <h3 style={{ color: "white", textAlign: "center" }}>No Results</h3>
          )}
      </div>
    </div>
  );
};

export default Search;
