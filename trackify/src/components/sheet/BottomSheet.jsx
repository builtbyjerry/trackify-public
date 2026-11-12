import { Dimensions, Keyboard, StyleSheet, View } from 'react-native'
import React, { useCallback, useImperativeHandle } from 'react'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  useAnimatedKeyboard,
  useAnimatedReaction,
  useDerivedValue,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { runOnJS } from 'react-native-worklets';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

const SPRING_CONFIG = {
  damping: 50,
  stiffness: 300,
  mass: 0.5,
}

const BottomSheet = React.forwardRef(
  ({ children,
     backgroundColor = "#f4f4f4",
     sticky = false, 
     showHandle = true, 
     snapPoints, 
     avoidKeyboard = false, 
     onClose = () => {},
     showOverlay = false,
     overlayOpacity: fixedOpacity,
    }, ref) => {

    const SCREEN_HEIGHT = Dimensions.get('screen').height
    const insets = useSafeAreaInsets()
    const keyboard = useAnimatedKeyboard()

    const MAX_TRANSLATE_Y = -(SCREEN_HEIGHT - insets.top)
    const OPEN_SNAP = snapPoints?.[0] ?? -(SCREEN_HEIGHT / 3.3)
    const translateY = useSharedValue(0)
    const active = useSharedValue(false)

    const useSafeBottomTabBarHeight = () => {
      try {
        return useBottomTabBarHeight()
      } catch {
        return 0;
      }
    }
    const tabBarHeight = useSafeBottomTabBarHeight()

    const scrollTo = useCallback((destination) => {
      'worklet'
      active.value = destination !== 0
      translateY.value = withSpring(destination, SPRING_CONFIG)
    }, [])

    const isActive = useCallback(() => active.value, [])

    useImperativeHandle(ref, () => ({ scrollTo, isActive, MAX_TRANSLATE_Y }), [
      scrollTo,
      isActive,
      MAX_TRANSLATE_Y,
    ])

    const context = useSharedValue({ y: 0 })

    const gesture = Gesture.Pan()
      .enabled(!sticky)
      .onStart(() => {
        context.value = { y: translateY.value }
      })
      .onUpdate((event) => {
        const next = event.translationY + context.value.y
        translateY.value = Math.max(next, MAX_TRANSLATE_Y)
      })
      .onEnd((event) => {
        const isFlick = event.velocityY > 500 // fast downward flick

        if (isFlick) {
            scrollTo(0)
        } else {
            scrollTo(OPEN_SNAP)
        }
      })

    const rStyle = useAnimatedStyle(() => {
      // When avoidKeyboard is true, lift the sheet by keyboard height
      const keyboardOffset = avoidKeyboard
        ? -Math.max(0, keyboard.height.value - tabBarHeight)
        : 0
      return {
        transform: [{
          translateY: translateY.value + keyboardOffset
        }],
      }
    })

    const handleClose = () => {
      Keyboard.dismiss()
      onClose()
    }

    useAnimatedReaction(
      () => active.value,
      (current, previous) => {
        if (previous === true && current === false) {
          runOnJS(handleClose)() // To trigger onClose whenver the user drags the bottomsheet down to 0
        }
      }
    )

    // Overlay properties: now, we can set an opacity to compensate for the fact that the darkness of the opacity is dependent on the height of the bottom sheet
    const overlayOpacity = useDerivedValue(() => {
      if (fixedOpacity !== undefined) {
        return interpolate(
          translateY.value,
          [0, MAX_TRANSLATE_Y],
          [0, fixedOpacity],
          Extrapolation.CLAMP
        )
      }
      return interpolate(
        translateY.value,
        [0, MAX_TRANSLATE_Y],
        [0, 0.5],
        Extrapolation.CLAMP
      )
    })

    const overlayStyle = useAnimatedStyle(() => ({
      opacity: overlayOpacity.value,
      pointerEvents: active.value ? 'auto' : 'none'
    }))

    return (
      <>
      {showOverlay && (
          <Animated.View
              style={[styles.overlay, overlayStyle]}
              onTouchEnd={() => scrollTo(0)}
          />
      )}
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            styles.container,
            rStyle,
            {
              height: SCREEN_HEIGHT,
              top: SCREEN_HEIGHT,
              backgroundColor,
              paddingBottom: insets.bottom,
            },
          ]}
        >
          {showHandle && <View style={styles.handle} />}
          {children}
        </Animated.View>
      </GestureDetector>
      </>
    )
  },
)

export default BottomSheet

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  container: {
    width: '100%',
    position: 'absolute',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    zIndex: 2,
  },
  handle: {
    width: 45,
    height: 3,
    backgroundColor: 'grey',
    alignSelf: 'center',
    marginVertical: 8,
    borderRadius: 2,
  },
})