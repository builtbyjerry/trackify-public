// app/(dashboard)/products/AddProduct.jsx

import { useState, useCallback, useMemo } from 'react'
import {
  View, Text, StyleSheet, Pressable,
  TextInput, ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { ArrowLeft, Plus, X, TrendingUp, AlertTriangle } from 'lucide-react-native'

import Combobox from '../../../src/components/products/ComboBox.jsx'
import CostInput from '../../../src/components/products/CostInput.jsx'
import { useUser } from '../../../src/hooks/useUser.jsx'
import { getDistinctBaseUnits, getDistinctCategories } from '../../../src/api/products.js'
import { createProduct } from '../../../src/api/products.js'
import { createVariants } from '../../../src/api/products.js'
import { isProductsDirty, markProductsDirty } from '../../../src/store/productStore.js'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { errorLog, log } from '../../../src/utils/loggers.js'
import * as Sentry from "@sentry/react";
import { useToast } from '../../../src/hooks/useToast.jsx'
import { mapError } from '../../../src/utils/errorMappers.js'



const TEAL = '#0F6E56'
const PURPLE = '#635BFF'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const INITIAL_COLORS = ['#E8F8EE', '#EEF1FF', '#FFF6E5', '#FFE9E9', '#E5F0FF']

export const getProductColor = (name = '') => {
  const index = name.charCodeAt(0) % INITIAL_COLORS.length
  return INITIAL_COLORS[index]
}

const calcMargin = (sellPrice, costPerUnit, unitsPerVariant) => {
  const price = parseFloat(sellPrice)
  const cost = parseFloat(costPerUnit) * parseFloat(unitsPerVariant || 1)
  if (!price || price <= 0 || !costPerUnit) return null
  const profit = price - cost
  const percent = (profit / price) * 100
  return { profit, percent, isLow: percent < 10 }
}

const emptyVariant = () => ({
  key: Date.now().toString(),
  name: '',
  units: '1',
  price: '',
})

// ─── Sub-components ───────────────────────────────────────────────────────────

const MarginBadge = ({ margin }) => {
  if (!margin) return null
  return (
    <View style={[styles.marginBadge, margin.isLow && styles.marginBadgeWarn]}>
      {margin.isLow
        ? <AlertTriangle size={11} color="#854F0B" />
        : <TrendingUp size={11} color={TEAL} />
      }
      <Text style={[styles.marginText, margin.isLow && styles.marginTextWarn]}>
        {margin.percent.toFixed(1)}% margin · ₦{Math.abs(margin.profit).toLocaleString('en-NG', { maximumFractionDigits: 0 })} {margin.profit < 0 ? 'loss' : 'profit'}
      </Text>
    </View>
  )
}

const VariantCard = ({ variant, index, costPerBaseUnit, onUpdate, onRemove, canRemove }) => {
  const [focused, setFocused] = useState(null)
  const margin = useMemo(
    () => calcMargin(variant.price, costPerBaseUnit, variant.units),
    [variant.price, costPerBaseUnit, variant.units]
  )

  return (
    <View style={styles.variantCard}>
      <View style={styles.variantCardHead}>
        <Text style={styles.variantCardLabel}>Size {index + 1}</Text>
        {canRemove && (
          <Pressable style={styles.variantRemove} onPress={() => onRemove(variant.key)}>
            <X size={12} color="#A32D2D" />
          </Pressable>
        )}
      </View>

      <View style={styles.variantFields}>
        <View style={styles.variantField}>
          <Text style={styles.variantFieldLabel}>Size name</Text>
          <View style={[styles.variantInput, focused === 'name' && styles.variantInputFocused]}>
            <TextInput
              style={styles.variantInputText}
              value={variant.name}
              onChangeText={(v) => onUpdate(variant.key, 'name', v)}
              onFocus={() => setFocused('name')}
              onBlur={() => setFocused(null)}
              placeholder="e.g. Bottle"
              placeholderTextColor="#C0C0C0"
            />
          </View>
        </View>

        <View style={[styles.variantField, { maxWidth: 70 }]}>
          <Text style={styles.variantFieldLabel}>Units</Text>
          <View style={[styles.variantInput, focused === 'units' && styles.variantInputFocused]}>
            <TextInput
              style={styles.variantInputText}
              value={variant.units}
              onChangeText={(v) => onUpdate(variant.key, 'units', v)}
              onFocus={() => setFocused('units')}
              onBlur={() => setFocused(null)}
              keyboardType="numeric"
              placeholder="1"
              placeholderTextColor="#C0C0C0"
            />
          </View>
        </View>

        <View style={styles.variantField}>
          <Text style={styles.variantFieldLabel}>Price</Text>
          <View style={[styles.variantInput, focused === 'price' && styles.variantInputFocused]}>
            <Text style={styles.variantPrefix}>₦</Text>
            <TextInput
              style={styles.variantInputText}
              value={variant.price}
              onChangeText={(v) => onUpdate(variant.key, 'price', v)}
              onFocus={() => setFocused('price')}
              onBlur={() => setFocused(null)}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#C0C0C0"
            />
          </View>
        </View>
      </View>

      <MarginBadge margin={margin} />
    </View>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

const AddProduct = () => {
  const { employee } = useUser()
  const businessId = employee?.business_id

  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [baseUnit, setBaseUnit] = useState('')
  const [costPerBaseUnit, setCostPerBaseUnit] = useState(0)
  const [sellMode, setSellMode] = useState('single') // 'single' | 'multiple'
  const [singlePrice, setSinglePrice] = useState('')
  const [variants, setVariants] = useState([emptyVariant()])

  // fetch existing categories and base units from DB
  const [existingCategories, setExistingCategories] = useState([])
  const [existingBaseUnits, setExistingBaseUnits] = useState([])

  const { showToast } = useToast()
  useState(() => {
    const fetchOptions = async () => {
      if (!businessId) return
      try {
        const cats = await getDistinctCategories(businessId)
        const units = await getDistinctBaseUnits(businessId)
        setExistingCategories(cats)
        setExistingBaseUnits(units)
      } catch (e) {
        errorLog('Failed to fetch options:', e)
      }
    }
    fetchOptions()
  }, [])

  // ── Variant handlers ──────────────────────────────────────────────────────
  const handleVariantUpdate = useCallback((key, field, value) => {
    setVariants(prev => prev.map(v => v.key === key ? { ...v, [field]: value } : v))
  }, [])

  const handleVariantRemove = useCallback((key) => {
    setVariants(prev => prev.filter(v => v.key !== key))
  }, [])

  const handleAddVariant = useCallback(() => {
    setVariants(prev => [...prev, emptyVariant()])
  }, [])

  // ── Validation ────────────────────────────────────────────────────────────
  const isValid = useMemo(() => {
    if (!name.trim() || !baseUnit.trim()) return false
    if (sellMode === 'single') return !!singlePrice
    return variants.every(v => v.name.trim() && v.price)
  }, [name, baseUnit, sellMode, singlePrice, variants])

  // ── Single price margin ───────────────────────────────────────────────────
  const singleMargin = useMemo(
    () => calcMargin(singlePrice, costPerBaseUnit, 1),
    [singlePrice, costPerBaseUnit]
  )

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true)
    try {
      // 1. create the product
      const product = await createProduct({
        name: name.trim(),
        category: category.trim(),
        base_unit: baseUnit.trim(),
        cost_per_base_unit: costPerBaseUnit,
        business_id: businessId,
      })
      log('product: ', product)

      // 2. create variants
      const variantPayloads = sellMode === 'single'
        ? [{
            product_id: product.id,
            business_id: businessId,
            name: baseUnit.trim(),  // single variant named after base unit
            units_per_variant: 1,
            sell_price: parseFloat(singlePrice),
          }]
        : variants.map(v => ({
            product_id: product.id,
            business_id: businessId,
            name: v.name.trim(),
            units_per_variant: parseFloat(v.units) || 1,
            sell_price: parseFloat(v.price),
          }))

      await createVariants(variantPayloads) // batch insert

      markProductsDirty()
      log('Products marked dirty:', isProductsDirty()) 
      router.replace({
        pathname: '/(dashboard)/products/AddProductSuccess',
        params: { productName: name.trim() }
      })
    } catch (e) {
      errorLog('Failed to save product:', e)
      Sentry.captureException(e)
      showToast({
        title: "Error adding product",
        description: mapError(e, 'addProduct'),
        type: 'warning'
      })
    } finally {
      setSaving(false)
    }
  }

  // ── Focused state for single price input ──────────────────────────────────
  const [priceFocused, setPriceFocused] = useState(false)

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} style={styles.navBack}>
          <ArrowLeft size={16} color="#1a1a1a" />
        </Pressable>
        <Text style={styles.navTitle}>Add product</Text>
        <Pressable onPress={handleSave} disabled={!isValid || saving}>
            {saving
                ? <ActivityIndicator size="small" color={TEAL} />
                : <Text style={[styles.navSave, !isValid && styles.navSaveDisabled]}>Save</Text>
            }
        </Pressable>
      </View>

      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 60 }}
        bottomOffset={20}
      >
        {/* Product name */}
        <Text style={styles.fieldLabel}>Product name</Text>
          <TextInput
            style={[styles.input, name && styles.inputBoxFocused]}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Fanta, Agege Bread"
            placeholderTextColor="#C0C0C0"
            autoFocus
          />

        {/* Category */}
        <View style={{ zIndex: 20, marginTop: 16 }}>
          <Combobox
            label="Category"
            value={category}
            onChange={setCategory}
            options={existingCategories}
            placeholder="e.g. Soft drinks, Grains"
            addLabel="category"
          />
        </View>

        {/* Base unit */}
        <View style={{ zIndex: 10, marginTop: 16 }}>
          <Combobox
            label="Base unit"
            value={baseUnit}
            onChange={setBaseUnit}
            options={existingBaseUnits}
            placeholder="e.g. bottle, kg, piece"
            addLabel="unit"
          />
        </View>

        {/* Cost */}
        <View style={{ marginTop: 16 }}>
          <CostInput
            baseUnit={baseUnit || 'unit'}
            value={costPerBaseUnit}
            onChange={setCostPerBaseUnit}
          />
        </View>

        <View style={styles.divider} />

        {/* Sell mode */}
        <Text style={styles.sectionTitle}>How do you sell this?</Text>
        <Text style={styles.sectionSub}>
          {name ? `Choose how customers buy ${name}` : 'Choose how customers buy this product'}
        </Text>

        <View style={styles.sellToggle}>
          <Pressable
            style={[styles.sellOpt, sellMode === 'single' && styles.sellOptActive]}
            onPress={() => setSellMode('single')}
          >
            <View style={[styles.radio, sellMode === 'single' && styles.radioActive]}>
              {sellMode === 'single' && <View style={styles.radioDot} />}
            </View>
            <Text style={[styles.sellOptText, sellMode === 'single' && styles.sellOptTextActive]}>
              Single size
            </Text>
          </Pressable>

          <Pressable
            style={[styles.sellOpt, sellMode === 'multiple' && styles.sellOptActive]}
            onPress={() => setSellMode('multiple')}
          >
            <View style={[styles.radio, sellMode === 'multiple' && styles.radioActive]}>
              {sellMode === 'multiple' && <View style={styles.radioDot} />}
            </View>
            <Text style={[styles.sellOptText, sellMode === 'multiple' && styles.sellOptTextActive]}>
              Multiple sizes
            </Text>
          </Pressable>
        </View>

        {/* Single size */}
        {sellMode === 'single' && (
          <View style={{ marginTop: 14 }}>
            <Text style={styles.fieldLabel}>
              Selling price {baseUnit ? `per ${baseUnit}` : ''}
            </Text>
            <TextInput
            style={[styles.input, priceFocused && styles.inputBoxFocused]}
            value={singlePrice}
            onChangeText={setSinglePrice}
            onFocus={() => setPriceFocused(true)}
            onBlur={() => setPriceFocused(false)}
            keyboardType="numeric"
            placeholder="₦0"
            placeholderTextColor="#C0C0C0"
            />
            <MarginBadge margin={singleMargin} />
          </View>
        )}

        {/* Multiple sizes */}
        {sellMode === 'multiple' && (
          <View style={{ marginTop: 14, gap: 10 }}>
            {variants.map((variant, index) => (
              <VariantCard
                key={variant.key}
                variant={variant}
                index={index}
                costPerBaseUnit={costPerBaseUnit}
                onUpdate={handleVariantUpdate}
                onRemove={handleVariantRemove}
                canRemove={variants.length > 1}
              />
            ))}

            <Pressable style={styles.addVariantBtn} onPress={handleAddVariant}>
              <Plus size={14} color={PURPLE} />
              <Text style={styles.addVariantText}>Add another size</Text>
            </Pressable>
          </View>
        )}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}

