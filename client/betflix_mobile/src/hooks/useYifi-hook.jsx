import {useState} from 'react';

// Docs @ https://yts.mx/api
const root_url = 'https://yts.mx/api/v2/list_movies.json';

export default function useYifi({limit}) {
  const [results, setResults] = useState(null);
  const search = async query => {
    try {
      const res = await fetch(`${root_url}?query_term=${query}&limit=${limit}`);
      const {
        data: {movies},
      } = await res.json();
      if (!movies.length) throw new Error('no results');
      const filter = movies.map(
        ({imdb_code, title, large_cover_image, torrents}) => ({
          title_id: imdb_code,
          title,
          poster: large_cover_image,
          torrents,
        }),
      );
      setResults(filter);
    } catch (err) {
      setResults(null);
    }
  };

  return {search, results};
}
