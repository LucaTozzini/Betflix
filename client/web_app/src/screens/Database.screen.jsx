import { useContext, useEffect, useState, useRef } from "react";

// CSS
import styles from "../styles/Database.screen.module.css";

// Contexts
import serverContext from "../contexts/server.context";
import currentUserContext from "../contexts/currentUser.context";

const Database = () => {
  const { serverAddress } = useContext(serverContext);
  const { userId, userPin } = useContext(currentUserContext);

  const consoleRef = useRef(null);

  const [loopAlt1, setLoopAlt1] = useState(false);
  const [loopAlt2, setLoopAlt2] = useState(false);
  const [action, setAction] = useState(null);
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [drives, setDrives] = useState([]);
  const [torrents, setTorrents] = useState([]);

  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${serverAddress}/database/status`);
      const { ACTION, PROGRESS, ACTIVE } = await response.json();

      const logs = consoleRef.current.innerHTML.split("<br>");
      if (
        (logs == 1 || logs[logs.length - 2] != ACTION) &&
        consoleRef.current
      ) {
        consoleRef.current.innerHTML += `${ACTION}<br>`;
        consoleRef.current.scrollTo(0, consoleRef.current.scrollHeight);
      }
      setAction(ACTION);
      setProgress(PROGRESS);
      setActive(ACTIVE);
    } catch (err) {
      console.error(err.message);
    }
    await sleep(200);
    setLoopAlt1(!loopAlt1);
  };

  const fetchDrives = async () => {
    try {
      const response = await fetch(`${serverAddress}/database/drives`);
      const json = await response.json();
      setDrives(json);
    } catch (err) {
      console.error(err.message);
    }
  };

  const fetchTorrents = async () => {
    try {
      const response = await fetch(`${serverAddress}/torrents/active`);
      const json = await response.json();
      setTorrents(json);
    } catch (err) {
      console.error(err.message);
    }
    await sleep(1000);
    setLoopAlt2(!loopAlt2);
  };

  const postUpdate = (item) => {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, userPin }),
    };

    fetch(`${serverAddress}/database/update/${item}`, options).catch((err) =>
      console.error(err.message)
    );
  };

  const postMaintenace = (item) => {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, userPin }),
    };
    fetch(`${serverAddress}/database/maintenance/${item}`, options).catch(
      (err) => console.error(err.message)
    );
  };

  const addTorrentsFromDB = () => {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, userPin }),
    };
    fetch(`${serverAddress}/torrents/addDB`, options).catch((err) =>
      console.error(err.message)
    );
  };

  const msToString = (ms) => {
    let seconds = ms / 1000;
    const hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;
    const minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    seconds = Math.floor(seconds);
    return `${hours}h : ${minutes}m : ${seconds}s`;
  };

  const handleRemoveTorrent = (magnetURI) => {
    const options = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({magnetURI})
    };
    fetch(`${serverAddress}/torrents/rem`, options).catch(err => console.log(err.message));
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  useEffect(() => {
    fetchStatus();
    // console.log(loopAlt);
  }, [loopAlt1]);

  useEffect(() => {
    fetchTorrents();
  }, [loopAlt2]);

  return (
    <div className={styles.container}>
      {/* Media Manager */}
      <div className={styles.section}>
        <h2>{"> Media Manager"}</h2>
        <div className={styles.buttons}>
          <button
            className={active ? styles.inactive : ""}
            onClick={() => postUpdate("movies")}
          >
            Movies
          </button>
          <button
            className={active ? styles.inactive : ""}
            onClick={() => postUpdate("shows")}
          >
            Shows
          </button>
          <button
            className={active ? styles.inactive : ""}
            onClick={() => postUpdate("people")}
          >
            People
          </button>
          <button
            className={active ? styles.inactive : ""}
            onClick={() => postMaintenace("clean")}
          >
            Clean
          </button>
        </div>
        <div className={styles.progressBar}>
          <div style={{ width: progress ? progress + "%" : 0}} />
        </div>
        <div className={styles.console} ref={consoleRef}></div>
      </div>

      {/* Torrents */}
      <div className={styles.section}>
        <h2>{"> Torrents"}</h2>
        <div className={styles.buttons}>
          <button onClick={addTorrentsFromDB}>Add From DB</button>
        </div>
        <div className={styles.list}>
          {torrents.map((i) => (
            <div>
              <p>{i.name}</p>
              <p>{msToString(i.timeRemaining)}</p>
              <div className={styles.progressBar}>
                <div style={{ width: i.progress * 100 + "%" }} />
              </div>
              <button onClick={() => handleRemoveTorrent(i.magnetURI)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Database;
