import { useState, useEffect } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'
import { Alert, Linking } from 'react-native'
import { log } from '../utils/loggers.js';

export const useImagePicker = () => {
    const [imageUri, setImageUri] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    // ── Manipulate ────────────────────────────────────────────────
    const manipulate = async (uri) => {
        try {
            log('[manipulate] called with:', uri)
            const context = ImageManipulator.manipulate(uri)
            context.resize({ width: 500 })
            const renderedImage = await context.renderAsync()
            const result = await renderedImage.saveAsync({
                compress: 0.75,
                format: SaveFormat.JPEG,
                base64: false,
            })
            return result.uri
        } catch (err) {
            log('[manipulate] error:', err.message)
            return uri  // fallback to original if manipulation fails
        }
    }

    // ── Handle result (shared by camera and gallery) ──────────────
    const handleImageResult = async (result) => {
        try {
            if (!result || result.canceled) {
                log('[handleImageResult] no result or cancelled')
                return null
            }

            const rawUri = result.assets[0].uri
            log('[handleImageResult] raw uri:', rawUri)

            setLoading(true)
            const uri = await manipulate(rawUri)
            log('[handleImageResult] manipulated uri:', uri)

            setImageUri(uri)
            setLoading(false)
            return uri
        } catch (err) {
            setLoading(false)
            setError(err.message)
            log('[handleImageResult] error:', err.message)
            return null
        }
    }

    // ── Recover pending result (Android activity killed mid-capture)
    useEffect(() => {
        async function recover() {
            try {
                const pending = await ImagePicker.getPendingResultAsync()
                if (pending && !pending.canceled) {
                    log('[recover] recovered pending camera result')
                    await handleImageResult(pending)
                }
            } catch (err) {
                log('[recover] error:', err.message)
            }
        }
        recover()
    }, [])

    // ── Pick from gallery ─────────────────────────────────────────
    const pickImage = async () => {
        try {
            log('[pickImage] requesting permission')
            const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync()
            log('[pickImage] permission granted:', granted)

            if (!granted) {
                Alert.alert(
                    'Permission required',
                    'Permission to access the media library is required.'
                )
                return null
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            })
            log('[pickImage] result:', JSON.stringify(result))

            return handleImageResult(result)
        } catch (err) {
            setError(err.message)
            log('[pickImage] error:', err.message)
            Alert.alert('Error', err.message)
            return null
        }
    }

    // ── Capture from camera ───────────────────────────────────────
    const capturePhoto = async () => {
        try {
            log('[capturePhoto] checking permission')
            const { status, canAskAgain } = await ImagePicker.getCameraPermissionsAsync()
            log('[capturePhoto] status:', status, 'canAskAgain:', canAskAgain)

            if (status === 'granted') {
                log('[capturePhoto] permission already granted, launching camera')
                const result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ['images'],
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 1,
                })
                log('[capturePhoto] result:', JSON.stringify(result))
                return handleImageResult(result)
            }

            if (status === 'undetermined') {
                log('[capturePhoto] requesting permission')
                const { granted } = await ImagePicker.requestCameraPermissionsAsync()
                log('[capturePhoto] permission granted:', granted)

                if (!granted) return null

                const result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ['images'],
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 1,
                })
                log('[capturePhoto] result:', JSON.stringify(result))
                return handleImageResult(result)
            }

            // status === 'denied'
            if (canAskAgain) {
                Alert.alert(
                    'Permission required',
                    'Camera access is needed to take a photo.'
                )
            } else {
                Alert.alert(
                    'Camera access blocked',
                    'Please enable camera access in your device settings.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Open Settings', onPress: () => Linking.openSettings() }
                    ]
                )
            }
            return null

        } catch (err) {
            setError(err.message)
            log('[capturePhoto] error:', err.message)
            Alert.alert('Error', err.message)
            return null
        }
    }

    // ── Clear ─────────────────────────────────────────────────────
    const clearImage = () => {
        setImageUri(null)
        setError(null)
    }

    return {
        imageUri,
        error,
        loading,
        pickImage,
        capturePhoto,
        clearImage,
    }
}