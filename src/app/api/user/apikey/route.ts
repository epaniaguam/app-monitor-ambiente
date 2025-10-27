import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verifyToken } from '../../../../lib/auth';

// GET - Obtener la API Key del usuario autenticado
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener API Key del usuario
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { apiKey: true },
    });

    return NextResponse.json({
      apiKey: userData?.apiKey || null,
    });

  } catch (error) {
    console.error('Error obteniendo API Key:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
