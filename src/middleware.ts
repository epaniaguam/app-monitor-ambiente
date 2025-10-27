import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Token requerido' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.AUTH_SECRET!) as { userId: string; email: string };
    // Agregar userId al request para uso en rutas
    request.headers.set('userId', decoded.userId);
    return NextResponse.next();
  } catch (error) {
    console.error('Error verificando token:', error);
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }
}

export const config = {
  matcher: ['/api/data/:path*'],
};