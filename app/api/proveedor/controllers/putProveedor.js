import { connectDB } from "@/libs/mongodb";
import Proveedor from "@/models/Proveedor";
import { NextResponse } from "next/server";

export async function putProveedor(request) {
    try {
        const startTime = Date.now();
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

        // Validar campos requeridos
        const requiredFields = ['nombre', 'rfc', 'direccion', 'telefonos', 'email', 'historial_compras'];
        const missingFields = requiredFields.filter(field => !data[field]);
        if (missingFields.length > 0) {
            return NextResponse.json({
                status: 400,
                error: {
                    message: `Faltan los siguientes campos requeridos: ${missingFields.join(', ')}`,
                    timestamp: new Date().toISOString(),
                },
                metadata: {
                    success: false
                }
            }, { status: 400 });
        }

        // Actualizar los datos del proveedor
        Object.assign(proveedorExistente, data);
        await proveedorExistente.save();

        // Calcular tiempo de respuesta
        const responseTime = Date.now() - startTime;

        // Estructurar la respuesta exitosa
        const response = {
            status: 200,
            metadata: {
                success: true,
                responseTimeMs: responseTime,
                timestamp: new Date().toISOString(),
            },
            data: {
                message: "Proveedor actualizado exitosamente",
                proveedor: proveedorExistente
            }
        };

        return NextResponse.json(response, {
            status: 200,
            headers: {
                'X-Response-Time': responseTime.toString()
            }
        });

    } catch (error) {
        console.error('Error in PUT /api/proveedor:', error);

        // Si es un error de validación de Mongoose
        if (error.name === 'ValidationError') {
            return NextResponse.json({
                status: 400,
                error: {
                    message: "Error de validación",
                    details: Object.values(error.errors).map(err => err.message),
                    timestamp: new Date().toISOString(),
                },
                metadata: {
                    success: false,
                    errorType: 'ValidationError'
                }
            }, { status: 400 });
        }

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