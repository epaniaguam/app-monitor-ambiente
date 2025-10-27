import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { verifyToken } from '../../../lib/auth';

// POST - Insertar datos ambientales
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { tempAmb, humAmb, radiacion, humSuelo } = body;

    // Validar que al menos un dato esté presente
    if (tempAmb === undefined && humAmb === undefined && radiacion === undefined && humSuelo === undefined) {
      return NextResponse.json({ error: 'Debe proporcionar al menos un dato ambiental' }, { status: 400 });
    }

    // Obtener el último counter y sumar 1
    const lastRecord = await prisma.environmentalData.findFirst({
      orderBy: { counter: 'desc' },
      select: { counter: true },
    });
    const newCounter = (lastRecord?.counter || 0) + 1;

    // Crear registro en la base de datos
    const environmentalData = await prisma.environmentalData.create({
      data: {
        counter: newCounter,
        tempAmb: tempAmb !== undefined ? parseFloat(tempAmb) : null,
        humAmb: humAmb !== undefined ? parseFloat(humAmb) : null,
        radiacion: radiacion !== undefined ? parseFloat(radiacion) : null,
        humSuelo: humSuelo !== undefined ? parseFloat(humSuelo) : null,
        userId: user.userId,
      },
    });

    return NextResponse.json({
      message: 'Datos ambientales guardados exitosamente',
      data: environmentalData,
    }, { status: 201 });

  } catch (error) {
    console.error('Error guardando datos ambientales:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// GET - Obtener datos ambientales
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener parámetros de query (opcional: filtrar por fechas o límite)
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const userId = searchParams.get('userId'); // Opcional: filtrar por usuario específico

    // Construir filtros
    const where: { userId?: string } = {};
    if (userId) {
      where.userId = userId;
    }

    // Obtener datos de la base de datos
    const environmentalData = await prisma.environmentalData.findMany({
      where,
      orderBy: {
        timestamp: 'desc', // Más recientes primero
      },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Datos obtenidos exitosamente',
      count: environmentalData.length,
      data: environmentalData,
    });

  } catch (error) {
    console.error('Error obteniendo datos ambientales:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
