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

    try {
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
        return { success: true }
    } catch (error) {
        console.error('Error adding transaction:', error)
        return { error: 'Error al crear el movimiento en el servidor' }
    }
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

    try {
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
        return { success: true }
    } catch (error) {
        console.error('Error updating transaction:', error)
        return { error: 'Error al actualizar el movimiento en el servidor' }
    }
}

export async function deleteTransaction(id: number) {
    const session = await auth()
    if (!session?.user?.id) return { error: 'No autorizado' }

    try {
        await prisma.transacciones.delete({
            where: { id, userId: parseInt(session.user.id) }
        })

        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('Error deleting transaction:', error)
        return { error: 'Error al eliminar el movimiento en el servidor' }
    }
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

export async function registerUser(formData: FormData) {
    const nombre = formData.get('nombre') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) return { error: 'Email y contraseña requeridos' }

    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        await prisma.user.create({
            data: {
                nombre,
                email,
                password: hashedPassword,
            },
        })
    } catch (err: any) {
        console.error('Error creating user in registerUser:', err)
        if (err.code === 'P2002') return { error: 'El email ya existe' }
        return { error: 'Error al registrar el usuario en la base de datos' }
    }

    try {
        await signIn("credentials", {
            email,
            password,
            redirect: false
        });
        return { success: true }
    } catch (err: any) {
        console.error('Error in signIn during registration:', err)
        // In Auth.js v5, signIn can throw a redirect. We should check if it's a redirect or an actual error.
        if (err.message === 'NEXT_REDIRECT') {
            throw err;
        }
        return { error: 'Usuario creado pero no se pudo iniciar sesión automáticamente' }
    }
}

