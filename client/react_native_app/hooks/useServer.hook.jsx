import { useContext, useEffect, useState } from "react"

// Contexts
import { globalContext } from "../App";

export default () => {
  const [active, setActive] = useState(null);
  const [action, setAction] = useState(null);
  const [progress, setProgress] = useState(null);
  const [logs, setLogs] = useState([]);
  const {address} = useContext(globalContext);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${address}/database/status`);
      const {ACTION, PROGRESS, ACTIVE, LOGS} = await response.json();
      setActive(ACTIVE);
      setAction(ACTION);
      setProgress(PROGRESS);
      setLogs(LOGS);
    } catch (err) {
      setActive(null);
      setAction(null);
      setProgress(null);
    }

    setTimeout(fetchStatus, 500);
  }

  const update = (item) => {
    try {
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
      }
      fetch(`${address}/database/update/${item}`,options)
    } catch(err) {

    }
  }

  useEffect(() => {
    fetchStatus();
  }, []);


  return {active, action, progress, logs, update}
}