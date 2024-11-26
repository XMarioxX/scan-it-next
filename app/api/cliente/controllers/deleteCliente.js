import { connectDB } from "@/libs/mongodb";
import Cliente from "@/models/Cliente";
import { NextResponse } from "next/server";

export async function deleteCalzado(request) {
    try {
        await connectDB();

        // Obtener los datos del body
        const data = await request.json();

        // Obtener ID del cliente del body
        const clienteId = data.id;
        if (!clienteId) {
            return NextResponse.json({
                status: 400,
                error: {
                    message: "ID de cliente no proporcionado",
                    timestamp: new Date().toISOString(),
                },
                metadata: {
                    success: false
                }
            }, { status: 400 });
        }

        // Verificar si el cliente existe
        const clienteExistente = await Cliente.findById(clienteId);
        if (!clienteExistente) {
            return NextResponse.json({
                status: 404,
                error: {
                    message: "Cliente no encontrado",
                    timestamp: new Date().toISOString(),
                },
                metadata: {
                    success: false
                }
            }, { status: 404 });
        }

        // Eliminar el cliente
        await Cliente.findByIdAndDelete(clienteId);

        // Estructurar la respuesta exitosa
        return NextResponse.json({
            status: 200,
            metadata: {
                success: true,
                timestamp: new Date().toISOString(),
            },
            data: {
                message: "Cliente eliminado exitosamente"
            }
        }, { status: 200 });

    } catch (error) {
        console.error('Error in DELETE /api/cliente:', error);

        // Para otros tipos de errores
        return NextResponse.json({
            status: 500,
            error: {
                message: error.message,
                timestamp: new Date().toISOString(),
                type: error.name,
            },
            metadata: {
                success: false,
            }
        }, { status: 500 });
    }
}