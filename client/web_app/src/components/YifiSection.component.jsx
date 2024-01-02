import { useRef, useState, useContext } from "react";

// CSS
import styles from "../styles/YifiSection.component.module.css";

// Components
import NavButtons from "./NavButtons.component";

// Contexts
import serverContext from "../contexts/server.context";

const YifiSection = ({ title, items }) => {
  const [showModal, setShowModal] = useState(false);
  const [torrents, setTorrents] = useState([]);
  const [titleLong, setTitleLong] = useState(null);
  const scrollRef = useRef(null);
  const { serverAddress } = useContext(serverContext);

  const addTorrent = async (magnetURI) => {
    try {
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ magnetURI }),
      };
      const response = await fetch(`${serverAddress}/torrents/add`, options);
      if (response.status == 200) {
        window.location.href = "/database";
      }
    } catch (err) {}
  };

  const Torrent = ({ quality, size, type, hash, seeds, peers }) => {
    const magnetURI = `magnet:?xt=urn:btih:${hash}&dn=${encodeURIComponent(
      titleLong
    )}&tr=http://track.one:1234/announce&tr=udp://track.two:80`;
    return (
      <button onClick={() => addTorrent(magnetURI)}>
        {quality} - {size} - {type} - {seeds} seeds - {peers} peers
      </button>
    );
  };

  const Item = ({ title, titleLong, image, torrents }) => {
    return (
      <div
        className={styles.item}
        onClick={() => {
          setShowModal(true);
          setTorrents(torrents);
          setTitleLong(titleLong);
        }}
      >
        <img className={styles.itemImage} src={image} />
        <div className={styles.itemTitle}>{title}</div>
      </div>
    );
  };

  if (items && items.length > 0)
    return (
      <>
        <div className={styles.container}>
          <div className={styles.top}>
            <div className={styles.title}>{title}</div>
            <NavButtons scrollRef={scrollRef} items={items} />
          </div>
          <div className={styles.items} ref={scrollRef}>
            {items
              ? items.map((i) => (
                  <Item
                    key={i.title + i.image}
                    title={i.title}
                    image={i.image}
                    imdbId={i.imdbId}
                    torrents={i.torrents}
                  />
                ))
              : "No Items"}
          </div>
        </div>
        {showModal ? (
          <div className={styles.modalContainer}>
            <div>
              {torrents.map((torrent) => (
                <Torrent
                  hash={torrent.hash}
                  quality={torrent.quality}
                  size={torrent.size}
                  type={torrent.type}
                  seeds={torrent.seeds}
                  peers={torrent.peers}
                />
              ))}
            </div>
          </div>
        ) : (
          <></>
        )}
      </>
    );
};

export default YifiSection;