export default AddProduct

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f5f4',
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
    flex: 1,
    paddingHorizontal: 16,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#999999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 16,
  },

  inputBoxFocused: {
    borderColor: TEAL,
    shadowColor: TEAL,
    shadowOpacity: 0.1,
  },
  inputBoxFilled: {
    borderColor: '#e0e0e0',
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
    gap: 6,
  },
  prefix: {
    fontSize: 14,
    color: '#999999',
  },
  divider: {
    height: 0.5,
    backgroundColor: '#e8e8e8',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 14,
  },
  sellToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  sellOpt: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    backgroundColor: '#ffffff',
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    borderRadius: 10,
  },
  sellOptActive: {
    borderColor: TEAL,
    backgroundColor: '#f0faf6',
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#d0d0d0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: TEAL,
    backgroundColor: TEAL,
  },
  radioDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
  },
  sellOptText: {
    fontSize: 13,
    color: '#666666',
  },
  sellOptTextActive: {
    color: TEAL,
    fontWeight: '500',
  },
  marginBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F8EE',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  marginBadgeWarn: {
    backgroundColor: '#FAEEDA',
  },
  marginText: {
    fontSize: 12,
    color: TEAL,
    fontWeight: '500',
  },
  marginTextWarn: {
    color: '#854F0B',
  },

  // Variant card
  variantCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    padding: 12,
  },
  variantCardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  variantCardLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  variantRemove: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  variantFields: {
    flexDirection: 'row',
    gap: 8,
  },
  variantField: {
    flex: 1,
  },
  variantFieldLabel: {
    fontSize: 10,
    color: '#999999',
    marginBottom: 4,
  },
  variantInput: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    backgroundColor: '#f9f9f9',
    borderWidth: 0.5,
    borderColor: '#e8e8e8',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  variantInputFocused: {
    borderColor: TEAL,
    backgroundColor: '#ffffff',
  },
  variantInputText: {
    flex: 1,
    fontSize: 13,
    color: '#1a1a1a',
    padding: 0,
  },
  variantPrefix: {
    fontSize: 13,
    color: '#999999',
    marginRight: 2,
  },
  addVariantBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: PURPLE,
    borderRadius: 10,
  },
  addVariantText: {
    fontSize: 13,
    color: PURPLE,
    fontWeight: '500',
  },
})