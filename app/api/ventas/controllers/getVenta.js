import { connectDB } from "@/libs/mongodb";
import Ventas from "@/models/Venta";
import { NextResponse } from "next/server";

export async function getVentas(request) {
    try {
        const startTime = Date.now();
        await connectDB();

        // Obtener el path de la request
        const path = request.nextUrl?.pathname || 'No path available';

        // Obtener las ventas y estadísticas
        const ventas = await Ventas.find().populate('items.variante_id');
        const totalVentas = await Ventas.countDocuments();
        
        // Obtener estadísticas adicionales
        const stats = {
            ventasTotales: totalVentas,
            ultimaActualizacion: new Date().toISOString(),
        };

        // Calcular el tiempo de respuesta
        const responseTime = Date.now() - startTime;

        // Estructurar la respuesta
        const response = {
            status: 200,
            path,
            metadata: {
                total: totalVentas,
                responseTimeMs: responseTime,
                timestamp: new Date().toISOString(),
            },
            stats,
            data: ventas,
        };

        return NextResponse.json(response, { 
            status: 200,
            headers: {
                'X-Response-Time': responseTime.toString(),
                'X-Total-Count': totalVentas.toString(),
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