import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verifyToken } from '../../../../lib/auth';
import { generateApiKey } from '../../../../lib/apikey';

// POST - Generar o regenerar API Key para el usuario autenticado
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Generar nueva API Key única
    let apiKey: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    // Reintentar hasta obtener una API Key única (muy improbable que se repita)
    while (!isUnique && attempts < maxAttempts) {
      apiKey = generateApiKey();

      // Verificar que no exista en la base de datos
      const existingUser = await prisma.user.findUnique({
        where: { apiKey },
      });

      if (!existingUser) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return NextResponse.json({ error: 'Error generando API Key única' }, { status: 500 });
    }

    // Actualizar el usuario con la nueva API Key
    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: { apiKey: apiKey! },
      select: {
        id: true,
        email: true,
        apiKey: true,
      },
    });

    return NextResponse.json({
      message: 'API Key generada exitosamente',
      apiKey: updatedUser.apiKey,
    });

  } catch (error) {
    console.error('Error generando API Key:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
