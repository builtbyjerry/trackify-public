import { StyleSheet, Text, View, Image, Dimensions, Pressable } from 'react-native'
import { useState } from 'react'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { ChartColumn, LogOut, PackageOpen, SquarePen } from 'lucide-react-native'
import { router } from 'expo-router'

import Spacer from '../../../src/components/Spacer'
import CustomAlert from '../../../src/components/CustomAlert'
import { useUser } from '../../../src/hooks/useUser'
import { useToast } from '../../../src/hooks/useToast.jsx';

const { height } = Dimensions.get('window')


const ProfilePage = () => {
    const [ showAlert, setShowAlert ] = useState(false)
    const { employee, logout } = useUser() 
    const { showToast } = useToast()

    const goToEditProfile = () => {
        router.push("/(dashboard)/profile/EditProfile")
    }
    const goToEditProducts = () => {
        router.push("/(dashboard)/products/EditProducts")
    }
    const showComingSoon = () => {
        showToast({
            title: "Feature coming soon",
            description: "V1.1 will allow users to see their stats"
        })
    }

  return (
    <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1,  alignItems: 'center', backgroundColor: '#f0f5f4ff'}}>
                <View style={{ backgroundColor: '#42B39E', width: '100%', height: '30%', justifyContent: 'flex-end', alignItems: 'center', position: 'relative' }}>
               
                </View>
                <View style={{ width: 170, height: 170, borderRadius: 85, borderWidth: 3, borderColor: '#f0f5f4ff', elevation: 10, position: 'absolute', top: '22%', alignSelf: 'center', overflow: 'hidden' }}>
                        <Image style={{ width: '100%', height: '100%', borderRadius: 85 }} source={{ uri: `${employee?.profile_url}?v=${employee?.imageVersion}`, cache: "reload"}}/>
                </View>
                
                <View style={{ paddingTop: height * 0.12, flex: 1, width: '120%', alignItems: 'center' }}>
                    <Text style={{ fontSize: 24, fontWeight: '700' }}>{`${employee?.first_name} ${employee?.last_name}`}</Text>
                    <Spacer height={15}/>
                    
                    <View style={{ width: '85%', backgroundColor: 'rgba(0,0,0,0.3)', alignSelf: 'center', marginTop: 12, height: 1.5 }} />
                    <View style={{ width: '90%', height:'100%', alignItems: 'center', backgroundColor: '#fff'}}>
                        <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]}  onPress={goToEditProfile}>
                            <SquarePen color='#42B39E' size={20} /> 
                            <Text style={styles.text}>Edit Profile</Text>
                        </Pressable>
                        <View style={{ width: '85%', backgroundColor: 'rgba(0,0,0,0.1)',  height: 1 }} />

                        <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]} onPress={showComingSoon}>
                            <ChartColumn color='#42B39E' size={20} />
                            <Text style={styles.text}>Check stats</Text>
                        </Pressable>
                        <View style={{ width: '85%', backgroundColor: 'rgba(0,0,0,0.1)',  height: 1 }} />
                        
                        <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]}  onPress={goToEditProducts}>
                            <PackageOpen color='#42B39E' size={20} />
                            <Text style={styles.text}>Edit Products</Text>
                        </Pressable>
                        <View style={{ width: '85%', backgroundColor: 'rgba(0,0,0,0.1)',  height: 1 }} />

                        <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]} onPress={() => setShowAlert(true) }>
                            <LogOut color='#ff4f4f' size={20} />
                            <Text style={styles.text}>Logout</Text>
                        </Pressable>
                        <View style={{ width: '85%', backgroundColor: 'rgba(0,0,0,0.1)', alignSelf: 'center',  height: 1 }} />
                        <CustomAlert 
                            visible={showAlert}
                            title='Logout'
                            subtitle='Are you sure you want to logout'
                            actionText='Logout'
                            onCancel={() => setShowAlert(false)}
                            onConfirm={async () => {
                                await logout()
                                setShowAlert(false)
                            }}
                        />
                    </View>
                </View>
            </SafeAreaView>
    </SafeAreaProvider>
  )
}

export default ProfilePage

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 24,
        width: '100%'
    },
    pressed: {
        backgroundColor: 'rgba(66,179,158,0.05)',
    },
    text: {
        fontSize: 16,
        color: '#222',
        fontStyle: 'italic',
        fontWeight: '700',
        marginLeft: 12,
    },


})
