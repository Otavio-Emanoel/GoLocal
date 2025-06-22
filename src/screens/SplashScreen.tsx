import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet, Easing, Dimensions, Image } from 'react-native';
import { StackActions, useNavigation } from '@react-navigation/native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

const PIN_SIZE = 80;
const BAR_WIDTH = Dimensions.get('window').width * 0.7;
const BAR_HEIGHT = 10;

function Pin({ smiling, bounce }: { smiling: boolean; bounce: Animated.Value }) {
  return (
    <Animated.View style={{ transform: [{ translateY: bounce }] }}>
      <Svg width={PIN_SIZE} height={PIN_SIZE} viewBox="0 0 100 100">
        {/* Corpo do pin */}
        <Path
          d="M50 10
             C75 10, 90 35, 50 90
             C10 35, 25 10, 50 10
             Z"
          fill="#6ee7e7"
          stroke="#22343c"
          strokeWidth="5"
        />
        {/* Olhos */}
        <Circle cx="38" cy="38" r="5" fill="#22343c" />
        <Circle cx="62" cy="38" r="5" fill="#22343c" />
        {/* Sorriso animado */}
        {smiling ? (
          <Path
            d="M40 55 Q50 65 60 55"
            stroke="#22343c"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        ) : (
          <Path
            d="M43 55 Q50 58 57 55"
            stroke="#22343c"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        )}
      </Svg>
    </Animated.View>
  );
}

export default function SplashScreenCustom() {
  const navigation = useNavigation();
  const [smiling, setSmiling] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade-in inicial
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Anima barra e pin juntos
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2600,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start(() => {
      setSmiling(true);
      // Pin faz um "pulo"
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -18,
          duration: 180,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
      ]).start();
      setTimeout(() => {
        navigation.dispatch(StackActions.replace('Home'));
      }, 1100);
    });
  }, []);

  // O pin e a barra andam juntos
  const pinTranslate = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, BAR_WIDTH - PIN_SIZE],
  });

  const barFillWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [PIN_SIZE / 2, BAR_WIDTH - PIN_SIZE / 2],
  });

  return (
    <Animated.View style={[styles.splashContainer, { opacity: fadeAnim }]}>
      <View style={styles.logoTextContainer}>
        <Image
          source={require('../assets/icon.png')}
          style={styles.logoImage}
        />
      </View>
      <View style={{ height: 40 }} />
      <View style={styles.barContainer}>
        <View style={styles.barBg}>
          <Svg width={BAR_WIDTH} height={BAR_HEIGHT}>
            <Defs>
              <LinearGradient id="grad" x1="0" y1="0" x2={BAR_WIDTH} y2="0" gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor="#6ee7e7" />
                <Stop offset="1" stopColor="#2a4d69" />
              </LinearGradient>
            </Defs>
            <Rect
              x="0"
              y="0"
              width={BAR_WIDTH}
              height={BAR_HEIGHT}
              rx={BAR_HEIGHT / 2}
              fill="#e0e7ef"
            />
          </Svg>
        </View>
        <Animated.View style={[styles.barFill, { width: barFillWidth }]}>
          <Svg width={BAR_WIDTH} height={BAR_HEIGHT} style={{ position: 'absolute', left: 0 }}>
            <Defs>
              <LinearGradient id="gradFill" x1="0" y1="0" x2={BAR_WIDTH} y2="0" gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor="#6ee7e7" />
                <Stop offset="1" stopColor="#2a4d69" />
              </LinearGradient>
            </Defs>
            <Rect
              x="0"
              y="0"
              width={BAR_WIDTH}
              height={BAR_HEIGHT}
              rx={BAR_HEIGHT / 2}
              fill="url(#gradFill)"
            />
          </Svg>
        </Animated.View>
        <Animated.View
          style={[
            styles.pinContainer,
            { transform: [{ translateX: pinTranslate }] },
          ]}
        >
          <Pin smiling={smiling} bounce={bounceAnim} />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 210,
    height: 210,
    resizeMode: 'contain',
    marginBottom: 10,
    borderRadius: 55,
    borderWidth: 0.1,
    borderColor: '#2a4d69',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
},
  logoText: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#22343c',
    marginTop: 10,
    letterSpacing: 1,
  },
  barContainer: {
    width: BAR_WIDTH,
    height: PIN_SIZE,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  barBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: PIN_SIZE / 2 - BAR_HEIGHT / 2,
    height: BAR_HEIGHT,
    width: BAR_WIDTH,
    borderRadius: BAR_HEIGHT / 2,
    backgroundColor: 'transparent',
    zIndex: 1,
    overflow: 'hidden',
  },
  barFill: {
    position: 'absolute',
    left: 0,
    top: PIN_SIZE / 2 - BAR_HEIGHT / 2,
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    backgroundColor: 'transparent',
    zIndex: 2,
    overflow: 'hidden',
  },
  pinContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: PIN_SIZE,
    height: PIN_SIZE,
    zIndex: 3,
  },
});