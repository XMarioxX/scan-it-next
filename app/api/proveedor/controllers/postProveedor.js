import { connectDB } from "@/libs/mongodb";
import Proveedor from "@/models/Proveedor";
import { NextResponse } from "next/server";

export async function postProveedor(request) {
    try {
        const startTime = Date.now();
        await connectDB();

        // Obtener los datos del body
        const data = await request.json();

        // Validación básica
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
                    success: false,
                    receivedData: data
                }
            }, { status: 400 });
        }

        // Verificar si el email ya existe
        const existingProveedor = await Proveedor.findOne({ email: data.email });
        if (existingProveedor) {
            return NextResponse.json({
                status: 409,
                error: {
                    message: "Ya existe un proveedor con este email",
                    timestamp: new Date().toISOString(),
                },
                metadata: {
                    success: false,
                    conflictingField: 'email'
                }
            }, { status: 409 });
        }

        // Crear el nuevo proveedor
        const nuevoProveedor = new Proveedor(data);
        await nuevoProveedor.save();

        // Calcular tiempo de respuesta
        const responseTime = Date.now() - startTime;

        // Estructurar la respuesta exitosa
        const response = {
            status: 201,
            metadata: {
                success: true,
                responseTimeMs: responseTime,
                timestamp: new Date().toISOString(),
            },
            data: {
                message: "Proveedor creado exitosamente",
                proveedor: nuevoProveedor
            }
        };

        return NextResponse.json(response, {
            status: 201,
            headers: {
                'X-Response-Time': responseTime.toString(),
                'Location': `/api/proveedor/${nuevoProveedor._id}`
            }
        });

    } catch (error) {
        console.error('Error in POST /api/proveedor:', error);

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