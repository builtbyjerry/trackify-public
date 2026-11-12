// screens/products/EditSize.jsx

import { useState, useEffect, useMemo } from 'react'
import {
  View, Text, StyleSheet, Pressable,
  TextInput, ActivityIndicator,
  Alert,
  Image
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { ArrowLeft, Archive, AlertTriangle, Camera } from 'lucide-react-native'

import { createVariants, updateVariants } from '../../../src/api/products.js'
import { deactivateVariant, getProductById, getVariantById, saveProductImage } from '../../../src/services/productServices.js'
import { useUser } from '../../../src/hooks/useUser.jsx'
import { useImagePicker } from '../../../src/hooks/useImagePicker.jsx'
import PhotoOption from '../../../src/components/profile/PhotoOption.jsx'
import CustomAlert from '../../../src/components/CustomAlert.jsx'
import { errorLog, log } from '../../../src/utils/loggers.js'
import * as Sentry from "@sentry/react"
import { useToast } from '../../../src/hooks/useToast.jsx';
import { mapError } from '../../../src/utils/errorMappers.js';


const TEAL = '#0F6E56'
const MARGIN_WARNING_THRESHOLD = 10 // % — configurable later

const EditSize = () => {
  const { productId, variantId, imageUrl } = useLocalSearchParams()
  const isNew = !variantId
  
  const { employee } = useUser()
  const { capturePhoto, pickImage } = useImagePicker()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [focused, setFocused] = useState(null)
  const [showAlert, setShowAlert] = useState(false)
  const [initialImage, setInitialImage] = useState(imageUrl)

  const [name, setName] = useState('')
  const [unitsPerVariant, setUnitsPerVariant] = useState('1')
  const [sellPrice, setSellPrice] = useState('')
  const [costPerBaseUnit, setCostPerBaseUnit] = useState(0) // from parent product
  const [imageSheetVisible, setImageSheetVisible] = useState(false)
  
  const openEditProfileImage = () => setImageSheetVisible(true)
  const closeEditProfileImage = () => setImageSheetVisible(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const product = await getProductById(productId) // your API call here
        setCostPerBaseUnit(product.cost_per_base_unit ?? 0)

        if (!isNew) {
          const variant = await getVariantById(variantId) // your API call here
          setName(variant.name)
          setUnitsPerVariant(String(variant.units_per_variant))
          setSellPrice(String(variant.sell_price))
        }
      } catch (e) {
        errorLog('Failed to fetch:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [productId, variantId])

  const margin = useMemo(() => {
    const units = parseFloat(unitsPerVariant)
    const price = parseFloat(sellPrice)
    if (!units || !price || price <= 0) return null

    const cost = costPerBaseUnit * units
    const profit = price - cost
    const percent = (profit / price) * 100

    return { profit, percent, isLow: percent < MARGIN_WARNING_THRESHOLD }
  }, [unitsPerVariant, sellPrice, costPerBaseUnit])

  const openCamera = async () => {
      closeEditProfileImage()
      log('[openCamera] starting...')
      log('[openCamera] employee id:', employee?.id)
  
      const uri = await capturePhoto()
      log('[openCamera] uri returned:', uri)
      if (!uri) return
  
      try {
        log(" calling saveProductImage from openCamera ")
        await saveProductImage(variantId, uri) // product id not product_variant id
        setInitialImage(uri)
      } catch (error) {
        log("Error trying to save product image", error)
        Alert.alert('Error', 'Failed to upload product to db via openCamera')
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
        log(" calling saveProductImage from openGallery ")
        await saveProductImage(variantId, uri) // product id not product_variant id
        setInitialImage(uri)
      } catch (error) {
        log("Error trying to save product image", error)
        Alert.alert('Error', 'Failed to upload product to db via openGallery')
      }
    }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        product_id: productId,
        name,
        units_per_variant: parseFloat(unitsPerVariant),
        sell_price: parseFloat(sellPrice),
      }
      if (isNew) {
        await createVariants(payload)
      } else {
        await updateVariants(variantId, payload) // your API call here
      }
      router.back()
    } catch (e) {
      errorLog('Failed to save variant:', e)
      Sentry.captureException(e)
      showToast({
        title: "Error editing product",
        description: mapError(e, 'editProduct'),
        type: 'warning'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async () => {
    try {
      await deactivateVariant(variantId) // sets is_active = false
      log("Variant was deactivated successfully")
      router.replace({
        pathname: '/(dashboard)/products/DeactivateProductSuccess',
        params: {
          productName: null,
          type: 'product',  // or 'variant'
        }
      })
    } catch (e) {
      errorLog('Failed to remove variant:', e)
      Sentry.captureException(e)
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={TEAL} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} style={styles.navBack}>
          <ArrowLeft size={16} color="#1a1a1a" />
        </Pressable>
        <Text style={styles.navTitle}>{name || 'New size'}</Text>
        <Pressable onPress={handleSave} disabled={saving}>
           {saving
              ? <ActivityIndicator size="small" color={TEAL} />
              : <Text style={[styles.navSave, saving && styles.navSaveDisabled]}>Save</Text>
            }
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={styles.photoRow}>
          <Pressable style={styles.photoBox} onPress={openEditProfileImage}>
            {initialImage ? (
              <Image source={{ uri: initialImage }} style={styles.photoImage}/>
            ): (
              <>
                <Camera size={22} color="#999999" />
                <Text style={styles.photoText}>Add photo</Text>
              </>
            )}
          </Pressable>
        </View>
        <Text style={styles.fieldLabel}>Size name</Text>
          <TextInput
            style={[styles.input, focused === 'name' && styles.inputFocused]}
            value={name}
            onChangeText={setName}
            onFocus={() => setFocused('name')}
            onBlur={() => setFocused(null)}
            placeholder="e.g. Bottle, Crate"
            placeholderTextColor="#B0B0B0"
          />

        <Text style={styles.fieldLabel}>Units per size</Text>
          <TextInput
            style={[styles.input, focused === 'units' && styles.inputFocused]}
            value={unitsPerVariant}
            onChangeText={setUnitsPerVariant}
            onFocus={() => setFocused('units')}
            onBlur={() => setFocused(null)}
            keyboardType="numeric"
            placeholder="1"
            placeholderTextColor="#B0B0B0"
          />
        <View style={styles.priceFlex}>
          <Text style={styles.fieldLabel}>Selling price</Text>
          <Text style={styles.prefix}>₦</Text>
        </View>
        <TextInput
            style={[styles.input, focused === 'price' && styles.inputFocused]}
            value={sellPrice}
            onChangeText={setSellPrice}
            onFocus={() => setFocused('price')}
            onBlur={() => setFocused(null)}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#B0B0B0"
          />

        {margin && (
          <View style={[styles.marginCard, margin.isLow && styles.marginCardWarn]}>
            <View style={styles.marginLeft}>
              {margin.isLow && <AlertTriangle size={13} color="#854F0B" />}
              <Text style={[styles.marginLabel, margin.isLow && styles.marginLabelWarn]}>
                {margin.isLow ? 'Low profit margin' : 'Profit margin'}
              </Text>
            </View>
            <Text style={[styles.marginValue, margin.isLow && styles.marginValueWarn]}>
              {margin.percent.toFixed(1)}% · ₦{margin.profit.toLocaleString('en-NG', { maximumFractionDigits: 0 })}
            </Text>
          </View>
        )}

        {!isNew && (
          <Pressable style={styles.deleteBtn} onPress={() => setShowAlert(true)}>
            <Archive size={15} color="#A32D2D" />
            <Text style={styles.deleteText}>Remove this size</Text>
          </Pressable>
        )}
      </View>
      <CustomAlert
        visible={showAlert}
        title="Remove product"
        subtitle='Are you sure you want to remove this product?'
        actionText='Remove'
        onCancel={() => setShowAlert(false)}
        onConfirm={handleRemove}
      />
      <PhotoOption
          visible={imageSheetVisible}
          onClose={closeEditProfileImage}
          onCamera={openCamera}
          onGallery={openGallery}
      />
    </SafeAreaView>
  )
}

export default EditSize

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f5f4',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
  },
  navBack: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 0.5,
    borderColor: '#e8e8e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#1a1a1a',
    flex: 1,
  },
  navSave: {
    fontSize: 14,
    fontWeight: '500',
    color: TEAL,
  },
  navSaveDisabled: {
    color: '#C0C0C0',
  },
  body: {
    paddingHorizontal: 16,
  },
  photoRow: {
    alignItems: 'center',
    marginBottom: 24,
  },
  photoBox: {
    width: 84,
    height: 84,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d0d0d0',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  photoImage: { 
    width: 84, 
    height: 84, 
  },

  photoText: {
    fontSize: 11,
    color: '#999999',
  },
  priceFlex: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#999999',
    paddingVertical: 8,
  },
  prefix: {
    fontSize: 14,
    color: '#999999',
  },
  input: {
    width: '100%',
    fontSize: 14,
    color: '#1a1a1a',
    height: 46,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    alignSelf: 'center',
  },
  inputFocused: {
    borderColor: TEAL,
    shadowColor: TEAL,
    shadowOpacity: 0.12,
  },
  marginCard: {
    marginTop: 18,
    backgroundColor: '#E8F8EE',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  marginCardWarn: {
    backgroundColor: '#FAEEDA',
  },
  marginLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  marginLabel: {
    fontSize: 12,
    color: TEAL,
  },
  marginLabelWarn: {
    color: '#854F0B',
  },
  marginValue: {
    fontSize: 16,
    fontWeight: '500',
    color: TEAL,
  },
  marginValueWarn: {
    color: '#854F0B',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 46,
    borderWidth: 0.5,
    borderColor: '#F09595',
    borderRadius: 10,
    marginTop: 24,
  },
  deleteText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#A32D2D',
  },
})