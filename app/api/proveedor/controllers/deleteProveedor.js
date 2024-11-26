import { connectDB } from "@/libs/mongodb";
import Proveedor from "@/models/Proveedor";
import { NextResponse } from "next/server";

export async function deleteProveedor(request) {
    try {
        await connectDB();

        // Obtener los datos del body
        const data = await request.json();

        // Obtener ID del proveedor del body
        const proveedorId = data.id;
        if (!proveedorId) {
            return NextResponse.json({
                status: 400,
                error: {
                    message: "ID de proveedor no proporcionado",
                    timestamp: new Date().toISOString(),
                },
                metadata: {
                    success: false
                }
            }, { status: 400 });
        }

        // Verificar si el proveedor existe
        const proveedorExistente = await Proveedor.findById(proveedorId);
        if (!proveedorExistente) {
            return NextResponse.json({
                status: 404,
                error: {
                    message: "Proveedor no encontrado",
                    timestamp: new Date().toISOString(),
                },
                metadata: {
                    success: false
                }
            }, { status: 404 });
        }

        // Eliminar el proveedor
        await Proveedor.findByIdAndDelete(proveedorId);

        // Estructurar la respuesta exitosa
        return NextResponse.json({
            status: 200,
            metadata: {
                success: true,
                timestamp: new Date().toISOString(),
            },
            data: {
                message: "Proveedor eliminado exitosamente"
            }
        }, { status: 200 });

    } catch (error) {
        console.error('Error in DELETE /api/proveedor:', error);

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