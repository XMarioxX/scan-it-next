import { connectDB } from "@/libs/mongodb";
import Cliente from "@/models/Cliente";
import { NextResponse } from "next/server";

export async function getCalzado(request) {
    try {
        const startTime = Date.now();
        await connectDB();

        // Obtener el path de la request
        const path = request.nextUrl?.pathname || 'No path available';

        // Obtener los clientes y estadísticas
        const clientes = await Cliente.find();
        const totalClientes = await Cliente.countDocuments();
        
        // Obtener estadísticas adicionales
        const stats = {
            clientesActivos: await Cliente.countDocuments({ activo: true }),
            clientesInactivos: await Cliente.countDocuments({ activo: false }),
            ultimaActualizacion: new Date().toISOString(),
        };

        // Calcular el tiempo de respuesta
        const responseTime = Date.now() - startTime;

        // Estructurar la respuesta
        const response = {
            status: 200,
            path,
            metadata: {
                total: totalClientes,
                responseTimeMs: responseTime,
                timestamp: new Date().toISOString(),
            },
            stats,
            data: clientes,
        };

        return NextResponse.json(response, { 
            status: 200,
            headers: {
                'X-Response-Time': responseTime.toString(),
                'X-Total-Count': totalClientes.toString(),
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