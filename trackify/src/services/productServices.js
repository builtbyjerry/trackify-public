import { fetchActiveProductVariants, fetchProductById, fetchProductVariants, fetchVariantById, updateProduct, updateProductVariant, updateVariants, updateVariantsViaProductId } from "../api/products.js";
import { uploadProductImageToStorage } from "../api/storage.js";
import { markProductsDirty } from "../store/productStore.js";
import { log } from "../utils/loggers.js";

export const getProducts = async () => {
    try {
        const products = await fetchProductVariants()
        return products
    } catch (error) {
        log("Error fetching product variants:", error.message)
        throw error
    }
}

export const getActiveProducts = async () => {
    try {
        const activeProducts = await fetchActiveProductVariants()
        return activeProducts
    } catch (error) {
        log("Error fetching active product variants:", error.message)
        throw error
    }
}

export const getProductById = async (prodId) => {
    try {
        return await fetchProductById(prodId)

    } catch (error) {
        log("Error fetching products by id:", error.message)
        throw error
    }
}

export const getVariantById = async (variantId) => {
    try {
        return await fetchVariantById(variantId)

    } catch (error) {
        log("Error fetching variants by id:", error.message)
        throw error
    }
}

export const deactivateProduct = async (id) => {
    try {
        await updateProduct(id, { is_active: false })
    } catch (error) {
        log("Error deactivating product:", error)
        throw error
    }
}

export const deactivateVariant = async (id) => {
    try {
        await updateVariants(id, { is_active: false })
    } catch (error) {
        log("Error deactivating product:", error)
    }
}

export const deactivateProductAndVariants = async (prodId) => {
    try {
        await updateProduct(prodId, { is_active: false })
        log("Updated product in (deactivateProductAndVariants)")
        await updateVariantsViaProductId(prodId, { is_active: false })
        log("Updated variants in (deactivateProductAndVariants)")
    } catch (error) {
        log("Error deactivating product:", error)
        throw error
    }
}

export const saveProductImage = async (variantId, uri) => {
    log(" === saveProductImage called ===", )

    const { filePath, publicUrl } = await uploadProductImageToStorage(uri, variantId)
    log("PublicUrl:", publicUrl)

    const { success } = await updateProductVariant(variantId, {
        image_url: publicUrl,
    })
    if (success) {
        log("Successful product image update")
        markProductsDirty()
    } else {
        log("Unsuccessful.. look at what's wrong")
    }

}