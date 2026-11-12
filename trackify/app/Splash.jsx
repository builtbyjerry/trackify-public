import { useEffect, useState, useRef } from 'react'
import { View, Text, Animated } from 'react-native'
import { useFonts } from '@expo-google-fonts/poppins/useFonts'
import { Poppins_700Bold } from '@expo-google-fonts/poppins/700Bold'
import { Poppins_700Bold_Italic } from '@expo-google-fonts/poppins/700Bold_Italic'


export default function SplashScreen() {
  let [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Poppins_700Bold_Italic
  })
  const [displayText, setDisplayText] = useState('');
  const fullText = 'Trackify';
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }).start();
    let index = 0;
    const interval = setInterval(() => {
      setDisplayText(fullText.slice(0, index + 1));
      index++;
      if (index === fullText.length) {
        clearInterval(interval);
        setTimeout(() => { console.log('Animation finished'); }, 2500);
      }
    }, 150);
    return () => clearInterval(interval);
  }, []);

  if (!fontsLoaded) {
    return null;
  }
  return (
    <Animated.View style={{ flex:1, justifyContent:'center', alignItems:'center', opacity: fadeAnim, backgroundColor: '#4CAF50' }}>
      <Text style={{ fontSize:42, fontFamily: 'Poppins_700Bold', color: '#F2F2F2' }}>{displayText}</Text>
    </Animated.View>
  );
}


