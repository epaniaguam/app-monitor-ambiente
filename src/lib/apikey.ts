import crypto from 'crypto';

// Generar API Key única y segura
export function generateApiKey(): string {
  // Genera 32 bytes aleatorios y los convierte a hexadecimal
  return crypto.randomBytes(32).toString('hex');
}
