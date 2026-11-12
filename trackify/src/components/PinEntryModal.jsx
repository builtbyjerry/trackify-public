import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Dimensions, 
  TouchableOpacity, 
  Keyboard,
  Platform,
  Alert 
} from 'react-native';
import Modal from 'react-native-modal'; 
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSequence, 
  withTiming, 
  withRepeat,
  interpolateColor,
  useAnimatedKeyboard // <--- THE HOLY GRAIL
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const PIN_LENGTH = 4;
const MAX_ATTEMPTS = 3;

// --- Visual Components ---
const LoadingDots = () => {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
  }, []);

  return (
    <View style={styles.loadingContainer}>
      {[0, 1, 2].map((i) => {
        const animatedStyle = useAnimatedStyle(() => ({
          opacity: (progress.value * 3) > i ? 1 : 0.3,
          transform: [{ scale: (progress.value * 3) > i ? 1.2 : 1 }],
        }));
        return <Animated.View key={i} style={[styles.loadingDot, animatedStyle]} />;
      })}
    </View>
  );
};

const PinEntryModal = forwardRef(({ onSuccess, onCancel }, ref) => {
  // Logic State
  const [visible, setVisible] = useState(false);
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle'); 
  const [attempts, setAttempts] = useState(0);
  
  const inputRef = useRef(null);

  // Animation Values
  const translateX = useSharedValue(0); 
  const colorState = useSharedValue(0); // 0=Idle, 1=Success, -1=Error
  
  // --- THE FIX: Reanimated Keyboard Hook ---
  const keyboard = useAnimatedKeyboard();

  // --- API ---
  useImperativeHandle(ref, () => ({
    open: () => {
      setVisible(true);
      resetState();
      // Delay focus slightly to let modal animation finish
      setTimeout(() => inputRef.current?.focus(), 100);
    },
    close: () => {
      handleClose();
    }
  }));

  const resetState = () => {
    setCode('');
    setStatus('idle');
    setAttempts(0);
    colorState.value = withTiming(0);
  };

  const handleClose = () => {
    Keyboard.dismiss();
    setVisible(false);
    if (onCancel) onCancel();
  };

  // --- Animations ---
  const triggerShake = useCallback(() => {
    translateX.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  }, []);

  // 1. Animated Container Style (Keyboard Padding)
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      // This is the magic. We add padding to the bottom equal to keyboard height
      paddingBottom: keyboard.height.value + 40, // +40 for base padding
    };
  });

  // 2. Color Interpolation (Fixes Red Flash)
  const animatedColorStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      colorState.value,
      [-1, 0, 1], // Error, Idle, Success
      ['#FF6B6B', '#E8F6F4', '#42B39E'] 
    );
    return { borderColor };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      colorState.value,
      [-1, 0, 1],
      ['#FF6B6B', '#1D847E', '#42B39E']
    );
    return { color };
  });

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }]
  }));

  // --- Logic ---
  const handleVerify = async (pin) => {
    setStatus('verifying');
    Keyboard.dismiss();

    const isValid = await new Promise(r => setTimeout(() => r(pin === '1234'), 800));

    if (isValid) {
      setStatus('success');
      colorState.value = withTiming(1); 
      
      setTimeout(() => {
        setVisible(false);
        if (onSuccess) onSuccess();
      }, 800);

    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        setStatus('error');
        colorState.value = withTiming(-1);
        triggerShake();
        
        setTimeout(() => {
          setVisible(false);
          Alert.alert("Account Locked", "Too many incorrect attempts.");
          if (onCancel) onCancel();
        }, 500);
      } else {
        setStatus('error');
        colorState.value = withTiming(-1);
        triggerShake();

        setTimeout(() => {
          setCode('');
          setStatus('idle');
          colorState.value = withTiming(0);
          inputRef.current?.focus(); 
        }, 1000);
      }
    }
  };

  useEffect(() => {
    if (code.length === PIN_LENGTH && status === 'idle') {
      handleVerify(code);
    }
  }, [code]);

  return (
    <Modal
      isVisible={visible}
      // SWIPE CONFIG
      swipeDirection={['down']} 
      onSwipeComplete={handleClose}
      propagateSwipe={true}
      // DISABLE CONFLICTING PROPS
      avoidKeyboard={false} 
      coverScreen={true}
      style={styles.modal}
      backdropOpacity={0.5}
    >
      {/* We animate the Container View itself. 
         When keyboard opens, paddingBottom increases, pushing content up.
         Because 'justifyContent: flex-end' is set on the modal, this grows UPWARDS.
      */}
      <Animated.View style={[styles.container, animatedContainerStyle]}>
        
        {/* Drag Handle */}
        <View style={styles.handleContainer}>
           <View style={styles.handle} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Confirm Purchases</Text>
          <Text style={styles.subtitle}>Secure PIN Verification</Text>
        </View>

        {/* Status Message */}
        <Animated.Text style={[styles.statusMessage, animatedTextStyle, shakeStyle]}>
          {status === 'verifying' ? 'Verifying...' : 
           status === 'error' ? `Invalid PIN (${MAX_ATTEMPTS - attempts} attempts left)` :
           status === 'success' ? 'Success!' : 'Enter your 4-digit PIN'}
        </Animated.Text>

        {/* PIN POD */}
        <Animated.View style={[styles.pinContainer, animatedColorStyle, shakeStyle]}>
          {[...Array(PIN_LENGTH)].map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.pinBox,
                { 
                  backgroundColor: code[index] ? '#F0F9F7' : 'transparent',
                  borderColor: (status === 'idle' && code.length === index) ? '#1D847E' : 'transparent',
                  borderWidth: (status === 'idle' && code.length === index) ? 2 : 0
                }
              ]}
            >
              <Text style={styles.pinText}>
                {code[index] ? '•' : ''}
              </Text>
            </View>
          ))}
          
          {/* FIX 4: Layout Participation */}
          {/* We wrap the input in a view that has 0 height but is present in the flex tree */}
          <View style={styles.hiddenInputContainer}>
            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={setCode}
              maxLength={PIN_LENGTH}
              keyboardType="number-pad"
              style={styles.hiddenInput}
              editable={status === 'idle' || status === 'error'}
              caretHidden={true}
            />
          </View>
        </Animated.View>

        {status === 'verifying' && <LoadingDots />}

        {status !== 'verifying' && (
          <TouchableOpacity style={styles.forgotPinButton}>
            <Text style={styles.forgotPinText}>Forgot PIN?</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end', // We KEEP this, but we animate padding inside
    margin: 0,
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: 'center',
    overflow: 'hidden', // Ensures content doesn't bleed during animation
  },
  handleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1D847E',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  statusMessage: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    height: 20,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 24, // Moved padding here for better layout
    marginBottom: 24,
    position: 'relative', 
    maxWidth: 400, // Safety cap for tablets
  },
  pinBox: {
    width: (width - 96) / 4,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1D847E',
    marginTop: -4,
  },
  // FIX 4: Container for hidden input
  hiddenInputContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    left: 24, // Match paddingHorizontal
  },
  hiddenInput: {
    width: '100%',
    height: '100%',
    opacity: 0,
  },
  loadingContainer: {
    flexDirection: 'row',
    gap: 8,
    height: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1D847E',
  },
  forgotPinButton: {
    padding: 8,
  },
  forgotPinText: {
    color: '#1D847E',
    fontWeight: '600',
    fontSize: 14,
  }
});

export default PinEntryModal;