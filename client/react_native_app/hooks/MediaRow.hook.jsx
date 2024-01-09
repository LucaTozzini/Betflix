import {useEffect, useState} from 'react';
import {useWindowDimensions} from 'react-native';

const useItemWidth  = ({gap, margin, items}) => {
  const {width} = useWindowDimensions();
  const [size, setSize] = useState();
  useEffect(() => {
    const available = width - (items - 1) * gap - margin * 2;
    setSize(available / items);
  }, [width, gap, margin, items]);

  return size;
};

export {useItemWidth };
