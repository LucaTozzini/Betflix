import { useState, useEffect, useContext } from 'react';
import styles from '../styles/ImagesModal.component.module.css';

// Icons
import { IoCloseSharp, IoCheckmarkSharp, IoPencilSharp } from 'react-icons/io5';

// Contexts
import serverContext from '../contexts/server.context';
import currentUserContext from '../contexts/currentUser.context';

const ImagesModal = ({ show, setShow, mediaId }) => {
  const [ imageSection, setImageSection ] = useState(0);
  const { serverAddress } = useContext(serverContext);
  const { userId, userPin } = useContext(currentUserContext);

  const [ setting, setSetting ] = useState(false);
  
  const [ posters, setPosters ] = useState(null);
  const [ postersNt, setPostersNt ] = useState(null);
  const [ postersWide, setPostersWide ] = useState(null);
  const [ backdrops, setBackdrops ] = useState(null);
  const [ logos, setLogos ] = useState(null);

  const [ selectedPoster, setSelectedPoster ] = useState(null);
  const [ selectedPosterNt, setSelectedPosterNt ] = useState(null);
  const [ selectedPosterWide, setSelectedPosterWide ] = useState(null);
  const [ selectedBackdrop, setSelectedBackdrop ] = useState(null);
  const [ selectedLogo, setSelectedLogo ] = useState(null);

  const FetchImages = async () => {
    try {
      const response = await fetch(`${serverAddress}/browse/images?mediaId=${mediaId}`);
      const json = await response.json();
      setPosters(json.posters);
      setPostersNt(json.posters_nt);
      setPostersWide(json.posters_wide);
      setBackdrops(json.backdrops);
      setLogos(json.logos);
    }
    catch(err) {

    }
  };

  const handleClear = () => {
    setSelectedPoster(null);
    setSelectedPosterNt(null);
    setSelectedPosterWide(null);
    setSelectedBackdrop(null);
    setSelectedLogo(null);
  };

  const SetPoster = () => new Promise(async (res, rej) => {
    try {
      if(!selectedPoster) return res();
      const options = { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ small: selectedPoster.small, large: selectedPoster.large, mediaId, userId, userPin }) 
      };
      await fetch(`${serverAddress}/database/poster`, options);
      res();
    }
    catch(err) {
      rej(err);
    }
  });

  const SetPosterNt = () => new Promise(async (res, rej) => {
    try {
      if(!selectedPosterNt) return res();
      const options = { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ small: selectedPosterNt.small, large: selectedPosterNt.large, mediaId, userId, userPin }) 
      };
      await fetch(`${serverAddress}/database/poster-nt`, options);
      res();
    }
    catch(err) {
      rej(err);
    }
  });

  const SetPosterWide = () => new Promise(async (res, rej) => {
    try {
      if(!selectedPosterWide) return res();
      const options = { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ small: selectedPosterWide.small, large: selectedPosterWide.large, mediaId, userId, userPin }) 
      };
      await fetch(`${serverAddress}/database/poster-w`, options);
      res();
    }
    catch(err) {
      rej(err);
    }
  });

  const SetBackdrop = () => new Promise(async (res, rej) => {
    try {
      if(!selectedBackdrop) return res();
      const options = { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ small: selectedBackdrop.small, large: selectedBackdrop.large, mediaId, userId, userPin }) 
      };
      await fetch(`${serverAddress}/database/backdrop`, options);
      res();
    }
    catch(err) {
      rej(err);
    }
  });

  const SetLogo = () => new Promise(async (res, rej) => {
    try {
      if(!selectedLogo) return res();
      const options = { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ small: selectedLogo.small, large: selectedLogo.large, mediaId, userId, userPin }) 
      };
      await fetch(`${serverAddress}/database/logo`, options);
      res();
    }
    catch(err) {
      rej(err);
    }
  });

  const handleSet = async () => {
    try {
      setSetting(true);
      await SetPoster();
      await SetPosterNt();
      await SetPosterWide();
      await SetBackdrop();
      await SetLogo();
      setShow(false);
    }
    catch(err) {
      
    }
    setSetting(false);
  };

  useEffect(() => {
    if(show) {
      FetchImages();
    }
  }, [show]);

  const ImageOverlay = () => {
    return (
      <div className={styles.overlay}>
        <div className={styles.overlayIcon}>
          <IoCheckmarkSharp/>
        </div>
      </div>
    )
  }

  const Images = () => {
    if(imageSection == 0) {
      if(!posters) return null
      else return posters.map(i => 
        <div 
          key={i.small} 
          className={styles.poster} 
          style={{backgroundImage: `url(${i.small})`}} 
          onClick={() => setSelectedPoster(selectedPoster && selectedPoster.small == i.small ? null : i)}
        >
          { selectedPoster && (selectedPoster.small == i.small) ? <ImageOverlay/> : <></> }
        </div>
      )
    }
    else if(imageSection == 1) {
      if(!postersNt) return null
      else return postersNt.map(i => 
        <div 
          key={i.small} 
          className={styles.poster} 
          style={{backgroundImage: `url(${i.small})`}} 
          onClick={() => setSelectedPosterNt(selectedPosterNt && selectedPosterNt.small == i.small ? null : i)}
        >
          { selectedPosterNt && (selectedPosterNt.small == i.small) ? <ImageOverlay/> : <></> }
        </div>
      )
    }
    else if(imageSection == 2) {
      if(!postersWide) return null
      else return postersWide.map(i => 
        <div 
          key={i.small} 
          className={styles.backdrop} 
          style={{backgroundImage: `url(${i.small})`}} 
          onClick={() => setSelectedPosterWide(selectedPosterWide && selectedPosterWide.small == i.small ? null : i)}
        >
          { selectedPosterWide && (selectedPosterWide.small == i.small) ? <ImageOverlay/> : <></> }
        </div>
      )
    }
    else if(imageSection == 3) {
      if(!backdrops) return null
      else return backdrops.map(i => 
        <div 
          key={i.small} 
          className={styles.backdrop} 
          style={{backgroundImage: `url(${i.small})`}} 
          onClick={() => setSelectedBackdrop(selectedBackdrop && selectedBackdrop.small == i.small ? null : i)}
        >
          { selectedBackdrop && (selectedBackdrop.small == i.small) ? <ImageOverlay/> : <></> }
        </div>
      )
    }
    else if(imageSection == 4) {
      if(!logos) return null
      else return logos.map(i => 
        <div 
          key={i.small} 
          className={styles.logo} 
          style={{backgroundImage: `url(${i.small})`}} 
          onClick={() => setSelectedLogo(selectedLogo && selectedLogo.small == i.small ? null : i)}
        >
          { selectedLogo && (selectedLogo.small == i.small) ? <ImageOverlay/> : <></> }
        </div>
      )
    }

  }

  if(show && setting) return (
    <div className={styles.dock}>
      <img src="https://cdn.pixabay.com/animation/2022/07/29/03/42/03-42-11-849_512.gif" className={styles.loadingImg}/>
    </div>
  )

  else if(show && !setting) return (
    <div className={styles.dock}>
      <div className={styles.top}>
        <button onClick={() => setShow(false)}>
          <IoCloseSharp/>
        </button>
      </div>
      
      <div className={styles.container}>
        <div className={styles.menu}>
          <div className={styles.menuTitle}>Posters</div>
          <button style={imageSection == 0 ? {backgroundColor: 'rgba(255, 255, 255, 0.2)'} : {}} onClick={() => setImageSection(0)}> Default {selectedPoster ? <IoPencilSharp className={styles.menuIcon}/> : <></>} </button>
          <button style={imageSection == 1 ? {backgroundColor: 'rgba(255, 255, 255, 0.2)'} : {}} onClick={() => setImageSection(1)}>No Text {selectedPosterNt ? <IoPencilSharp className={styles.menuIcon}/> : <></>} </button>
          <button style={imageSection == 2 ? {backgroundColor: 'rgba(255, 255, 255, 0.2)'} : {}} onClick={() => setImageSection(2)}>Wide {selectedPosterWide ? <IoPencilSharp className={styles.menuIcon}/> : <></>} </button>
          <div className={styles.menuTitle}>Other</div>
          <button style={imageSection == 3 ? {backgroundColor: 'rgba(255, 255, 255, 0.2)'} : {}} onClick={() => setImageSection(3)}>Backdrops {selectedBackdrop ? <IoPencilSharp className={styles.menuIcon}/> : <></>} </button>
          <button style={imageSection == 4 ? {backgroundColor: 'rgba(255, 255, 255, 0.2)'} : {}} onClick={() => setImageSection(4)}>Logos {selectedLogo ? <IoPencilSharp className={styles.menuIcon}/> : <></>} </button>
        </div>
        <div className={styles.images}>
          <Images/>
        </div>
      </div>

      <div className={styles.bottom}>
        <button onClick={handleClear} style={ selectedPoster || selectedPosterNt || selectedPosterWide || selectedBackdrop || selectedLogo ? {} : {pointerEvents: 'none', opacity: '.2'} }>Clear</button>
        <button onClick={handleSet} style={ selectedPoster || selectedPosterNt || selectedPosterWide || selectedBackdrop || selectedLogo ? {} : {pointerEvents: 'none', opacity: '.2'} }>Set Images</button>
      </div>
    </div>
  );
};

export default ImagesModal;