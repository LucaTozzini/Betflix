import { useContext, useEffect, useState } from "react";

// CSS
import styles from "../styles/Database.screen.module.css";

// Contexts
import serverContext from "../contexts/server.context";
import currentUserContext from "../contexts/currentUser.context";

const Database = () => {
  const { serverAddress } = useContext(serverContext);
  const { userId, userPin } = useContext(currentUserContext);
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState({});
  const [activeTorrents, setActiveTorrents] = useState([]);
  const fetchStatus = async () => {
    try {
      const response = await fetch(`${serverAddress}/database/status`);
      const json = await response.json();
      setStatus(json);
    } catch (err) {
      console.error(err.message);
    }
    setTimeout(fetchStatus, 100);
  };

  const fetchTorrents = async () => {
    try {
      const response = await fetch(`${serverAddress}/torrents/active`);
      const json = await response.json();
      setActiveTorrents(json);
    } catch (err) {}
    setTimeout(fetchTorrents, 2000);
  };

  const queryUpdate = (param) => {
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, userPin }),
    };
    fetch(`${serverAddress}/database/update/${param}`, options);
  };

  const queryMaintenace = (param) => {
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, userPin }),
    };
    fetch(`${serverAddress}/database/maintenance/${param}`, options);
  };

  useEffect(() => {
    if (!loaded) setLoaded(true);
    else {
      fetchStatus();
      fetchTorrents();
    }
  }, [loaded]);

  const Torrent = ({ name, progress, time }) => {
    const timeString = () => {
      let sec = Math.floor(time / 1000);
      const hrs = Math.floor(sec / 3600);
      sec -= hrs * 3600;
      const min = Math.floor(sec / 60);
      sec -= min * 60;
      return `${hrs ? hrs + "h " : ""}${min ? min + "m " : ""}${sec}s`;
    };
    return (
      <div>
        <h3>{name} - {timeString()}</h3>
        <div
          className={styles.torrentProgress}
          style={{ width: progress * 100 + "%" }}
        />
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h2>Media Manager</h2>
        <div
          className={styles.buttonRow}
          {...(status.ACTIVE && { className: styles.ghost })}
        >
          <button onClick={() => queryUpdate("movies")}>Scan Movies</button>
          <button onClick={() => queryUpdate("shows")}>Scan Shows</button>
          <button onClick={() => queryUpdate("people")}>Update People</button>
          <button onClick={() => queryMaintenace("clean")}>Clean</button>
        </div>
        <h2 className={styles.action}>
          {status.ACTION || "No Active Actions"}
        </h2>
        <div className={styles.progressBar}>
          <div
            className={styles.progressBarFill}
            style={{ width: `${status.PROGRESS || 0}%` }}
          ></div>
        </div>
      </div>
      {activeTorrents[0] ? (
        <div className={styles.section}>
          <h2>Active Torrents</h2>
          <div className={styles.torrents}>
            {activeTorrents.map((torrent) => (
              <Torrent
                name={torrent.name}
                progress={torrent.progress}
                time={torrent.timeRemaining}
              />
            ))}
          </div>
        </div>
      ) : (
        <div />
      )}
    </div>
  );
};

export default Database;
