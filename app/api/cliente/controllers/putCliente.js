import { connectDB } from "@/libs/mongodb";
import Cliente from "@/models/Cliente";
import { NextResponse } from "next/server";

export async function putCalzado(request) {
    try {
        const startTime = Date.now();
        await connectDB();

        // Obtener los datos del body
        const data = await request.json();

        // Obtener ID del cliente del body
        const clienteId = data.id;
        if (!clienteId) {
            return NextResponse.json({
                status: 400,
                error: {
                    message: "ID de cliente no proporcionado",
                    timestamp: new Date().toISOString(),
                },
                metadata: {
                    success: false
                }
            }, { status: 400 });
        }

        // Verificar si el cliente existe
        const clienteExistente = await Cliente.findById(clienteId);
        if (!clienteExistente) {
            return NextResponse.json({
                status: 404,
                error: {
                    message: "Cliente no encontrado",
                    timestamp: new Date().toISOString(),
                },
                metadata: {
                    success: false
                }
            }, { status: 404 });
        }

        // Validar campos requeridos
        const requiredFields = ['email', 'telefono', 'direccion', 'genero'];
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

        // Validar campos de dirección
        const requiredAddressFields = ['calle', 'numero', 'colonia', 'ciudad', 'estado', 'codigoPostal'];
        const missingAddressFields = requiredAddressFields.filter(field => !data.direccion[field]);
        if (missingAddressFields.length > 0) {
            return NextResponse.json({
                status: 400,
                error: {
                    message: `Faltan los siguientes campos de dirección requeridos: ${missingAddressFields.join(', ')}`,
                    timestamp: new Date().toISOString(),
                },
                metadata: {
                    success: false
                }
            }, { status: 400 });
        }

        // Actualizar los datos del cliente
        Object.assign(clienteExistente, data);
        await clienteExistente.save();

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
                message: "Cliente actualizado exitosamente",
                cliente: clienteExistente
            }
        };

        return NextResponse.json(response, {
            status: 200,
            headers: {
                'X-Response-Time': responseTime.toString()
            }
        });

    } catch (error) {
        console.error('Error in PUT /api/cliente:', error);

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