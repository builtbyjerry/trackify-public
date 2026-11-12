import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, User, AtSign, Phone, Info } from 'lucide-react-native';
import { useState } from 'react';
import { useUser } from '../../../src/hooks/useUser.jsx';
import { updateUserProfile } from '../../../src/api/profile.js';
import { errorLog, log } from '../../../src/utils/loggers.js';

const pages = {
    "display_name": {
        "header": "Display Name",
        "icon": AtSign,
        "label": "Shown to customers instead of your full name",
        "placeholder": "Enter display name",
        "helper": "Leave empty to use your full name everywhere.",
        "buttonText": "Save",
    },
    "phone": {
        "header": "Phone",
        "icon": Phone,
        "label": "Enter your new phone number",
        "placeholder": "801 234 5678",
        "keyboardType": "phone-pad",
        "buttonText": "Save", // "Send verification Code": We'll verify phone later when it becomes a source of truth and its use concrete
    },
    "full_name": {
        "header": "Name",
        "icon": User,
        "label": "This is your legal name as it appears on official documents",
        "buttonText": "Save",
    },
}

const EditDetail = () => {
    const { employee, updateEmployee, user } = useUser()
    const { type } = useLocalSearchParams()

    const page = pages[type]
    const Icon = page.icon

    const [detail, setDetail] = useState(
        type === "phone"
            ? employee?.phone
            : type === "display_name"
            ? employee?.display_name
            : employee?.first_name
    )

    const [lastName, setLastName] = useState(
        type === "full_name"
            ? employee?.last_name
            : ""
    )
    const [focused, setFocused] = useState(null) // tracks which input is focused

    const isPhone = type === "phone"
    const isDisplayName = type === "display_name"

    // Save button disabled only for display_name when empty
    const isDisabled = isDisplayName && detail.trim() === ""

    const getUpdatePayload = () => {
        if (type === "phone") {
            if (!detail?.trim()) return {}
            return { phone: detail }
        }

        if (type === "display_name") {
            // allow clearing it
            return { display_name: detail }
        }

        if (type === "full_name") {
            if (!detail?.trim() || !lastName?.trim()) {
                return {}
            }

            return {
                first_name: detail,
                last_name: lastName
            }
        }
        return {}
    }

    const updateDetails = async () => {
        const updates = getUpdatePayload()

        const hasUpdates = Object.keys(updates).length > 0
        if (!hasUpdates) {
            log("No changes to update")
            router.back()
        }
        
        try {
            await updateUserProfile(user?.id, updates)
            updateEmployee(updates)
            router.back()
        } catch (error) {
            errorLog("Error updating user profile:", error)
            return
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={16} color="#1a1a1a" />
                </Pressable>
                <Text style={styles.title}>{page.header}</Text>
            </View>

            <View style={styles.body}>
                <View style={styles.iconBadge}>
                    <Icon size={24} color="#2ECC71" />
                </View>

                <Text style={styles.label}>{page.label}</Text>

                {type === "full_name" && (
                    <View style={styles.nameRow}>
                        <TextInput
                            onFocus={() => setFocused('first')}
                            onBlur={() => setFocused(null)}
                            style={[styles.input, styles.nameInput, focused === 'first' && styles.inputFocused]}
                            placeholder="First name"
                            onChangeText={setDetail}
                            value={detail}
                            placeholderTextColor="#B0B0B0"
                        />
                        <TextInput
                            onFocus={() => setFocused('last')}
                            onBlur={() => setFocused(null)}
                            style={[styles.input, styles.nameInput, focused === 'last' && styles.inputFocused]}
                            placeholder="Last name"
                            onChangeText={setLastName}
                            value={lastName}
                            placeholderTextColor="#B0B0B0"
                        />
                    </View>
                )}

                {isPhone && (
                    <View style={styles.phoneRow}>
                        <View style={styles.phoneCode}>
                            <Text style={styles.phoneCodeText}>+234</Text>
                        </View>
                        <TextInput
                            onFocus={() => setFocused('phone')}
                            onBlur={() => setFocused(null)}
                            style={[styles.input, styles.phoneInput, focused === 'phone' && styles.inputFocused]}
                            placeholder={page.placeholder}
                            keyboardType={page.keyboardType}
                            onChangeText={setDetail}
                            value={detail}
                            placeholderTextColor="#B0B0B0"
                        />
                    </View>
                )}

                {isDisplayName && (
                    <TextInput
                        onFocus={() => setFocused('single')}
                        onBlur={() => setFocused(null)}
                        style={[styles.input, focused === 'single' && styles.inputFocused]}
                        placeholder={page.placeholder}
                        onChangeText={setDetail}
                        value={detail}
                        placeholderTextColor="#B0B0B0"
                    />
                )}

                {page.helper && (
                    <Text style={styles.helperBottom}>{page.helper}</Text>
                )}

                {/* {isPhone && (
                    <View style={styles.infoBox}>
                        <Info size={16} color="#D9A441" style={{ marginTop: 1 }} />
                        <Text style={styles.infoText}>
                            We'll send a verification code to confirm this number is yours before saving.
                        </Text>
                    </View>
                )} */}

                <Pressable
                    style={({ pressed }) => [
                        styles.button,
                        isDisabled && styles.buttonDisabled,
                        pressed && !isDisabled && styles.buttonPressed,
                    ]}
                    disabled={isDisabled}
                    onPress={updateDetails}
                >
                    <Text style={styles.buttonText}>{page.buttonText}</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f5f4'
    },
    header: {
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#ffffff',
        borderWidth: 0.5,
        borderColor: '#e8e8e8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    body: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        paddingHorizontal: 24,
    },
    iconBadge: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#E8F8EE',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18,
    },
    label: {
        fontSize: 13,
        color: '#999999',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 19,
        maxWidth: 260,
    },
    input: {
        width: '100%',
        height: 52,
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#e8e8e8',

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,

        marginBottom: 12,
    },
    inputFocused: {
        borderColor: '#2ECC71',
        shadowColor: '#2ECC71',
        shadowOpacity: 0.12,
    },
    nameRow: {
        width: '100%',
        flexDirection: 'row',
        gap: 10,
    },
    nameInput: {
        flex: 1,
        marginBottom: 0,
    },
    phoneRow: {
        width: '100%',
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    phoneCode: {
        width: 76,
        height: 52,
        backgroundColor: '#fff',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#e8e8e8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    phoneCodeText: {
        fontSize: 16,
        color: '#1a1a1a',
    },
    phoneInput: {
        flex: 1,
        marginBottom: 0,
    },
    helperBottom: {
        fontSize: 12,
        color: '#aaaaaa',
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 8,
        lineHeight: 18,
        maxWidth: 260,
    },
    infoBox: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'flex-start',
        backgroundColor: '#FFF6E5',
        borderRadius: 12,
        padding: 12,
        marginTop: 4,
        marginBottom: 8,
        width: '100%',
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        color: '#8a6d2f',
        lineHeight: 18,
    },
    button: {
        width: '100%',
        height: 52,
        backgroundColor: '#2ECC71',
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,

        shadowColor: '#2ECC71',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    buttonDisabled: {
        backgroundColor: '#d9d9d9',
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonPressed: {
        opacity: 0.85,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
})

export default EditDetail