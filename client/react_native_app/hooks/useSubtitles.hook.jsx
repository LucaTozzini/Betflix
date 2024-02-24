import {useContext, useEffect, useState} from 'react';
import {globalContext} from '../App';

import vttToJson from 'vtt-2-json';


const langDict = [
  {
    language_code: 'af',
    language_name: 'Afrikaans',
  },
  {
    language_code: 'sq',
    language_name: 'Albanian',
  },
  {
    language_code: 'ar',
    language_name: 'Arabic',
  },
  {
    language_code: 'an',
    language_name: 'Aragonese',
  },
  {
    language_code: 'hy',
    language_name: 'Armenian',
  },
  {
    language_code: 'at',
    language_name: 'Asturian',
  },
  {
    language_code: 'eu',
    language_name: 'Basque',
  },
  {
    language_code: 'be',
    language_name: 'Belarusian',
  },
  {
    language_code: 'bn',
    language_name: 'Bengali',
  },
  {
    language_code: 'bs',
    language_name: 'Bosnian',
  },
  {
    language_code: 'br',
    language_name: 'Breton',
  },
  {
    language_code: 'bg',
    language_name: 'Bulgarian',
  },
  {
    language_code: 'my',
    language_name: 'Burmese',
  },
  {
    language_code: 'ca',
    language_name: 'Catalan',
  },
  {
    language_code: 'zh-cn',
    language_name: 'Chinese (simplified)',
  },
  {
    language_code: 'cs',
    language_name: 'Czech',
  },
  {
    language_code: 'da',
    language_name: 'Danish',
  },
  {
    language_code: 'nl',
    language_name: 'Dutch',
  },
  {
    language_code: 'en',
    language_name: 'English',
  },
  {
    language_code: 'eo',
    language_name: 'Esperanto',
  },
  {
    language_code: 'et',
    language_name: 'Estonian',
  },
  {
    language_code: 'fi',
    language_name: 'Finnish',
  },
  {
    language_code: 'fr',
    language_name: 'French',
  },
  {
    language_code: 'ka',
    language_name: 'Georgian',
  },
  {
    language_code: 'de',
    language_name: 'German',
  },
  {
    language_code: 'gl',
    language_name: 'Galician',
  },
  {
    language_code: 'el',
    language_name: 'Greek',
  },
  {
    language_code: 'he',
    language_name: 'Hebrew',
  },
  {
    language_code: 'hi',
    language_name: 'Hindi',
  },
  {
    language_code: 'hr',
    language_name: 'Croatian',
  },
  {
    language_code: 'hu',
    language_name: 'Hungarian',
  },
  {
    language_code: 'is',
    language_name: 'Icelandic',
  },
  {
    language_code: 'id',
    language_name: 'Indonesian',
  },
  {
    language_code: 'it',
    language_name: 'Italian',
  },
  {
    language_code: 'ja',
    language_name: 'Japanese',
  },
  {
    language_code: 'kk',
    language_name: 'Kazakh',
  },
  {
    language_code: 'km',
    language_name: 'Khmer',
  },
  {
    language_code: 'ko',
    language_name: 'Korean',
  },
  {
    language_code: 'lv',
    language_name: 'Latvian',
  },
  {
    language_code: 'lt',
    language_name: 'Lithuanian',
  },
  {
    language_code: 'lb',
    language_name: 'Luxembourgish',
  },
  {
    language_code: 'mk',
    language_name: 'Macedonian',
  },
  {
    language_code: 'ml',
    language_name: 'Malayalam',
  },
  {
    language_code: 'ms',
    language_name: 'Malay',
  },
  {
    language_code: 'ma',
    language_name: 'Manipuri',
  },
  {
    language_code: 'mn',
    language_name: 'Mongolian',
  },
  {
    language_code: 'no',
    language_name: 'Norwegian',
  },
  {
    language_code: 'oc',
    language_name: 'Occitan',
  },
  {
    language_code: 'fa',
    language_name: 'Persian',
  },
  {
    language_code: 'pl',
    language_name: 'Polish',
  },
  {
    language_code: 'pt-pt',
    language_name: 'Portuguese',
  },
  {
    language_code: 'ru',
    language_name: 'Russian',
  },
  {
    language_code: 'sr',
    language_name: 'Serbian',
  },
  {
    language_code: 'si',
    language_name: 'Sinhalese',
  },
  {
    language_code: 'sk',
    language_name: 'Slovak',
  },
  {
    language_code: 'sl',
    language_name: 'Slovenian',
  },
  {
    language_code: 'es',
    language_name: 'Spanish',
  },
  {
    language_code: 'sw',
    language_name: 'Swahili',
  },
  {
    language_code: 'sv',
    language_name: 'Swedish',
  },
  {
    language_code: 'sy',
    language_name: 'Syriac',
  },
  {
    language_code: 'ta',
    language_name: 'Tamil',
  },
  {
    language_code: 'te',
    language_name: 'Telugu',
  },
  {
    language_code: 'tl',
    language_name: 'Tagalog',
  },
  {
    language_code: 'th',
    language_name: 'Thai',
  },
  {
    language_code: 'tr',
    language_name: 'Turkish',
  },
  {
    language_code: 'uk',
    language_name: 'Ukrainian',
  },
  {
    language_code: 'ur',
    language_name: 'Urdu',
  },
  {
    language_code: 'uz',
    language_name: 'Uzbek',
  },
  {
    language_code: 'vi',
    language_name: 'Vietnamese',
  },
  {
    language_code: 'ro',
    language_name: 'Romanian',
  },
  {
    language_code: 'pt-br',
    language_name: 'Portuguese (Brazilian)',
  },
  {
    language_code: 'me',
    language_name: 'Montenegrin',
  },
  {
    language_code: 'zh-tw',
    language_name: 'Chinese (traditional)',
  },
  {
    language_code: 'ze',
    language_name: 'Chinese bilingual',
  },
];

const ALPHABET = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
];

export default () => {
  const {address} = useContext(globalContext);
  const [imdbId, setImdbId] = useState(null);
  const [parentImdbId, setParentImdbId] = useState(null);
  const [subtitles, setSubtitles] = useState(null);
  const [language, setLanguage] = useState('en');

  const fetchSubtitles = async () => {
    try {
      const response = await fetch(
        `${address}/subtitles?imdbId=${imdbId}&${
          parentImdbId ? `parentImdbId=${parentImdbId}` : ''
        }&language=${language}&extension=vtt`,
      );
      const text = await response.text();
      const data = await vttToJson(text);
      const parsed = [];
      for (const {start, end, part} of data) {
        parsed.push({
          start: start / 1000,
          end: end / 1000,
          part: part.slice(
            0,
            part.length -
              part.split('\n')[part.split('\n').length - 1].length -
              3,
          ),
        });
      }
      setSubtitles(parsed);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    if(!language) {
      setSubtitles(null);
      return;
    }
    if (imdbId) {
      fetchSubtitles();
    }
  }, [language, imdbId, parentImdbId]);


  return {subtitles, langDict, setLanguage, setImdbId, setParentImdbId};
};
