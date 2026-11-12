let _isDirty = false

export const markProductsDirty = () => { _isDirty = true }
export const isProductsDirty = () => _isDirty
export const clearProductsDirty = () => { _isDirty = false }