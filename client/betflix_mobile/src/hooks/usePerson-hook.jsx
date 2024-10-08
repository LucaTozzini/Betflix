
import { useContext } from 'react';
import {addressContext} from '../../App';


export default function usePerson() {
  const SERVER_ADDRESS = useContext(addressContext);
  const fetchPerson = async person_id => {
    const response = await fetch(
      `http://${SERVER_ADDRESS}/people/person/${person_id}`,
    );
    const json = await response.json();
    return json;
  };

  return {fetchPerson};
}
