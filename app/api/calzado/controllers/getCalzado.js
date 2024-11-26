import { connectDB } from "@/libs/mongodb";
import Calzado from "@/models/Calzado";
import { NextResponse } from "next/server";

export async function getCalzado(request) {
    try {
        const startTime = Date.now();
        await connectDB();

        // Obtener el path de la request
        const path = request.nextUrl?.pathname || 'No path available';

        // Obtener los calzados y estadísticas
        const calzados = await Calzado.find();
        const totalCalzados = await Calzado.countDocuments();
        
        // Obtener estadísticas adicionales
        const stats = {
            calzadosDisponibles: await Calzado.countDocuments({ estado: 'disponible' }),
            calzadosAgotados: await Calzado.countDocuments({ estado: 'agotado' }),
            ultimaActualizacion: new Date().toISOString(),
        };

        // Calcular el tiempo de respuesta
        const responseTime = Date.now() - startTime;

        // Estructurar la respuesta
        const response = {
            status: 200,
            path,
            metadata: {
                total: totalCalzados,
                responseTimeMs: responseTime,
                timestamp: new Date().toISOString(),
            },
            stats,
            data: calzados,
        };

        return NextResponse.json(response, { 
            status: 200,
            headers: {
                'X-Response-Time': responseTime.toString(),
                'X-Total-Count': totalCalzados.toString(),
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