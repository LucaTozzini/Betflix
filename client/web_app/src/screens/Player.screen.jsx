import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import styles from "../styles/Player.screen.module.css";

// Icons
import {
  FaArrowLeft,
  FaVolumeLow,
  FaVolumeOff,
  FaRegClosedCaptioning,
  FaClosedCaptioning,
  FaX,
} from "react-icons/fa6";
import { useContext, useEffect } from "react";
import { RiFullscreenLine } from "react-icons/ri";
import { MdPlayArrow, MdPause } from "react-icons/md";

// Contexts
import {globalContext} from "../App.js";
import serverContext from "../contexts/server.context";

// Hooks
import useSubtitlesHook from "../hooks/useSubtitles.hook";

const Player = () => {
  //
  const { serverAddress } = useContext(serverContext);

  // data
  const { useUser } = useContext(globalContext);
  const {userId, userPin} = useUser;
  
  const { mediaId, episodeId } = useParams();
  const [episodeData, setEpisodeData] = useState(null);
  const [mediaData, setMediaData] = useState(null);
  const mediaRef = useRef(null);
  const episodeRef = useRef(null);
  const [nextEpisode, setNextEpisode] = useState(null);

  const [imdbId, setImdbId] = useState(null);
  const [pImdbId, setPImdbId] = useState(null);
  const useSubtitles = useSubtitlesHook({imdbId, pImdbId});

  // video
  const [paused, setPaused] = useState(true);
  const [progress, setProgress] = useState(null);
  const [timeString, setTimeString] = useState(null);
  const [videoSource, setVideoSource] = useState(null);
  const [durationString, setDurationString] = useState(null);
  const [fullScreen, setFullScreen] = useState(document.fullscreenElement);
  const fillRef = useRef(null);
  const barRef = useRef(null);
  const [videoRef, setVideoRef] = useState(null);
  const seekRef = useRef(false);

  // volume
  const [mute, setMute] = useState(
    () => JSON.parse(window.localStorage.getItem("playerMuted")) || false
  );
  const [volume, setVolume] = useState(
    () => JSON.parse(window.localStorage.getItem("playerVolume")) || 1
  );
  const volumeSliderRef = useRef(null);
  const volumeFillRef = useRef(null);
  const setVolumeRef = useRef(false);

  // subtitles
  const trackRef = useRef(null);
  const [arbNumber, setArbNumber] = useState(0);
  const [loadingSubtitles, setLoadingSubtitles] = useState(false);
  const [showSubtitlesModal, setShowSubtitlesModal] = useState(false);
  const [availableSubtitles, setAvailableSubtitles] = useState([]);
  const [showSubtitles, setShowSubtitles] = useState(
    () => window.localStorage.getItem("showSubtitles") === "true"
  );
  const [subtitlesLanguage, setSubtitlesLanguage] = useState(
    () => window.localStorage.getItem("subtitlesLanguage") || "en"
  );
  const [subtitlesResults, setSubtitlesResults] = useState(null);
  const [resultsLanguage, setResultsLanguage] = useState(null);
  const [manualSearch, setManualSearch] = useState("");
  const langDict = [
    {
      language_code: "af",
      language_name: "Afrikaans",
    },
    {
      language_code: "sq",
      language_name: "Albanian",
    },
    {
      language_code: "ar",
      language_name: "Arabic",
    },
    {
      language_code: "an",
      language_name: "Aragonese",
    },
    {
      language_code: "hy",
      language_name: "Armenian",
    },
    {
      language_code: "at",
      language_name: "Asturian",
    },
    {
      language_code: "eu",
      language_name: "Basque",
    },
    {
      language_code: "be",
      language_name: "Belarusian",
    },
    {
      language_code: "bn",
      language_name: "Bengali",
    },
    {
      language_code: "bs",
      language_name: "Bosnian",
    },
    {
      language_code: "br",
      language_name: "Breton",
    },
    {
      language_code: "bg",
      language_name: "Bulgarian",
    },
    {
      language_code: "my",
      language_name: "Burmese",
    },
    {
      language_code: "ca",
      language_name: "Catalan",
    },
    {
      language_code: "zh-cn",
      language_name: "Chinese (simplified)",
    },
    {
      language_code: "cs",
      language_name: "Czech",
    },
    {
      language_code: "da",
      language_name: "Danish",
    },
    {
      language_code: "nl",
      language_name: "Dutch",
    },
    {
      language_code: "en",
      language_name: "English",
    },
    {
      language_code: "eo",
      language_name: "Esperanto",
    },
    {
      language_code: "et",
      language_name: "Estonian",
    },
    {
      language_code: "fi",
      language_name: "Finnish",
    },
    {
      language_code: "fr",
      language_name: "French",
    },
    {
      language_code: "ka",
      language_name: "Georgian",
    },
    {
      language_code: "de",
      language_name: "German",
    },
    {
      language_code: "gl",
      language_name: "Galician",
    },
    {
      language_code: "el",
      language_name: "Greek",
    },
    {
      language_code: "he",
      language_name: "Hebrew",
    },
    {
      language_code: "hi",
      language_name: "Hindi",
    },
    {
      language_code: "hr",
      language_name: "Croatian",
    },
    {
      language_code: "hu",
      language_name: "Hungarian",
    },
    {
      language_code: "is",
      language_name: "Icelandic",
    },
    {
      language_code: "id",
      language_name: "Indonesian",
    },
    {
      language_code: "it",
      language_name: "Italian",
    },
    {
      language_code: "ja",
      language_name: "Japanese",
    },
    {
      language_code: "kk",
      language_name: "Kazakh",
    },
    {
      language_code: "km",
      language_name: "Khmer",
    },
    {
      language_code: "ko",
      language_name: "Korean",
    },
    {
      language_code: "lv",
      language_name: "Latvian",
    },
    {
      language_code: "lt",
      language_name: "Lithuanian",
    },
    {
      language_code: "lb",
      language_name: "Luxembourgish",
    },
    {
      language_code: "mk",
      language_name: "Macedonian",
    },
    {
      language_code: "ml",
      language_name: "Malayalam",
    },
    {
      language_code: "ms",
      language_name: "Malay",
    },
    {
      language_code: "ma",
      language_name: "Manipuri",
    },
    {
      language_code: "mn",
      language_name: "Mongolian",
    },
    {
      language_code: "no",
      language_name: "Norwegian",
    },
    {
      language_code: "oc",
      language_name: "Occitan",
    },
    {
      language_code: "fa",
      language_name: "Persian",
    },
    {
      language_code: "pl",
      language_name: "Polish",
    },
    {
      language_code: "pt-pt",
      language_name: "Portuguese",
    },
    {
      language_code: "ru",
      language_name: "Russian",
    },
    {
      language_code: "sr",
      language_name: "Serbian",
    },
    {
      language_code: "si",
      language_name: "Sinhalese",
    },
    {
      language_code: "sk",
      language_name: "Slovak",
    },
    {
      language_code: "sl",
      language_name: "Slovenian",
    },
    {
      language_code: "es",
      language_name: "Spanish",
    },
    {
      language_code: "sw",
      language_name: "Swahili",
    },
    {
      language_code: "sv",
      language_name: "Swedish",
    },
    {
      language_code: "sy",
      language_name: "Syriac",
    },
    {
      language_code: "ta",
      language_name: "Tamil",
    },
    {
      language_code: "te",
      language_name: "Telugu",
    },
    {
      language_code: "tl",
      language_name: "Tagalog",
    },
    {
      language_code: "th",
      language_name: "Thai",
    },
    {
      language_code: "tr",
      language_name: "Turkish",
    },
    {
      language_code: "uk",
      language_name: "Ukrainian",
    },
    {
      language_code: "ur",
      language_name: "Urdu",
    },
    {
      language_code: "uz",
      language_name: "Uzbek",
    },
    {
      language_code: "vi",
      language_name: "Vietnamese",
    },
    {
      language_code: "ro",
      language_name: "Romanian",
    },
    {
      language_code: "pt-br",
      language_name: "Portuguese (Brazilian)",
    },
    {
      language_code: "me",
      language_name: "Montenegrin",
    },
    {
      language_code: "zh-tw",
      language_name: "Chinese (traditional)",
    },
    {
      language_code: "ze",
      language_name: "Chinese bilingual",
    },
  ];

  useEffect(() => window.localStorage.setItem("playerMuted", mute), [mute]);
  useEffect(
    () => window.localStorage.setItem("playerVolume", volume),
    [volume]
  );

  // overlay
  let overlayTimeout;
  const [overlay, setOverlay] = useState(true);
  const controlsHover = useRef(false);

  // upadte progress
  const updateRef = useRef(true);

  const FetchMedia = async () => {
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, userPin, mediaId }),
    };
    const response = await fetch(`${serverAddress}/browse/item`, options);
    const json = await response.json();
    setMediaData(json);
  };

  const FetchSource = async () => {
    if (!mediaData) {
      return;
    }
    if (mediaData.TYPE == 1) {
      const url = `${serverAddress}/player/stream/?type=1&mediaId=${mediaData.MEDIA_ID}`;
      const response = await fetch(url);
      if (response.status == 404) {
        window.location.replace("/player/notFound");
      } else {
        setVideoSource(url);
      }
    } else if (mediaData.TYPE == 2) {
      if (episodeId == "a") {
        const options = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, userPin, mediaId }),
        };
        const response = await fetch(
          `${serverAddress}/player/current-episode`,
          options
        );
        const json = await response.json();
        setEpisodeData(json);
        setVideoSource(
          `${serverAddress}/player/stream/?type=2&mediaId=${mediaId}&episodeId=${json.EPISODE_ID}`
        );
      } else {
        const options = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            episodeId: Number(episodeId),
            userId,
            userPin,
          }),
        };
        const response = await fetch(
          `${serverAddress}/browse/episode`,
          options
        );
        const json = await response.json();
        setEpisodeData(json);
        setVideoSource(
          `${serverAddress}/player/stream/?type=2&mediaId=${mediaId}&episodeId=${episodeId}`
        );
      }
    }
  };

  const FetchResume = async () => {
    const options =
      mediaData.TYPE == 1
        ? {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, userPin, mediaId }),
          }
        : {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              userPin,
              episodeId: episodeData.EPISODE_ID,
            }),
          };

    const response = await fetch(`${serverAddress}/player/resume`, options);
    if (response.status != 200) return;
    const time = await response.json();
    videoRef.currentTime = time;
  };

  const FetchNext = async () => {
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ episodeId: episodeData.EPISODE_ID }),
    };
    const response = await fetch(`${serverAddress}/player/next`, options);
    const json = await response.json();
    setNextEpisode(json);
  };

  const handleSeek = (e) => {
    if (!seekRef.current || !barRef.current || !videoRef) return;
    const { clientX } = e;
    let perc =
      (clientX - barRef.current.offsetLeft) / barRef.current.offsetWidth;
    perc = Math.min(1, perc);
    perc = Math.max(0, perc);
    videoRef.currentTime = videoRef.duration * perc;
    fillRef.current.style.width = `${perc * 100}%`;
  };

  const handleVolume = (e) => {
    if (
      !volumeSliderRef.current ||
      !setVolumeRef.current ||
      !volumeFillRef.current
    )
      return;
    const { clientX } = e;
    let perc =
      (clientX - volumeSliderRef.current.offsetLeft) /
      volumeSliderRef.current.offsetWidth;
    perc = Math.min(1, perc);
    perc = Math.max(0, perc);
    videoRef.volume = perc;
    setVolume(perc);
    volumeFillRef.current.style.width = `${perc * 100}%`;
  };

  const handleTimeString = () => {
    if (videoRef) {
      const currentTime = videoRef.currentTime;
      const hours = Math.floor(currentTime / 3600);
      let minutes = Math.floor((currentTime - hours * 3600) / 60);
      if (minutes < 10) minutes = "0" + minutes;
      let seconds = Math.floor(currentTime - hours * 3600 - minutes * 60);
      if (seconds < 10) seconds = "0" + seconds;
      const string =
        hours > 0 ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`;
      setTimeString(string);

      if (durationString == null) {
        const currentTime = videoRef.duration;
        const hours = Math.floor(currentTime / 3600);
        let minutes = Math.floor((currentTime - hours * 3600) / 60);
        if (minutes < 10) minutes = "0" + minutes;
        let seconds = Math.floor(currentTime - hours * 3600 - minutes * 60);
        if (seconds < 10) seconds = "0" + seconds;
        const string =
          hours > 0
            ? `${hours}:${minutes}:${seconds}`
            : `${minutes}:${seconds}`;
        setDurationString(string);
      }
    }
  };

  const handleOverlay = () => {
    clearTimeout(overlayTimeout);
    setOverlay(true);
    if (controlsHover.current || setVolumeRef.current || seekRef.current)
      return;
    overlayTimeout = setTimeout(() => setOverlay(false), 2000);
  };

  const updateContinue = async () => {
    if (
      !updateRef.current ||
      !mediaRef.current ||
      (mediaRef.current.TYPE == 2 && !episodeRef.current)
    )
      return;
    updateRef.current = false;
    const body = JSON.stringify({
      userId,
      userPin,
      mediaId,
      episodeId: episodeRef.current ? episodeRef.current.EPISODE_ID : -1,
      progressTime: videoRef.currentTime,
      endTime: videoRef.duration - videoRef.currentTime,
    });
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    };
    await fetch(`${serverAddress}/users/update-continue`, options);
    setTimeout(() => {
      updateRef.current = true;
    }, 3000);
  };

  useEffect(() => {
    FetchMedia();
    const mouseUp = () => {
      seekRef.current = false;
      setVolumeRef.current = false;
    };
    document.body.addEventListener("mouseup", mouseUp);
    document.body.addEventListener("mousemove", handleSeek);
    document.body.addEventListener("mousemove", handleVolume);
    document.body.addEventListener("mousemove", handleOverlay);
    return () => {
      document.body.removeEventListener("mouseup", mouseUp);
      document.body.removeEventListener("mousemove", handleSeek);
      document.body.removeEventListener("mousemove", handleVolume);
      document.body.removeEventListener("mousemove", handleOverlay);
    };
  }, []);

  useEffect(() => {
    if (mediaData && videoRef) {
      mediaRef.current = mediaData;
      FetchSource();
      if (mediaData.TYPE == 1) {
        FetchResume();
      }
    }
  }, [mediaData, videoRef]);

  useEffect(() => {
    if (episodeData) {
      episodeRef.current = episodeData;
      FetchResume();
      FetchNext();
    }
  }, [episodeData]);

  useEffect(() => {
    if (videoRef) {
      paused ? videoRef.pause() : videoRef.play();
    }
  }, [paused]);

  useEffect(() => {
    if (videoRef) {
      const updateProgress = () => {
        setProgress(videoRef.currentTime / videoRef.duration);
      };
      videoRef.addEventListener("pause", () => setPaused(true));
      videoRef.addEventListener("play", () => setPaused(false));
      videoRef.addEventListener("timeupdate", () => {
        updateProgress();
        updateContinue();
        handleTimeString();
      });
      videoRef.volume = volume;
    }
  }, [videoRef]);

  useEffect(() => {
    if (progress == 1 && nextEpisode) {
      window.location.replace(
        `/player/reroute/${nextEpisode.MEDIA_ID}/${nextEpisode.EPISODE_ID}`
      );
    }
    if (fillRef.current && !seekRef.current) {
      fillRef.current.style.width = `${progress * 100}%`;
    }
  }, [progress]);

  useEffect(() => {
    if (fullScreen) document.body.requestFullscreen();
    else if (document.fullscreenElement) document.exitFullscreen();
  }, [fullScreen]);

  useEffect(() => {
    if (!videoRef) return;
    videoRef.muted = mute;
  }, [mute]);

  useEffect(() => {
    window.localStorage.setItem("showSubtitles", showSubtitles);
  }, [showSubtitles]);



  if (mediaData)
    return (
      <>
        <video
          ref={setVideoRef}
          src={videoSource}
          className={styles.video}
          crossOrigin="anonymous"
        >
          {/* Add your <track> element here */}
          {showSubtitles ? (
            <track
              ref={trackRef}
              src={`${serverAddress}/subtitles?imdbId=${mediaData.IMDB_ID}&language=${subtitlesLanguage}&extension=vtt&arbNumber=${arbNumber}`}
              kind="subtitles"
              srcLang="en"
              label="English"
              default
            />
          ) : (
            <></>
          )}
        </video>

        <div
          className={styles.overlay}
          style={{
            opacity: overlay ? 1 : 0,
            cursor: overlay ? "default" : "none",
          }}
        >
          <div className={styles.top}>
            <Link
              onClick={() => {
                videoRef.pause();
                window.history.back();
              }}
            >
              <FaArrowLeft />
            </Link>
            <Link to={`/browse/item/${mediaId}`}>
              {episodeData ? (
                `S${episodeData.SEASON_NUM}:E${episodeData.EPISODE_NUM} - `
              ) : (
                <></>
              )}
              {episodeData
                ? episodeData.TITLE
                : mediaData
                ? mediaData.TITLE
                : ""}
            </Link>
          </div>

          <div
            className={styles.middle}
            onClick={() => (paused ? videoRef.play() : videoRef.pause())}
          >
            <div className={styles.middlePlay}>
              {paused ? <MdPlayArrow /> : <MdPause />}
            </div>
          </div>

          <div
            className={styles.controls}
            onMouseEnter={() => (controlsHover.current = true)}
            onMouseLeave={() => (controlsHover.current = false)}
          >
            <div
              className={styles.progressFrame}
              onMouseUp={(e) => {
                if (seekRef.current) handleSeek(e);
              }}
              onMouseDown={() => (seekRef.current = true)}
            >
              <div className={styles.progressBar} ref={barRef}>
                <div className={styles.progressFill} ref={fillRef}>
                  <div className={styles.progressKnob} />
                </div>
              </div>
            </div>
            <div className={styles.buttonRow}>
              <div className={styles.buttonSection}>
                <button className={styles.volume}>
                  {mute ? (
                    <FaVolumeOff size={"2rem"} onClick={() => setMute(false)} />
                  ) : (
                    <FaVolumeLow size={"2rem"} onClick={() => setMute(true)} />
                  )}
                  <div
                    className={styles.volumeSliderFrame}
                    onMouseUp={(e) => {
                      if (setVolumeRef.current) handleVolume(e);
                    }}
                    onMouseDown={() => (setVolumeRef.current = true)}
                    ref={volumeSliderRef}
                  >
                    <div className={styles.volumeSlider}>
                      <div
                        className={styles.volumeFill}
                        style={{ width: `${volume * 100}%` }}
                        ref={volumeFillRef}
                      >
                        <div className={styles.volumeKnob} />
                      </div>
                    </div>
                  </div>
                </button>
                <h3 className={styles.time}>
                  {timeString || "--:--"} / {durationString || "--:--"}
                </h3>
              </div>
              <div className={styles.buttonSection}>
                {showSubtitles ? (
                  <button
                    className={styles.languageButton}
                    onClick={() => setShowSubtitlesModal(true)}
                  >
                    {availableSubtitles.length
                      ? langDict.filter(
                          (i) =>
                            i.language_code == subtitlesLanguage.toLowerCase()
                        )[0].language_name
                      : "Not Available"}
                  </button>
                ) : (
                  <></>
                )}
                <button
                  className={styles.b}
                  onClick={() => setShowSubtitles(!showSubtitles)}
                >
                  {showSubtitles ? (
                    <FaClosedCaptioning />
                  ) : (
                    <FaRegClosedCaptioning />
                  )}
                </button>
                <button
                  className={styles.b}
                  onClick={() => setFullScreen(!fullScreen)}
                >
                  <RiFullscreenLine />
                </button>
              </div>
            </div>
          </div>
        </div>

        {nextEpisode &&
        videoRef &&
        videoRef.duration - videoRef.currentTime < 60 ? (
          <Link
            className={styles.nextUp}
            to={`/player/reroute/${nextEpisode.MEDIA_ID}/${nextEpisode.EPISODE_ID}`}
            replace
          >
            <MdPlayArrow />
            <div>
              S{nextEpisode.SEASON_NUM}:E{nextEpisode.EPISODE_NUM} -{" "}
              {nextEpisode.TITLE}
            </div>
          </Link>
        ) : (
          <></>
        )}

        {showSubtitlesModal ? (
          <div
            className={styles.subtitlesModal}
            onClick={() => setShowSubtitlesModal(false)}
          >
            <div
              className={styles.subtitlesContainer}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.subtitlesTop}>
                <div
                  className={styles.subtitlesSection}
                  style={{ alignItems: "flex-end" }}
                >
                  <button
                    className={styles.closeSubtitles}
                    onClick={() => setShowSubtitlesModal(false)}
                  >
                    {" "}
                    <FaX />{" "}
                  </button>
                </div>
                {loadingSubtitles ? <div>Loading</div> : <></>}
              </div>

              {availableSubtitles.length ? (
                <div className={styles.subtitlesSection}>
                  <h1>Available</h1>
                  <div className={styles.subtitlesList}>
                    {availableSubtitles
                      .filter((i) => i.EXT == "vtt")
                      .map((i) => (
                        <button
                          key={i.LANG}
                          onClick={() => setSubtitlesLanguage(i.LANG)}
                          className={
                            i.LANG == subtitlesLanguage
                              ? styles.selectedSubtitle
                              : ""
                          }
                        >
                          {
                            langDict.filter(
                              (x) => x.language_code == i.LANG.toLowerCase()
                            )[0].language_name
                          }
                        </button>
                      ))}
                  </div>
                </div>
              ) : (
                <></>
              )}

              {availableSubtitles.find((i) => i.LANG == "en") &&
              availableSubtitles.find((i) => i.LANG == "it") &&
              availableSubtitles.find((i) => i.LANG == "es") &&
              availableSubtitles.find((i) => i.LANG == "fr") ? (
                <></>
              ) : (
                <div className={styles.subtitlesSection}>
                  <h1>Quick Download</h1>
                  <div className={styles.subtitlesList}>
                    {availableSubtitles.find((i) => i.LANG == "en") ? (
                      <></>
                    ) : (
                      <button onClick={() => useSubtitles.quickFetch("en")}>
                        English
                      </button>
                    )}
                    {availableSubtitles.find((i) => i.LANG == "it") ? (
                      <></>
                    ) : (
                      <button onClick={() => useSubtitles.quickFetch("it")}>
                        Italian
                      </button>
                    )}
                    {availableSubtitles.find((i) => i.LANG == "es") ? (
                      <></>
                    ) : (
                      <button onClick={() => useSubtitles.quickFetch("es")}>
                        Spanish
                      </button>
                    )}
                    {availableSubtitles.find((i) => i.LANG == "fr") ? (
                      <></>
                    ) : (
                      <button onClick={() => useSubtitles.quickFetch("fr")}>
                        French
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className={styles.subtitlesSection}>
                <h1>Manual Download</h1>
                <input
                  type="text"
                  placeholder="Search Language"
                  className={styles.subtitlesLanguageInput}
                  onChange={(e) => setManualSearch(e.target.value)}
                />
                <div className={styles.subtitlesList}>
                  {langDict
                    .filter((i) =>
                      manualSearch.length > 0
                        ? manualSearch == "*"
                          ? true
                          : i.language_name
                              .toLowerCase()
                              .includes(manualSearch.toLowerCase())
                        : false
                    )
                    .map((i) => (
                      <button
                        key={i.language_code}
                        onClick={() => useSubtitles.search(i.language_code)}
                      >
                        {i.language_name}
                      </button>
                    ))}
                </div>
              </div>

              {subtitlesResults ? (
                <div className={styles.subtitlesSection}>
                  <h1>
                    Results -{" "}
                    {
                      langDict.find(
                        (i) =>
                          i.language_code ==
                          subtitlesResults[0].attributes.language.toLowerCase()
                      ).language_name
                    }
                  </h1>
                  <div className={styles.subtitlesList}>
                    {subtitlesResults.map((i) => (
                      <button
                        key={i.attributes.files[0].file_id}
                        onClick={() =>
                          useSubtitles.download(
                            i.attributes.language,
                            i.attributes.files[0].file_id
                          )
                        }
                      >
                        {i.attributes.release}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>
        ) : (
          <></>
        )}
      </>
    );
};

export default Player;
