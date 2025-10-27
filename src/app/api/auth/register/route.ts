import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../../lib/prisma';

export async function POST(request: NextRequest) {
  // Desactivar registro de nuevos usuarios
  return NextResponse.json({ error: 'Registro desactivado' }, { status: 403 });

  /* CODIGO ORIGINAL - Descomentar para reactivar registro
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y password son requeridos' }, { status: 400 });
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Usuario ya existe' }, { status: 400 });
    }

    // Hashear password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    // Generar JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.AUTH_SECRET!,
      { expiresIn: '7d' }
    );

    return NextResponse.json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
  */
}