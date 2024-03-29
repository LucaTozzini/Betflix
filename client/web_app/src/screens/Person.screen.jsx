import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Icons
import { FaCircleUser } from "react-icons/fa6";

// CSS
import styles from "../styles/Person.screen.module.css";

// Contexts
import serverContext from "../contexts/server.context";

// Components
import MediaSection from "../components/MediaSection.component";

const Person = () => {
  const { personId } = useParams();

  const { serverAddress } = useContext(serverContext);

  const [personData, setPersonData] = useState(null);
  const [filmography, setFilmography] = useState(null);
  const [directed, setDirected] = useState(null);

  const [fullBio, setFullBio] = useState(null);

  const FetchPerson = async () => {
    try {
      const response = await fetch(
        `${serverAddress}/browse/person?personId=${personId}`
      );
      const json = await response.json();
      setPersonData(json);
    } catch (err) {}
  };

  const FetchFilmography = async () => {
    try {
      const response = await fetch(
        `${serverAddress}/browse/person/filmography?personId=${personId}`
      );
      const json = await response.json();
      json.sort((a, b) => (a.START_DATE < b.START_DATE ? 1 : -1));
      setFilmography(json);
    } catch (err) {}
  };

  const FetchDirected = async () => {
    try {
      const response = await fetch(
        `${serverAddress}/browse/person/directed?personId=${personId}`
      );
      const json = await response.json();
      json.sort((a, b) => (a.START_DATE < b.START_DATE ? 1 : -1));
      setDirected(json);
    } catch (err) {}
  };

  useEffect(() => {
    FetchPerson();
  }, []);
  
  useEffect(() => {
    FetchDirected();  
    FetchFilmography();
  }, [personId]);

  const Info = () => {
    const MONTHS = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    if (personData.BIRTH_DATE && personData.DEATH_DATE) {
      const birthdate = personData.BIRTH_DATE.split("-");
      const birthMonth = MONTHS[parseInt(birthdate[1]) - 1];

      const deathdate = personData.DEATH_DATE.split("-");
      const deathMonth = MONTHS[parseInt(deathdate[1]) - 1];

      return (
        <div className={styles.info}>
          <h1 className={styles.name}>{personData.NAME}</h1>
          <h2 className={styles.birthdate}>{`${birthMonth} ${parseInt(
            birthdate[2]
          )}, ${birthdate[0]} - ${deathMonth} ${parseInt(deathdate[2])}, ${
            deathdate[0]
          }`}</h2>
          <p
            className={styles.biography}
            onClick={() => setFullBio(!fullBio)}
            style={fullBio ? { WebkitLineClamp: 10000 } : null}
          >
            {personData.BIOGRAPHY}
          </p>
        </div>
      );
    } else if (personData.BIRTH_DATE) {
      const birthdate = personData.BIRTH_DATE.split("-");
      const birthMonth = MONTHS[parseInt(birthdate[1]) - 1];

      return (
        <div className={styles.info}>
          <h1 className={styles.name}>{personData.NAME}</h1>
          <h2 className={styles.birthdate}>{`${birthMonth} ${parseInt(
            birthdate[2]
          )}, ${birthdate[0]}`}</h2>
          <p
            className={styles.biography}
            onClick={() => setFullBio(!fullBio)}
            style={fullBio ? { WebkitLineClamp: 10000 } : null}
          >
            {personData.BIOGRAPHY}
          </p>
        </div>
      );
    } else {
      return (
        <div className={styles.info}>
          <h1 className={styles.name}>{personData.NAME}</h1>
          <p
            className={styles.biography}
            onClick={() => setFullBio(!fullBio)}
            style={fullBio ? { WebkitLineClamp: 10000 } : null}
          >
            {personData.BIOGRAPHY}
          </p>
        </div>
      );
    }
  };

  if (personData)
    return (
      <div className={styles.container}>
        <div className={styles.top}>
          {personData.PROFILE_IMAGE ? (
            <img
              src={personData.PROFILE_IMAGE}
              className={styles.profileImage}
            />
          ) : (
            <div className={styles.profileIcon}>
              <FaCircleUser />
            </div>
          )}

          <Info />
        </div>

        <MediaSection title={"Directed"} items={directed || []} />
        <MediaSection title={"Appeared In"} items={filmography || []} />
      </div>
    );
};

export default Person;
