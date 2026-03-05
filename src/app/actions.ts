'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth, signIn } from '@/auth'
import bcrypt from 'bcryptjs'

export async function addTransaction(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) return { error: 'No autorizado' }

    const tipo = formData.get('tipo') as string
    const montoStr = formData.get('monto') as string
    const descripcion = formData.get('descripcion') as string
    const categoriaIdStr = formData.get('categoriaId') as string

    if (!tipo || !montoStr) return { error: 'Campos requeridos' }

    const monto = parseFloat(montoStr)
    const categoriaId = categoriaIdStr ? parseInt(categoriaIdStr) : null

    await prisma.transacciones.create({
        data: {
            tipo,
            monto,
            descripcion,
            userId: parseInt(session.user.id),
            categoria_id: categoriaId
        }
    })

    revalidatePath('/')
}

export async function updateTransaction(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) return { error: 'No autorizado' }

    const id = parseInt(formData.get('id') as string)
    const tipo = formData.get('tipo') as string
    const montoStr = formData.get('monto') as string
    const descripcion = formData.get('descripcion') as string
    const categoriaIdStr = formData.get('categoriaId') as string

    if (!id || !tipo || !montoStr) return { error: 'Campos requeridos' }

    const monto = parseFloat(montoStr)
    const categoriaId = categoriaIdStr ? parseInt(categoriaIdStr) : null

    await prisma.transacciones.update({
        where: { id, userId: parseInt(session.user.id) },
        data: {
            tipo,
            monto,
            descripcion,
            categoria_id: categoriaId
        }
    })

    revalidatePath('/')
}

export async function deleteTransaction(id: number) {
    const session = await auth()
    if (!session?.user?.id) return { error: 'No autorizado' }

    await prisma.transacciones.delete({
        where: { id, userId: parseInt(session.user.id) }
    })

    revalidatePath('/')
}

export async function addCategoria(nombre: string) {
    const session = await auth()
    if (!session?.user?.id) return { error: 'No autorizado' }

    if (!nombre.trim()) return { error: 'El nombre es obligatorio' }

    try {
        await prisma.categoria.create({
            data: {
                nombre: nombre.trim(),
                userId: parseInt(session.user.id)
            }
        })
        revalidatePath('/')
        return { success: true }
    } catch (err: any) {
        if (err.code === 'P2002') return { error: 'La categoría ya existe' }
        return { error: 'Error al crear la categoría' }
    }
}

export async function deleteCategoria(id: number) {
    const session = await auth()
    if (!session?.user?.id) return { error: 'No autorizado' }

    try {
        await prisma.categoria.delete({
            where: {
                id,
                userId: parseInt(session.user.id)
            }
        })
        revalidatePath('/')
        return { success: true }
    } catch (err) {
        return { error: 'No se puede eliminar una categoría con movimientos' }
    }
}

export async function getCategorias() {
    const session = await auth()
    if (!session?.user?.id) return []

    return await prisma.categoria.findMany({
        where: { userId: parseInt(session.user.id) },
        orderBy: { nombre: 'asc' }
    })
}

import { sendVerificationEmail, sendPasswordResetEmail } from '@/lib/mail'

// Helper para generar código de 6 dígitos
function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function registerUser(formData: FormData) {
    const nombre = formData.get('nombre') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) return { error: 'Email y contraseña requeridos' }

    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) return { error: 'El email ya está registrado' }

        // Crear usuario sin verificar
        await prisma.user.create({
            data: {
                nombre,
                email,
                password: hashedPassword,
            },
        })

        // Generar token de verificación
        const token = generateCode()
        const expires = new Date(new Date().getTime() + 3600 * 1000) // 1 hora

        await prisma.verificationToken.create({
            data: {
                email,
                token,
                expires,
            }
        })

        // Enviar correo
        await sendVerificationEmail(email, token)

        return { success: true, redirectTo: `/verify-email?email=${encodeURIComponent(email)}` }
    } catch (err: any) {
        console.error('Error in registerUser:', err)
        return { error: 'Error al registrar el usuario' }
    }
}

export async function verifyEmailCode(email: string, token: string) {
    try {
        const storedToken = await prisma.verificationToken.findFirst({
            where: { email, token }
        })

        if (!storedToken || new Date() > storedToken.expires) {
            return { error: 'Código inválido o expirado' }
        }

        await prisma.user.update({
            where: { email },
            data: { emailVerified: new Date() }
        })

        await prisma.verificationToken.delete({
            where: { id: storedToken.id }
        })

        return { success: true }
    } catch (error) {
        return { error: 'Error al verificar el código' }
    }
}

export async function requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return { error: 'Si el correo existe, recibirás un código' }

    const token = generateCode()
    const expires = new Date(new Date().getTime() + 3600 * 1000)

    await prisma.passwordResetToken.create({
        data: { email, token, expires }
    })

    await sendPasswordResetEmail(email, token)
    return { success: true }
}

export async function resetPassword(email: string, token: string, newPassword: string) {
    try {
        const storedToken = await prisma.passwordResetToken.findFirst({
            where: { email, token }
        })

        if (!storedToken || new Date() > storedToken.expires) {
            return { error: 'Código inválido o expirado' }
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        })

        await prisma.passwordResetToken.delete({
            where: { id: storedToken.id }
        })

        return { success: true }
    } catch (error) {
        return { error: 'Error al restablecer la contraseña' }
    }
}
