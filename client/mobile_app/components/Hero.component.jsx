import { useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ImageBackground, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

// Contexts
import themeContext from '../contexts/theme.context';

const Hero = ({data}) => {
    const { sideMargin } = useContext(themeContext);
    const navigation = useNavigation();
};

const styles = StyleSheet.create({
    
});

export default Hero