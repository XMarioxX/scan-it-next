import { connectDB } from "@/libs/mongodb";
import Apartado from "@/models/Apartado";
import { NextResponse } from "next/server";

export async function getApartado(request) {
    try {
        const startTime = Date.now();
        await connectDB();

        // Obtener el path de la request
        const path = request.nextUrl?.pathname || 'No path available';

        // Obtener los apartados y estadísticas
        const apartados = await Apartado.find().populate('cliente').populate('items.variante_id');
        const totalApartados = await Apartado.countDocuments();

        // Obtener estadísticas adicionales
        const stats = {
            apartadosActivos: await Apartado.countDocuments({ estado: 'activo' }),
            apartadosVencidos: await Apartado.countDocuments({ estado: 'vencido' }),
            ultimaActualizacion: new Date().toISOString(),
        };

        // Calcular el tiempo de respuesta
        const responseTime = Date.now() - startTime;

        // Estructurar la respuesta
        const response = {
            status: 200,
            path,
            metadata: {
                total: totalApartados,
                responseTimeMs: responseTime,
                timestamp: new Date().toISOString(),
            },
            stats,
            data: apartados,
        };

        return NextResponse.json(response, { 
            status: 200,
            headers: {
                'X-Response-Time': responseTime.toString(),
                'X-Total-Count': totalApartados.toString(),
            }
        });

    } catch (error) {
        const errorResponse = {
            status: 500,
            path: request.nextUrl?.pathname || 'No path available',
            error: {
                message: error.message,
                timestamp: new Date().toISOString(),
                type: error.name,
            },
            metadata: {
                success: false,
            }
        };

        return NextResponse.json(errorResponse, { 
            status: 500,
            headers: {
                'X-Error-Type': error.name,
            }
        });
    }
}