import { useContext } from 'react';
import {addressContext} from '../../App';

export default function useTitles() {
  const SERVER_ADDRESS = useContext(addressContext)
  async function fetchItem(title_id) {
    const response = await fetch(
      `http://${SERVER_ADDRESS}/titles/title/${title_id}`,
    );
    const item = await response.json();
    return item;
  }

  async function fetchLatest() {
    const response = await fetch(`http://${SERVER_ADDRESS}/titles/latest`);
    const items = await response.json();
    return items;
  }

  async function fetchVoted() {
    const response = await fetch(`http://${SERVER_ADDRESS}/titles/voted`);
    const items = await response.json();
    return items;
  }

  async function fetchAvailableSeasons(title_id) {
    const response = await fetch(
      `http://${SERVER_ADDRESS}/titles/title/${title_id}/seasons/available`,
    );
    const available = await response.json();
    return available;
  }

  async function fetchEpisodes(title_id, season_num) {
    const response = await fetch(
      `http://${SERVER_ADDRESS}/titles/title/${title_id}/seasons/${season_num}`,
    );
    const episodes = await response.json();
    return episodes;
  }

  async function fetchSimilar(title_id) {
    const response = await fetch(
      `http://${SERVER_ADDRESS}/titles/title/${title_id}/similar`,
    );
    const similar = await response.json();
    return similar;
  }

  async function fetchFilmography(person_id) {
    const response = await fetch(
      `http://${SERVER_ADDRESS}/people/filmography/${person_id}`,
    );
    const filmography = await response.json();
    return filmography;
  }

  return {
    fetchItem,
    fetchLatest,
    fetchVoted,
    fetchEpisodes,
    fetchAvailableSeasons,
    fetchSimilar,
    fetchFilmography,
  };
}
