import { useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import Spacer from './Spacer';

export default function CustomAlert({ visible, title, subtitle, actionText, onCancel, onConfirm }) {
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true)
        await onConfirm()
        setLoading(false)
    }
  return (
    <Modal transparent visible={visible} animationType="fade">
        <View style={styles.overlay}>
            <View style={styles.box}>
                <Text style={styles.title}>{title ?? "Action Required"}</Text>
                <Text style={styles.body}>{subtitle ?? ""}</Text>

                {loading ? (
                    <>
                        <Spacer height={15}/>
                        <ActivityIndicator size={'small'} color='#ff4f4f' />
                    </>
                ) : (
                    <View style={styles.buttons}>
                        <Pressable style={styles.cancelBtn} onPress={onCancel}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </Pressable>

                        <Pressable style={styles.logoutBtn} onPress={handleConfirm}>
                            <Text style={styles.logoutText}>{actionText ?? "Take action"}</Text>
                        </Pressable>
                    </View>

                )}
                
            </View>
        </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  body: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
    color: '#555',
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 24,
    justifyContent: 'space-between',
  },
  cancelBtn: {
    flex: 1,
    marginRight: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
  logoutBtn: {
    flex: 1,
    marginLeft: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#ff4f4f',
  },
  cancelText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#111',
  },
  logoutText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#fff',
  },
});
