import { connectDB } from "@/libs/mongodb";
import Proveedor from "@/models/Proveedor";
import { NextResponse } from "next/server";

export async function getProveedor(request) {
    try {
        const startTime = Date.now();
        await connectDB();

        // Obtener el path de la request
        const path = request.nextUrl?.pathname || 'No path available';

        // Obtener los proveedores y estadísticas
        const proveedores = await Proveedor.find();
        const totalProveedores = await Proveedor.countDocuments();
        
        // Obtener estadísticas adicionales
        const stats = {
            proveedoresActivos: await Proveedor.countDocuments({ activo: true }),
            proveedoresInactivos: await Proveedor.countDocuments({ activo: false }),
            ultimaActualizacion: new Date().toISOString(),
        };

        // Calcular el tiempo de respuesta
        const responseTime = Date.now() - startTime;

        // Estructurar la respuesta
        const response = {
            status: 200,
            path,
            metadata: {
                total: totalProveedores,
                responseTimeMs: responseTime,
                timestamp: new Date().toISOString(),
            },
            stats,
            data: proveedores,
        };

        return NextResponse.json(response, { 
            status: 200,
            headers: {
                'X-Response-Time': responseTime.toString(),
                'X-Total-Count': totalProveedores.toString(),
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