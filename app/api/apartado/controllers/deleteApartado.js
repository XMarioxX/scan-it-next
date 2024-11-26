import { connectDB } from "@/libs/mongodb";
import Apartado from "@/models/Apartado";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function deleteApartado(request) {
    try {
        await connectDB();

        // Obtener los datos del body
        const data = await request.json();

        // Obtener ID del apartado del body
        const apartadoId = data.id;
        if (!apartadoId || !mongoose.Types.ObjectId.isValid(apartadoId)) {
            return NextResponse.json({
                status: 400,
                error: {
                    message: "ID de apartado no proporcionado o no es válido",
                    timestamp: new Date().toISOString(),
                },
                metadata: {
                    success: false
                }
            }, { status: 400 });
        }

        // Verificar si el apartado existe
        const apartadoExistente = await Apartado.findById(apartadoId);
        if (!apartadoExistente) {
            return NextResponse.json({
                status: 404,
                error: {
                    message: "Apartado no encontrado",
                    timestamp: new Date().toISOString(),
                },
                metadata: {
                    success: false
                }
            }, { status: 404 });
        }

        // Eliminar el apartado
        await Apartado.findByIdAndDelete(apartadoId);

        // Estructurar la respuesta exitosa
        return NextResponse.json({
            status: 200,
            metadata: {
                success: true,
                timestamp: new Date().toISOString(),
            },
            data: {
                message: "Apartado eliminado exitosamente"
            }
        }, { status: 200 });

    } catch (error) {
        console.error('Error in DELETE /api/apartado:', error);

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