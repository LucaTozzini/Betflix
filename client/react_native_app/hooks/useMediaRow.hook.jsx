import {useEffect, useState} from 'react';
import {useWindowDimensions} from 'react-native';

export default ({gap, margin, numItems}) => {
  const {width} = useWindowDimensions();
  const [itemWidth, setItemWidth] = useState(null);

  const calcWidth = () => {
    const available = width - (numItems - 1) * gap - margin * 2;
    setItemWidth(available / numItems);
  };

  useEffect(() => {
    calcWidth();
  }, [width, gap, numItems]);

  return {itemWidth};
};
