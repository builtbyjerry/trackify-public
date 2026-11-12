import { supabase } from "./supabase.js";

export const fetchProductVariants = async () => {
    const { data, error } = await supabase
        .from("product_variants")
        .select("*")
    if (error) throw error
    return data
}

export const fetchActiveProductVariants = async () => {
    const { data, error } = await supabase
        .from("product_variants")
        .select(`
            *,
            products(id, name, category, cost_per_base_unit, base_unit, image_url)
        `)
        .eq("is_active", true)
        .order('created_at', { ascending: false })
    if (error) throw error
    return data
}

export const fetchProductById = async (productId) => {
    const { data: product, error } = await supabase.
        from("products")
        .select("*")
        .eq("id", productId)
        .single()
    
    if (error) throw error
    return product
}

export const fetchVariantById = async (variantId) => {
    const { data: variant, error } = await supabase.
        from("product_variants")
        .select("*")
        .eq("id", variantId)
        .maybeSingle()
    
    if (error) throw error
    return variant
}

export const updateProductVariant = async (id, updates) => {
    const { error } = await supabase.
        from("product_variants")
        .update(updates)
        .eq("id", id)
    if (error) throw error
    return { success : true }
} 

// get distinct categories for this business
export const getDistinctCategories = async (businessId) => {
  const { data, error } = await supabase
    .from('products')
    .select('category')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .not('category', 'is', null)
  if (error) throw error
  return [...new Set(data.map(p => p.category))].sort()
}

// get distinct base units for this business
export const getDistinctBaseUnits = async (businessId) => {
  const { data, error } = await supabase
    .from('products')
    .select('base_unit')
    .eq('business_id', businessId)
    .eq('is_active', true)
  if (error) throw error
  return [...new Set(data.map(p => p.base_unit))].sort()
}

// batch insert variants
export const createVariants = async (variants) => {
  const { data, error } = await supabase
    .from('product_variants')
    .insert(variants)
    .select()
  if (error) throw error
  return data
}

export const createProduct = async (product) => {
    const { data, error } = await supabase
        .from("products")
        .insert(product)
        .select()
        .single()
    if (error) throw error
    return data
}

export const updateVariants = async (variantId, variants) => {
    const { error } = await supabase
        .from("product_variants")
        .update(variants)
        .eq("id", variantId)
    if (error) throw error
}

export const updateProduct = async (productId, updates) => {
    const { error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", productId)
    
    if (error) throw error
}

export const updateVariantsViaProductId = async (productId, updates) => {
    const { error } = await supabase
        .from("product_variants")
        .update(updates)
        .eq("product_id", productId)
    
    if (error) throw error
}

