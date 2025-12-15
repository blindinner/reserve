import crypto from "crypto"

/**
 * Generate SHA256 signature for Allpay API requests
 * Based on Allpay's canonical signature algorithm
 * 
 * This implementation follows the exact steps:
 * 1. Remove sign parameter
 * 2. Exclude parameters with empty values
 * 3. Sort keys alphabetically
 * 4. Join parameter values with colon separator
 * 5. Append API key with colon
 * 6. Apply SHA256
 */
export function generateAllpaySignature(params: Record<string, any>, apiKey: string): string {
  // Step 1: Remove sign parameter (if present)
  const paramsWithoutSign = { ...params }
  delete paramsWithoutSign.sign

  // Step 2 & 3: Exclude empty values and sort keys alphabetically
  const sortedKeys = Object.keys(paramsWithoutSign).sort()

  const chunks: string[] = []

  sortedKeys.forEach((key) => {
    const value = paramsWithoutSign[key]

    // Handle array items (like the 'items' array)
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (typeof item === "object" && item !== null) {
          // Sort item keys alphabetically
          const sortedItemKeys = Object.keys(item).sort()
          sortedItemKeys.forEach((name) => {
            const val = item[name]
            // Only include non-empty string values (as per Allpay spec)
            if (typeof val === "string" && val.trim() !== "") {
              chunks.push(val)
            }
          })
        }
      })
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      // Handle object parameters (like 'subscription' object)
      const sortedObjectKeys = Object.keys(value).sort()
      sortedObjectKeys.forEach((objKey) => {
        const objVal = value[objKey]
        // Only include non-empty string values
        if (typeof objVal === "string" && objVal.trim() !== "") {
          chunks.push(objVal)
        }
      })
    } else {
      // Handle non-array, non-object parameters
      // Convert all values to strings for signature calculation
      // Exclude empty strings and the 'sign' parameter
      let stringValue: string
      if (value === null || value === undefined) {
        // Skip null/undefined values
        return
      } else if (typeof value === "boolean") {
        stringValue = value ? "1" : "0"
      } else if (typeof value === "number") {
        stringValue = value.toString()
      } else {
        stringValue = String(value)
      }
      
      if (key !== "sign" && stringValue.trim() !== "") {
        chunks.push(stringValue)
      }
    }
  })

  // Step 4: Join values with colon separator
  // Step 5: Append API key with colon
  const signatureString = chunks.join(":") + ":" + apiKey

  // Debug logging (safe - no sensitive data exposed)
  if (process.env.NODE_ENV === "development") {
    console.log("Signature generation debug:")
    console.log("  Sorted keys:", sortedKeys)
    console.log("  Chunks (values):", chunks)
    console.log("  Signature string (without key):", chunks.join(":"))
    // DO NOT log signatureString or API key in production
  }

  // Step 6: Apply SHA256
  return crypto.createHash("sha256").update(signatureString).digest("hex")
}

/**
 * Format price for Allpay (must be rounded to 2 decimal places)
 */
export function formatPrice(price: number): string {
  return price.toFixed(2)
}

