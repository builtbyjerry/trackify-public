import { errorLog, log } from "../utils/loggers.js";
import { supabase } from "./supabase.js";

const VALID_EXTENSIONS = { 
    jpg: 'jpeg', jpeg: 'jpeg', 
    png: 'png', webp: 'webp', gif: 'gif' 
}
const getExtension = (uri) => {
    const cleanUri = uri.split("?")[0];
    return cleanUri.split(".").pop()?.toLowerCase();
};

const uploadImageToStorage = async ({ imageUri, bucket, filePath, }) => {
    log('=== UPLOAD START ===')
    log('imageUri:', imageUri)
    log("Bucket name:", bucket)
    const response = await fetch(imageUri);
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);


    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, uint8Array, {
            contentType: "image/jpeg",
            upsert: true,
        });


    if (error) throw error;


    const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);


    return {
        filePath,
        publicUrl: urlData.publicUrl
    };
};

export const uploadProductImageToStorage = async (imageUri, productId) => {
    const fileExt = getExtension(imageUri)

    return await uploadImageToStorage({
        imageUri,
        bucket: "product-images",
        filePath: `products/${productId}/main.${fileExt}`
    });

};

export const uploadProfileImageToStorage = async (imageUri, userId) => {
    log('=== UPLOAD START ===')
    log('imageUri:', imageUri)
    log('userId:', userId)

    const response = await fetch(imageUri)
    log('fetch status:', response.status)
    log('fetch ok:', response.ok)

    const arrayBuffer = await response.arrayBuffer()
    log('arrayBuffer byteLength:', arrayBuffer.byteLength)

    const uint8Array = new Uint8Array(arrayBuffer)
    log('uint8Array length:', uint8Array.length)

    const rawExt = imageUri.split('.').pop()?.toLowerCase()
    const fileExt = VALID_EXTENSIONS[rawExt] ?? 'jpeg'
    const filePath = `profile/${userId}/avatar.${fileExt}`

    log('fileExt:', fileExt)
    log('filePath:', filePath)
    log('contentType:', `image/${fileExt}`)

    const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(filePath, uint8Array, {
            contentType: `image/${fileExt}`,
            upsert: true,
    })
    if (error) {
      errorLog('Upload failed:', error)
      errorLog('Error name:', error.name)
      errorLog('Error message:', error.message)
      throw error
    }

    log('upload data:', data)
    log('upload error:', error)
    log('=== UPLOAD END ===')

    // if (error) throw error
    log("Getting publicurl ")
    const { data: urlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath)

    return { filePath, publicUrl: urlData.publicUrl }
}

