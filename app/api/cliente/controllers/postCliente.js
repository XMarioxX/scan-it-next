import { connectDB } from "@/libs/mongodb";
import Cliente from "@/models/Cliente";
import { NextResponse } from "next/server";

export async function postCalzado(request) {
    try {
        const startTime = Date.now();
        await connectDB();

        // Obtener los datos del body
        const data = await request.json();

        // Validación básica
        if (!data.nombre || !data.email) {
            return NextResponse.json({
                status: 400,
                error: {
                    message: "Nombre y email son requeridos",
                    timestamp: new Date().toISOString(),
                },
                metadata: {
                    success: false,
                    receivedData: data
                }
            }, { status: 400 });
        }

        // Verificar si el email ya existe
        const existingCliente = await Cliente.findOne({ email: data.email });
        if (existingCliente) {
            return NextResponse.json({
                status: 409,
                error: {
                    message: "Ya existe un cliente con este email",
                    timestamp: new Date().toISOString(),
                },
                metadata: {
                    success: false,
                    conflictingField: 'email'
                }
            }, { status: 409 });
        }

        // Crear el nuevo cliente
        const nuevoCliente = new Cliente(data);
        await nuevoCliente.save();

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
                message: "Cliente creado exitosamente",
                cliente: nuevoCliente
            }
        };

        return NextResponse.json(response, {
            status: 201,
            headers: {
                'X-Response-Time': responseTime.toString(),
                'Location': `/api/cliente/${nuevoCliente._id}`
            }
        });

    } catch (error) {
        console.error('Error in POST /api/cliente:', error);

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