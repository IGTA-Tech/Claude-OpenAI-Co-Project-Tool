// Simple encryption for API keys
// In production, consider using a more robust encryption library
// or storing keys in a secure vault like AWS Secrets Manager

const ENCRYPTION_KEY = process.env.ENCRYPTION_SECRET || 'default-secret-change-this'

export function encryptApiKey(apiKey: string): string {
  // For demo purposes, we're using base64 encoding
  // In production, use proper encryption like AES-256
  const buffer = Buffer.from(apiKey, 'utf8')
  return buffer.toString('base64')
}

export function decryptApiKey(encryptedKey: string): string {
  // For demo purposes, we're using base64 decoding
  // In production, use proper decryption
  const buffer = Buffer.from(encryptedKey, 'base64')
  return buffer.toString('utf8')
}

// Validate API key format
export function validateOpenAIKey(key: string): boolean {
  return key.startsWith('sk-') && key.length > 20
}

export function validateAnthropicKey(key: string): boolean {
  return key.startsWith('sk-ant-') && key.length > 20
}

export function validateApiKey(provider: string, key: string): boolean {
  switch (provider) {
    case 'openai':
    case 'dalle':
      return validateOpenAIKey(key)
    case 'anthropic':
      return validateAnthropicKey(key)
    case 'runwayml':
      return key.length > 10 // Basic validation
    default:
      return false
  }
}
