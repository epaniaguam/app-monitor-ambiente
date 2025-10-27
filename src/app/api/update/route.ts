import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// POST - Endpoint para ESP32 (compatible con ThingSpeak)
export async function POST(request: NextRequest) {
  try {
    // Verificar Content-Type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/x-www-form-urlencoded')) {
      return new NextResponse('0', { status: 400 });
    }

    // Parsear el body como form-urlencoded
    const body = await request.text();
    const params = new URLSearchParams(body);

    // Extraer API key y campos
    const apiKey = params.get('api_key');
    const field1 = params.get('field1'); // Temperatura
    const field2 = params.get('field2'); // Humedad ambiente
    const field3 = params.get('field3'); // Humedad del suelo
    const field4 = params.get('field4'); // Índice UV (radiación)

    // Verificar API key
    if (!apiKey) {
      return new NextResponse('0', { status: 401 });
    }

    // Buscar usuario por API key
    const user = await prisma.user.findUnique({
      where: { apiKey },
      select: { id: true },
    });

    if (!user) {
      return new NextResponse('0', { status: 401 });
    }

    // Validar que al menos un campo tenga datos
    if (!field1 && !field2 && !field3 && !field4) {
      return new NextResponse('0', { status: 400 });
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
        tempAmb: field1 ? parseFloat(field1) : null,
        humAmb: field2 ? parseFloat(field2) : null,
        humSuelo: field3 ? parseFloat(field3) : null,
        radiacion: field4 ? parseFloat(field4) : null,
        userId: user.id,
      },
    });

    // Devolver el counter como número (compatible con ESP32)
    return new NextResponse(environmentalData.counter.toString(), {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });

  } catch (error) {
    console.error('Error procesando datos del ESP32:', error);
    return new NextResponse('0', { status: 500 });
  }
}
