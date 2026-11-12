// shared helper — copy this into both edge functions
export async function hashPin(pin: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const keyMaterial = await crypto.subtle.importKey(
        "raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveBits"]
    )
    const hash = await crypto.subtle.deriveBits(
        { name: "PBKDF2", salt, iterations: 600000, hash: "SHA-256" },
        keyMaterial, 256
    )
    const combined = new Uint8Array(16 + 32)
    combined.set(salt, 0)
    combined.set(new Uint8Array(hash), 16)
    return btoa(String.fromCharCode(...combined))
}

export async function verifyPin(pin: string, storedHash: string): Promise<boolean> {
    const combined = Uint8Array.from(atob(storedHash), c => c.charCodeAt(0))
    const salt = combined.slice(0, 16)      // first 16 bytes = the salt we stored
    const original = combined.slice(16)     // rest = the actual hash

    const keyMaterial = await crypto.subtle.importKey(
        "raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveBits"]
    )
    const attempt = await crypto.subtle.deriveBits(
        { name: "PBKDF2", salt, iterations: 600000, hash: "SHA-256" },
        keyMaterial, 256
    )
    const a = new Uint8Array(attempt)
    if (a.length !== original.length) return false
    return a.every((byte, i) => byte === original[i]) 
}