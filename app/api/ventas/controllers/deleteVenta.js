import { connectDB } from "@/libs/mongodb";
import Venta from "@/models/Venta";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function deleteVenta(request) {
    try {
        await connectDB();

        // Obtener los datos del body
        const data = await request.json();

        // Obtener ID de la venta del body
        const ventaId = data.id;
        if (!ventaId || !mongoose.Types.ObjectId.isValid(ventaId)) {
            return NextResponse.json({
                status: 400,
                error: {
                    message: "ID de venta no proporcionado o no es válido",
                    timestamp: new Date().toISOString(),
                },
                metadata: {
                    success: false
                }
            }, { status: 400 });
        }

        // Verificar si la venta existe
        const ventaExistente = await Venta.findById(ventaId);
        if (!ventaExistente) {
            return NextResponse.json({
                status: 404,
                error: {
                    message: "Venta no encontrada",
                    timestamp: new Date().toISOString(),
                },
                metadata: {
                    success: false
                }
            }, { status: 404 });
        }

        // Eliminar la venta
        await Venta.findByIdAndDelete(ventaId);

        // Estructurar la respuesta exitosa
        return NextResponse.json({
            status: 200,
            metadata: {
                success: true,
                timestamp: new Date().toISOString(),
            },
            data: {
                message: "Venta eliminada exitosamente"
            }
        }, { status: 200 });

    } catch (error) {
        console.error('Error in DELETE /api/venta:', error);

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