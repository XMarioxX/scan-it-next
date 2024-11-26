import { connectDB } from "@/libs/mongodb";
import Calzado from "@/models/Calzado";
import { NextResponse } from "next/server";

export async function deleteCalzado(request) {
    try {
        await connectDB();

        // Obtener los datos del body
        const data = await request.json();

        // Obtener ID del calzado del body
        const calzadoId = data.id;
        if (!calzadoId) {
            return NextResponse.json({
                status: 400,
                error: {
                    message: "ID de calzado no proporcionado",
                    timestamp: new Date().toISOString(),
                },
                metadata: {
                    success: false
                }
            }, { status: 400 });
        }

        // Verificar si el calzado existe
        const calzadoExistente = await Calzado.findById(calzadoId);
        if (!calzadoExistente) {
            return NextResponse.json({
                status: 404,
                error: {
                    message: "Calzado no encontrado",
                    timestamp: new Date().toISOString(),
                },
                metadata: {
                    success: false
                }
            }, { status: 404 });
        }

        // Eliminar el calzado
        await Calzado.findByIdAndDelete(calzadoId);

        // Estructurar la respuesta exitosa
        return NextResponse.json({
            status: 200,
            metadata: {
                success: true,
                timestamp: new Date().toISOString(),
            },
            data: {
                message: "Calzado eliminado exitosamente"
            }
        }, { status: 200 });

    } catch (error) {
        console.error('Error in DELETE /api/calzado:', error);

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