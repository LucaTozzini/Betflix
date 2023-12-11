import { useContext, useEffect, useState } from "react";
import "../styles/Database.screen.css";

// Contexts
import serverContext from "../contexts/server.context";
import currentUserContext from "../contexts/currentUser.context";

const Database = () => {
  const { serverAddress } = useContext(serverContext);
  const { userId, userPin } = useContext(currentUserContext);
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState({});
  const FetchStatus = async () => {
    try {
      const response = await fetch(`${serverAddress}/database/status`);
      const json = await response.json();
      setStatus(json);
    } catch (err) {
      console.error(err.message);
    }
    setTimeout(FetchStatus, 100);
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
    else FetchStatus();
  }, [loaded]);

  useEffect(() => {
    console.log(status);
  }, [status]);

  return (
    <div id="database">
      <div id="button-row" {...(status.ACTIVE && { className: "ghost" })}>
        <button onClick={() => queryUpdate("movies")}>Scan Movies</button>
        <button onClick={() => queryUpdate("shows")}>Scan Shows</button>
        <button onClick={() => queryUpdate("people")}>Update People</button>
        <button onClick={() => queryMaintenace("clean")}>Clean</button>
      </div>
      <h2 id="action">{status.ACTION || "No Active Actions"}</h2>
      <div id="progress-bar">
        <div
          id="progress-bar-fill"
          style={{ width: `${status.PROGRESS || 0}%` }}
        ></div>
      </div>
    </div>
  );
};

export default Database;
