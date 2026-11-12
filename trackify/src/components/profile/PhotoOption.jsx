import { Text, View, StyleSheet, Pressable, Platform, Dimensions } from 'react-native'
import BottomSheet from '../sheet/BottomSheet.jsx'
import { Camera, Images, Trash2, X } from 'lucide-react-native'
import { useEffect, useRef } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PhotoOption = ({ visible, onClose, onCamera, onGallery }) => {
    const ref = useRef(null)
    const SCREEN_HEIGHT = Dimensions.get('screen').height
    const SNAP_POINT = -(SCREEN_HEIGHT * 0.2)
    const { bottom } = useSafeAreaInsets()

    useEffect(() => {
        if (visible) {
            ref.current?.scrollTo(SNAP_POINT - bottom)
        } else {
            ref.current?.scrollTo(0)
        }
    }, [visible, SCREEN_HEIGHT])

    const openCamera = () => {
        ref.current.scrollTo(0)
        onCamera()
    }

    const openGallery = () => {
        ref.current.scrollTo(0)
        onGallery()
    }
    return (
        <BottomSheet
          ref={ref}
          backgroundColor="#f4f4f4"
          snapPoint={[SNAP_POINT]}
          showHandle
          showOverlay
          overlayOpacity={2}
          onClose={onClose}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <X onPress={onClose}/>
                    <Text style={styles.title}>Profile Picture</Text>
                    <Trash2 />
                </View>

                <Pressable
                  android_ripple={{ color: 'rgba(0,0,0,0.08)', foreground: true }} 
                  onPress={openCamera} 
                  style={({ pressed }) => [
                    styles.row, pressed && Platform.OS === 'ios' && {
                        opacity: 0.8,
                        transform: [{ scale: 0.98 }] 
                    }] 
                }>
                    <Camera />
                    <Text>Camera</Text>
                </Pressable>
                <Pressable
                  android_ripple={{ color: 'rgba(0,0,0,0.08)', foreground: true }} 
                  onPress={openGallery} 
                  style={({ pressed }) => [
                    styles.row, pressed && Platform.OS === 'ios' && {
                        opacity: 0.8,
                        transform: [{ scale: 0.98 }] 
                    }] 
                }>
                    <Images />
                    <Text>Gallery</Text>
                </Pressable>

            </View>
        </BottomSheet>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 20,
        paddingTop: 4,
    },
    title: {
        fontSize: 16
    },
    row: {
        flexDirection: 'row',
        gap: 16,
        paddingVertical: 12,
        paddingHorizontal: 8,
        alignItems: 'center',
    }
})

export default PhotoOption