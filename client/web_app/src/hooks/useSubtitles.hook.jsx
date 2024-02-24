import { useContext, useEffect, useState } from "react";
import serverContext from "../contexts/server.context";

export default ({ imdbId, pImdbId }) => {
  const { serverAddress } = useContext(serverContext);
  const [loading, setLoading] = useState(false);
  const [available, setAvailable] = useState(null);
  const [resultLang, setResultLang] = useState(null);
  const [results, setResults] = useState(null);

  useEffect(() => {
    fetchAvailable();
  }, [imdbId, pImdbId]);

  const quickFetch = (lang) =>
    new Promise(async (res, rej) => {
      setLoading(true);
      try {
        const parentQuery = pImdbId ? `&parentImdbId=${pImdbId}` : "";
        const response = await fetch(
          `${serverAddress}/subtitles?imdbId=${imdbId}${parentQuery}&language=${lang}`
        );
        if (response.status !== 200) {
          res(true);
        } else {
          throw new Error("quickFetch Fetch Error");
        }
      } catch (err) {
        rej(err);
      }
      setLoading(false);
    });

  const search = (lang) =>
    new Promise(async (res, rej) => {
      setLoading(true);
      try {
        const parentQuery = pImdbId ? `&parentImdbId=${pImdbId}` : "";
        const response = await fetch(
          `${serverAddress}/subtitles/search?imdbId=${imdbId}${parentQuery}&language=${lang}`
        );
        if (response.status !== 200) {
          throw new Error("searchSubs Fetch Error");
        }
        const json = await response.json();
        setResults(json);
        setResultLang(lang);
        res(json);
      } catch (err) {
        rej(err);
      }
      setLoading(false);
    });

  const download = (lang, fileId) =>
    new Promise(async (res, rej) => {
      setLoading(true);
      try {
        const response = await fetch(
          `${serverAddress}/subtitles/download?imdbId=${imdbId}&language=${lang}&fileId=${fileId}&extension=vtt`
        );

        if (response.status === 200) {
          res(true);
          fetchAvailable({ imdbId });
        } else {
          throw new Error("download Fetch Error");
        }
        res(true);
      } catch (err) {
        rej(err);
      }
      setLoading(false);
    });

  const fetchAvailable = () =>
    new Promise(async (res, rej) => {
      setLoading(true);
      try {
        const response = await fetch(
          `${serverAddress}/subtitles/available?imdbId=${imdbId}&extension=vtt`
        );

        if (response.status !== 200) {
          throw new Error("fetchAvailable Fetch Error");
        }

        const json = await response.json();
        setAvailable(json);
        res(json);
      } catch (err) {
        rej(err);
      }
      setLoading(false);
    });

  return {
    // States
    loading,
    available,
    resultLang,
    results,

    // Functions
    search,
    download,
    quickFetch,
  };
};
