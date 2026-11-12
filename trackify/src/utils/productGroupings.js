// utils/productGrouping.js

export const groupVariantsByProduct = (flatVariants) => {
  const groups = {}

  flatVariants.forEach((variant) => {
    const productId = variant.product_id

    if (!groups[productId]) {
      groups[productId] = {
        id: productId,
        name: variant.products.name,
        category: variant.products.category,
        base_unit: variant.products.base_unit,
        cost_per_base_unit: variant.products.cost_per_base_unit,
        image_url: variant.image_url,
        variants: [],
      }
    }

    groups[productId].variants.push({
      id: variant.id,
      name: variant.name,
      units_per_variant: variant.units_per_variant,
      sell_price: variant.sell_price,
      image_url: variant.image_url,
    })
  })

  return Object.values(groups)
}