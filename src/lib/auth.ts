import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

// Función helper para verificar token JWT y extraer userId
export function verifyToken(request: NextRequest): { userId: string; email: string } | null {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.AUTH_SECRET!) as { userId: string; email: string };
    return decoded;
  } catch (error) {
    console.error('Error verificando token:', error);
    return null;
  }
}
