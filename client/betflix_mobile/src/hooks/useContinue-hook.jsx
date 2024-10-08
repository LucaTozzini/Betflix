import {useContext, useEffect, useState} from 'react';
import { addressContext } from '../../App';

export default function useContinue({current}) {
  const SERVER_ADDRESS = useContext(addressContext);
  const [continues, setContinues] = useState(null);

  useEffect(() => {
    if(current) {
      fetchContinues();
    }
  }, [current]);

  async function fetchContinues() {
    const response = await fetch(
      `http://${SERVER_ADDRESS}/continue/${current.user_id}`,
    );
    const json = await response.json();
    setContinues(json);
  }

  return {fetchContinues, continues};
}
