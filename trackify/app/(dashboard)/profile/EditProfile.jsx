import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, AtSign, Camera, ChevronRight, Diamond, LockKeyhole, Mail, Phone, User } from 'lucide-react-native';
import { router, useGlobalSearchParams } from 'expo-router';
import { useUser } from '../../../src/hooks/useUser.jsx';
import { useEffect, useState } from 'react';

import PhotoOption from '../../../src/components/profile/PhotoOption.jsx'
import { useImagePicker } from '../../../src/hooks/useImagePicker.jsx'
import { saveProfileImage } from '../../../src/api/profile.js'
import { formatPhoneNumber } from '../../../src/utils/formatters.js'
import { useToast } from '../../../src/hooks/useToast.jsx';
import { log } from '../../../src/utils/loggers.js';


const EditProfile = () => {
    const { pinChanged } = useGlobalSearchParams()
    const { showToast } = useToast()

    const { employee, updateEmployee, user } = useUser()
    const { capturePhoto, pickImage } = useImagePicker() 

    const [imageSheetVisible, setImageSheetVisible] = useState(false)
    const openEditProfileImage = () => setImageSheetVisible(true)
    const closeEditProfileImage = () => setImageSheetVisible(false)

    useEffect(() => {
        if (pinChanged) {
            showToast({
            title: "Success",
            description: "PIN reset successfully",
            });
        } else {
            log("No changes to pinReset:", pinChanged)
        }
    }, [pinChanged]);

    const openCamera = async () => {
        closeEditProfileImage()
        log('[openCamera] starting...')
        log('[openCamera] employee id:', employee?.id)

        const uri = await capturePhoto()
        log('[openCamera] uri returned:', uri)
        if (!uri) return

        try {
            log('[openCamera] calling saveProfileImage...')
            const publicUrl = await saveProfileImage(uri, user?.id)
            log('[openCamera] publicUrl:', publicUrl)
            updateEmployee({ profile_url: publicUrl, imageVersion: Date.now() })
            log('[openCamera] employee updated')
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile photo')
            log('[openCamera] error:', error.message)
        }
    }

    const openGallery = async () => {
        closeEditProfileImage()
        log('[openGallery] starting...')
        log('[openGallery] employee id:', employee?.id)

        const uri = await pickImage()
        log('[openGallery] uri returned:', uri)
        if (!uri) return

        try {
            log('[openGallery] calling saveProfileImage...')
            const publicUrl = await saveProfileImage(uri, user?.id)
            log('[openGallery] publicUrl:', publicUrl)
            updateEmployee({ profile_url: publicUrl, imageVersion: Date.now() })
            log('[openGallery] employee updated')
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile photo')
            log('[openGallery] error:', error.message)
        }
    }

    const editDetails = (detail) => {
        router.push({
            pathname: "/profile/EditPersonalInfo",
            params: { type: detail }
        })
    }

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            {/*Header*/}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} hitSlop={12}>
                    <ArrowLeft size={20} />
                </Pressable>
                <Text style={styles.headerTitle}>Profile</Text>
            </View>

            <View style={styles.imageContainer}>
                <Image style={styles.image} source={{ uri: `${employee?.profile_url}?v=${employee?.imageVersion}`, cache: "reload"}}/>
                <Pressable
                  style={styles.iconContainer}
                  onPress={openEditProfileImage}
                >
                    <Camera size={20} style={styles.cameraIcon} />
                </Pressable>
            </View>
            <Pressable 
              onPress={openEditProfileImage}
              style={({ pressed }) => [styles.imageTextContainer, pressed && styles.imageTextPressed]}>
                <Text style={styles.imageText}>Edit</Text>
            </Pressable>

            <View style={styles.infoContainer}>
                <Text style={styles.label}>Personal Info</Text>
                <View style={styles.userInfo}>
                    <Pressable 
                      android_ripple={{ color: 'rgba(0,0,0,0.08)', foreground: true }}
                      onPress={() => editDetails("full_name")}

                      style={({ pressed }) => [
                        styles.infoSection, pressed && Platform.OS === 'ios' && {
                            opacity: 0.8,
                            transform: [{ scale: 0.98 }] 
                        }] 
                    }>
                        <View style={styles.flexSpacer}>
                            <User styele={styles.iconStyle} size={18} />
                            <View style={styles.infoDetails}>
                                <View style={styles.infoText}>
                                    <Text style={styles.infoTitle}>Full name</Text>
                                    <Text style={[styles.infoData, styles.boldText]}>{`${employee?.first_name} ${employee?.last_name}` ?? "No full name"}</Text>
                                </View>
                            </View>
                        </View>
                        <ChevronRight size={20} />
                    </Pressable>

                    <Pressable 
                      android_ripple={{ color: 'rgba(0,0,0,0.08)', foreground: true }}
                      onPress={() => editDetails("display_name")}

                      style={({ pressed }) => [
                        styles.infoSection, pressed && Platform.OS === 'ios' && {
                            opacity: 0.8,
                            transform: [{ scale: 0.98 }] 
                        }] 
                    }>
                        <View style={styles.flexSpacer}>
                            <AtSign styele={styles.iconStyle} size={18} />
                            <View style={styles.infoDetails}>
                                <View style={styles.infoText}>
                                    <Text style={styles.infoTitle}>Display Name</Text>
                                    <Text style={styles.infoData}>{`${employee?.display_name}` ?? "Not Set"}</Text>
                                </View>
                            </View>
                        </View>
                        <ChevronRight size={20} />
                    </Pressable>
                    <Pressable 
                      android_ripple={{ color: 'rgba(0,0,0,0.08)', foreground: true }}
                      onPress={() => editDetails("phone")}

                      style={({ pressed }) => [
                        styles.infoSection, pressed && Platform.OS === 'ios' && {
                            opacity: 0.8,
                            transform: [{ scale: 0.98 }] 
                        }] 
                    }>
                        <View style={styles.flexSpacer}>
                            <Phone styele={styles.iconStyle} size={18} />
                            <View style={styles.infoDetails}>
                                <View style={styles.infoText}>
                                    <Text style={styles.infoTitle}>Phone</Text>
                                    <Text style={styles.infoData}>{formatPhoneNumber(employee?.phone) ?? "No number"}</Text>
                                </View>
                            </View>
                        </View>
                        <ChevronRight size={20} />
                    </Pressable>

                    <Pressable 
                      android_ripple={{ color: 'rgba(0,0,0,0.08)', foreground: true }}
                      onPress={() => log('Pressedt')}

                      style={({ pressed }) => [
                        styles.infoSection, pressed && Platform.OS === 'ios' && {
                            opacity: 0.8,
                            transform: [{ scale: 0.98 }] 
                        }] 
                    }>
                        <View style={styles.flexSpacer}>
                            <Mail styele={styles.iconStyle} size={18}/>
                            <View style={styles.infoDetails}>
                                <View style={styles.infoText}>
                                    <Text style={styles.infoTitle}>Email</Text>
                                    <Text style={styles.infoData}>{`${user.email}` ?? "No Email???"}</Text>
                                </View>
                            </View>
                        </View>
                    </Pressable>
                    
                </View>
            </View>

            <View style={styles.infoContainer}>   
                <Text style={styles.label}>Security</Text>     
                <View style={styles.userInfo}>
                    <Pressable 
                    android_ripple={{ color: 'rgba(0,0,0,0.08)', foreground: true }}
                    onPress={() => router.push('/profile/ChangePin')}

                    style={({ pressed }) => [
                        styles.infoSection, pressed && Platform.OS === 'ios' && {
                            opacity: 0.8,
                            transform: [{ scale: 0.98 }] 
                        }] 
                    }>
                        <View style={styles.flexSpacer}>
                            <View style={[styles.securityIcon, { backgroundColor: '#e6f5ef' }]}>
                                <Diamond style={styles.iconStyle} color="#137A5B" size={14} />
                            </View>
                            <View style={styles.infoDetails}>
                                <View style={styles.infoText}>
                                    <Text style={styles.securityTitle}>Transaction PIN</Text>
                                    <Text style={styles.securityText}>Change or reset your 4-digit PIN</Text>
                                </View>
                            </View>
                        </View>
                        <ChevronRight size={20} />
                    </Pressable>

                    <Pressable 
                    android_ripple={{ color: 'rgba(0,0,0,0.08)', foreground: true }}
                    onPress={() => router.push("/profile/ChangePassword")}

                    style={({ pressed }) => [
                        styles.infoSection, pressed && Platform.OS === 'ios' && {
                            opacity: 0.8,
                            transform: [{ scale: 0.98 }] 
                        }] 
                    }>
                        <View style={styles.flexSpacer}>
                            <View style={[styles.securityIcon, {  backgroundColor: '#EEF1FF' }]}>
                                <LockKeyhole style={styles.iconStyle} color="#635BFF" size={14} />
                            </View>
                            <View style={styles.infoDetails}>
                                <View style={styles.infoText}>
                                    <Text style={styles.securityTitle}>Password</Text>
                                    <Text style={styles.securityText}>Change or reset your password</Text>
                                </View>
                            </View>
                        </View>
                        <ChevronRight size={20} />
                    </Pressable>
                </View>
            </View>

            <PhotoOption
                visible={imageSheetVisible}
                onClose={closeEditProfileImage}
                onCamera={openCamera}
                onGallery={openGallery}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f4',
    },
    header: {
        flexDirection: 'row',
        gap: 20,
        alignItems: 'center',
        paddingVertical: '16',
        paddingHorizontal: '12',
        borderBlockColor: '#e3e3e3',
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 20,
        color: '#000'
    },
    imageContainer: {
        width: 140, 
        height: 140, 
        alignSelf: 'center',
        marginVertical: 24,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 70,
    },
    iconContainer: {
        height: 32,
        width: 32,
        backgroundColor: '#0a7d4f',
        position: 'absolute',
        bottom: 4,
        right: 8,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#ffffff', 
    },
    cameraIcon: {
        color: '#ffffff',
    },
    imageTextContainer: {
        alignSelf: 'center',
    },
    imageTextPressed: {
        opacity: 0.7,
    },
    imageText: {
        color: '#0a7d4f',
        fontWeight: '700',
        fontSize: 18
    },
    infoContainer: {
        paddingHorizontal: 16,
        marginVertical: 16,
    },
    label: {
        fontSize: 11,
        fontWeight: '500',
        color: '#999999',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginBottom: 6,
        paddingLeft: 2,
    },
    userInfo: {
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: '#e0e0e0',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
    },
    infoSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 11,
        borderBottomWidth: 0.5,
        borderBottomColor: '#e0e0e0',
        justifyContent: 'space-between',
    },
    flexSpacer: {
        flexDirection: 'row',
        gap: 16,
        alignItems: 'center',
    },
    iconStyle: {
        color: '#555'
    },

    infoText: {
        flexDirection: 'column',
        gap: 1,
    },
    infoTitle: {
        fontSize: 11,
        color: '#999999',
    },
    infoData: {
        fontSize: 14,
        color: '#1a1a1a',
    },
    boldText: {
        fontWeight: 'bold'
    },
    securityTitle: {
        fontSize: 16,
        color: '#1a1a1a',
        fontWeight: 'bold',
    },
    securityText: {
        fontSize: 12,
        color: '#999999',
    },
    securityIcon: {
        padding: 6,
        borderRadius: 6,
    }

})

export default EditProfile