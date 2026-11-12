// screens/products/EditProduct.jsx

import { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, Pressable,
  TextInput, ScrollView, ActivityIndicator,
  Alert
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { ArrowLeft, Plus, ChevronRight, Archive } from 'lucide-react-native'

import CostInput from '../../../src/components/products/CostInput.jsx'
import { deactivateProductAndVariants, getProductById } from '../../../src/services/productServices.js'
import { useImagePicker } from '../../../src/hooks/useImagePicker.jsx'
import { useUser } from '../../../src/hooks/useUser.jsx'
import PhotoOption from '../../../src/components/profile/PhotoOption.jsx'
import { createProduct, saveProductImage, updateProduct } from '../../../src/api/products.js'
import CustomAlert from '../../../src/components/CustomAlert.jsx'
import { errorLog, log } from '../../../src/utils/loggers.js'
import * as Sentry from "@sentry/react"
import { useToast } from '../../../src/hooks/useToast.jsx';
import { mapError } from '../../../src/utils/errorMappers.js';


const TEAL = '#0F6E56'
const PURPLE = '#635BFF'

const EditProduct = () => {
  const { id } = useLocalSearchParams()
  const isNew = !id

  const { employee } = useUser()
  const { capturePhoto, pickImage } = useImagePicker()
  const { showToast } = useToast()
  

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [focused, setFocused] = useState(null)

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [baseUnit, setBaseUnit] = useState('')
  const [costPerBaseUnit, setCostPerBaseUnit] = useState(0)
  const [variants, setVariants] = useState([])
  const [showAlert, setShowAlert] = useState(false)
  const [imageSheetVisible, setImageSheetVisible] = useState(false)

  const openEditProfileImage = () => setImageSheetVisible(true)
  const closeEditProfileImage = () => setImageSheetVisible(false)


  useEffect(() => {
    if (isNew) return
    const fetchProduct = async () => {
      setLoading(true)
      try {
        const data = await getProductById(id) // your API call here
        setName(data.name)
        setCategory(data.category ?? '')
        setBaseUnit(data.base_unit)
        setCostPerBaseUnit(data.cost_per_base_unit ?? 0)
        setVariants(data.variants ?? [])
      } catch (e) {
        errorLog('Failed to fetch product:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const openCamera = async () => {
    closeEditProfileImage()
    log('[openCamera] starting...')
    log('[openCamera] employee id:', employee?.id)

    const uri = await capturePhoto()
    log('[openCamera] uri returned:', uri)
    if (!uri) return

    try {
      log(" calling saveProductImage from openCamera ")
      await saveProductImage(id, uri) // product id not product_variant id
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
      await saveProductImage(id, uri) // product id not product_variant id
    } catch (error) {
      log("Error trying to save product image", error)
      Alert.alert('Error', 'Failed to upload product to db via openGallery')
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = { name, category, base_unit: baseUnit, cost_per_base_unit: costPerBaseUnit }
      if (isNew) {
        await createProduct(payload)
      } else {
        await updateProduct(id, payload)
      }
      router.back()
    } catch (e) {
      errorLog('Failed to save product:', e)
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
      await deactivateProductAndVariants(id) // sets is_active = false
      log("Successfully deactivated")
      router.replace({
        pathname: '/(dashboard)/products/DeactivateProductSuccess',
        params: {
          productName: name,
          type: 'product',  // or 'variant'
        }
      })
    } catch (e) {
      errorLog('Failed to remove product:', e)
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
        <Text style={styles.navTitle}>{isNew ? 'Add product' : 'Edit product'}</Text>
        <Pressable onPress={handleSave} disabled={saving}>
          <Text style={[styles.navSave, saving && { opacity: 0.5 }]}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </Pressable>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* <View style={styles.photoRow}>
          <Pressable style={styles.photoBox} onPress={openEditProfileImage}>
            <Camera size={22} color="#000000" />
            <Text style={styles.photoText}>Add photo</Text>
          </Pressable>
        </View> */}

        <Text style={styles.fieldLabel}>Product name</Text>
        <TextInput
          style={[styles.input, focused === 'name' && styles.inputFocused]}
          value={name}
          onChangeText={setName}
          onFocus={() => setFocused('name')}
          onBlur={() => setFocused(null)}
          placeholder="e.g. Fanta"
          placeholderTextColor="#B0B0B0"
        />

        <Text style={styles.fieldLabel}>Category</Text>
        <TextInput
          style={[styles.input, focused === 'category' && styles.inputFocused]}
          value={category}
          onChangeText={setCategory}
          onFocus={() => setFocused('category')}
          onBlur={() => setFocused(null)}
          placeholder="e.g. Soft drinks"
          placeholderTextColor="#B0B0B0"
        />

        <Text style={styles.fieldLabel}>Base unit</Text>
        <TextInput
          style={[styles.input, focused === 'baseUnit' && styles.inputFocused]}
          value={baseUnit}
          onChangeText={setBaseUnit}
          onFocus={() => setFocused('baseUnit')}
          onBlur={() => setFocused(null)}
          placeholder="e.g. bottle, satchet, kg"
          placeholderTextColor="#B0B0B0"
        />

        <View style={{ marginTop: 16 }}>
          <CostInput
            baseUnit={baseUnit || 'unit'}
            value={costPerBaseUnit}
            onChange={setCostPerBaseUnit}
          />
        </View>

        {!isNew && (
          <View style={styles.variantsSection}>
            <View style={styles.variantsHead}>
              <Text style={styles.variantsTitle}>Sizes & prices</Text>
              <Pressable
                style={styles.addSizeBtn}
                onPress={() => router.push({ pathname: '/products/EditSize', params: { productId: id } })}
              >
                <Plus size={13} color={PURPLE} />
                <Text style={styles.addSizeText}>Add size</Text>
              </Pressable>
            </View>

            {variants.map((variant) => (
              <Pressable
                key={variant.id}
                style={styles.variantItem}
                onPress={() => router.push({
                  pathname: '/products/EditSize',
                  params: { productId: id, variantId: variant.id }
                })}
              >
                <Text style={styles.variantItemLeft}>{variant.name}</Text>
                <View style={styles.variantItemRight}>
                  <Text style={styles.variantItemPrice}>
                    ₦{Number(variant.sell_price).toLocaleString('en-NG')}
                  </Text>
                  <ChevronRight size={14} color="#999999" />
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {!isNew && (
          <Pressable style={styles.deleteBtn} onPress={() => setShowAlert(true)}>
            <Archive size={15} color="#A32D2D" />
            <Text style={styles.deleteText}>Remove product from catalogue</Text>
          </Pressable>
        )}
      </ScrollView>
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
          onCamera={() => log("This will be done tomorrow or next (need to sleep badly")}
          onGallery={() => log("This will be done tomorrow or next (need to sleep badly")}
      />
    </SafeAreaView>
  )
}

export default EditProduct

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
  body: {
    flex: 1,
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
    borderStyle: 'dashed',
    borderColor: '#d0d0d0',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  photoText: {
    fontSize: 11,
    color: '#999999',
  },
  fieldLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 6,
    marginTop: 16,
  },
  inputFocused: {
    borderColor: TEAL,
    shadowColor: TEAL,
    shadowOpacity: 0.12,
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
  variantsSection: {
    marginTop: 24,
  },
  variantsHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  variantsTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  addSizeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addSizeText: {
    fontSize: 12,
    color: PURPLE,
    fontWeight: '500',
  },
  variantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderWidth: 0.5,
    borderColor: '#e8e8e8',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  variantItemLeft: {
    fontSize: 13,
    color: '#1a1a1a',
  },
  variantItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  variantItemPrice: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1a1a1a',
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