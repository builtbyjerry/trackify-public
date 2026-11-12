import { Pressable, StyleSheet, Text, View, Image, Alert, ActivityIndicator, Dimensions } from 'react-native'
import { useCallback, useRef, useState } from 'react'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Plus } from 'lucide-react-native'
import BottomSheet from '../../src/components/sheet/BottomSheet'
import { useImagePicker } from '../../src/hooks/useImagePicker.jsx'
import { useUser } from '../../src/hooks/useUser'

import { setImageSkipped } from '../../src/services/onboardingService.js'
import { saveProfileImage } from '../../src/api/profile.js';
import { errorLog, log } from '../../src/utils/loggers.js';
import { router } from 'expo-router';

const ProfileSetup = () => {
  const SCREEN_HEIGHT = Dimensions.get('screen').height
  const { bottom } = useSafeAreaInsets()
  const SNAP_POINT = -(SCREEN_HEIGHT * 0.3)

  const ref = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [skipping, setSkipping] = useState(false)
  const [error, setError] = useState(false)
      
  const { imageUri, pickImage, loading: imageLoading, capturePhoto } = useImagePicker()
  const { user, updateOnboardingStatus } = useUser()
    
  const onPress = useCallback(() => {
    const isActive = ref?.current?.isActive()
    if (isActive) {
      ref?.current?.scrollTo(0)
      setIsOpen(false)
      return
    }
    ref?.current?.scrollTo(SNAP_POINT - bottom)
    setIsOpen(true)
  }, [])

  const closeBottomSheet = useCallback(() => {
    ref?.current?.scrollTo(0)
    setIsOpen(false)
  }, [])
  
  const openCamera = async () => {
    const uri = await capturePhoto()
    if (uri) {
      closeBottomSheet()
    }
  }

  const openGallery = async () => {
    const uri = await pickImage()
    if (uri) {
      closeBottomSheet()
    }
  }
  const handleSetProfile = async () => {
    if (!imageUri) {
        Alert.alert('No Image', 'Please select a profile photo first')
        return
    }

    setSaving(true)
    setError(null)
    try {
        await saveProfileImage(imageUri, user?.id)
        await updateOnboardingStatus()
        router.replace("onboarding/PinSetup")
    } catch (error) {
        Alert.alert('Error', 'Failed to save profile')
        errorLog(error)
        setError(error.message)
    } finally {
        setSaving(false)
    }
  }

  const handleSkip = async () => {
     setSkipping(true)
     setError(null)
     try {
      await setImageSkipped(user?.id)
      await updateOnboardingStatus()
      router.replace("onboarding/PinSetup")
     } catch (error) {
      log("Error in skipping setting this image:", error)
      setError(error.message)
     } finally {
      setSkipping(false)
     }
  }
  return (
    <SafeAreaView style={{ flex: 1 }}> 
      <View style={[styles.container, isOpen && styles.overlay]}>
        <View style={styles.header}>
          <Text style={styles.title}>Set up your profile</Text>
          <Text style={styles.subtitle}>
            Add a photo so people can recognize you
          </Text>
        </View>
        {error && (
          <>
            <Text style={styles.error}>{error}</Text>
          </>
        )}
        <View style={styles.uploadImageContainer}>
            <Pressable
            style={({ pressed }) => [
              styles.uploadImage,
              pressed && { backgroundColor: '#ccc' }
            ]}
            onPress={() => {
              onPress()
              log("Pressed")
            }}
            disabled={imageLoading || imageUri && saving || skipping}
          >
            {imageLoading ? (
              <ActivityIndicator size="large" color="#2ECC71" />
            ) : imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <Plus size={112} color="#555" />
            )}
          </Pressable>
          {imageUri && !imageLoading && (
            <Text style={styles.tapToChange}>Tap to change photo</Text>
          )}
        </View>
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && { transform: [{ scale: 0.97 }] },
              (saving || !imageUri) && styles.buttonDisabled
            ]}
            onPress={handleSetProfile}
            disabled={saving || !imageUri}
          >
            <Text style={styles.buttonText}>
              {saving ? "SAVING..." : "CONTINUE"}
            </Text>
          </Pressable>
          <Pressable
            onPress={handleSkip}
            disabled={skipping}
          >
            <Text style={styles.skipText}>{skipping ? "SKIPPING...." : "SKIP"}</Text>
          </Pressable>
        </View>
      </View>
      <BottomSheet ref={ref} backgroundColor="#f5f5f5" sticky snapPoint={[SNAP_POINT]} showHandle={false} onClose={closeBottomSheet}> 
        <View style={styles.modalView}>
          <Pressable
            onPress={openGallery}>
            <Text style={styles.modalText}>Upload from gallery</Text>
          </Pressable>
          <Pressable
            onPress={openCamera}>
            <Text style={styles.modalText}>Take a photo</Text>
          </Pressable>
        </View>
      </BottomSheet>
    </SafeAreaView>
    
  )
}

export default ProfileSetup

const styles = StyleSheet.create({
  container: { 
    flex: 1,  
    paddingHorizontal: 24, 
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  overlay: { 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    opacity: 0.6 
  },
  header: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 12,
    color: '#111',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
  },
  error: {
     color: '#cc475a',
     textAlign: 'center',
     backgroundColor: '#fef0f0',
     padding: 10,
     borderRadius: 6,
     borderWidth: 1,
     borderColor: '#cc475a',
     width: '90%',
     alignSelf: 'center',
   },
  uploadImageContainer: {
    alignItems: 'center',
    marginBottom: 88,
    marginTop: 96,
  },
  uploadImage: {
    borderWidth: 3,
    borderColor: '#2ECC71',
    borderRadius: 110,
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    
    padding: 12,
    backgroundColor: '#F0f0f0'
  },
  profileImage: {
    width: 214,
    height: 214,
    borderRadius: 107,
  },
  tapToChange: {
    marginTop: 12,
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  footer: {
    alignItems: 'center',
  },
  button: {
    width: '90%',
    height: 52,
    backgroundColor: '#2ECC71',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4, 
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.8,
    fontStyle: 'italic'
  },
  buttonDisabled: {
    backgroundColor: '#A5D6A7',
    shadowOpacity: 0, 
  },

  skipText: {
    marginTop: 16,
    color: '#888',
    fontStyle: 'italic',
  },
  modalView: {
    alignItems: 'center',
    flex: 1,
    padding: 24,
  },
  modalText: {
    marginVertical: 16,
    fontSize: 18,
    color: '#333',
    fontStyle: 'italic',
    fontWeight: '800',
    backgroundColor: '#f5f5f5',
  }
})