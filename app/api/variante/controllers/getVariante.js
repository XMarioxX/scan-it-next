import { connectDB } from "@/libs/mongodb";
import Variante from "@/models/Variante";
import Proveedor from "@/models/Proveedor";
import Calzado from "@/models/Calzado"; // Importar el modelo Calzado
import { NextResponse } from "next/server";

export async function getVariante(request) {
    try {
        const startTime = Date.now();
        await connectDB();

        // Obtener el path de la request
        const path = request.nextUrl?.pathname || 'No path available';

        // Obtener las variantes y estadísticas
        const variantes = await Variante.find().populate('calzado_id');
        const totalVariantes = await Variante.countDocuments();

        // Obtener estadísticas adicionales
        const stats = {
            variantesActivas: await Variante.countDocuments({ stock_actual: { $gt: 0 } }),
            variantesInactivas: await Variante.countDocuments({ stock_actual: { $lte: 0 } }),
            ultimaActualizacion: new Date().toISOString(),
        };

        // Calcular el tiempo de respuesta
        const responseTime = Date.now() - startTime;

        // Estructurar la respuesta
        const response = {
            status: 200,
            path,
            metadata: {
                total: totalVariantes,
                responseTimeMs: responseTime,
                timestamp: new Date().toISOString(),
            },
            stats,
            data: variantes,
        };

        return NextResponse.json(response, { 
            status: 200,
            headers: {
                'X-Response-Time': responseTime.toString(),
                'X-Total-Count': totalVariantes.toString(),
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