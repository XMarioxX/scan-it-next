import { connectDB } from "@/libs/mongodb";
import Calzado from "@/models/Calzado";
import { NextResponse } from "next/server";

export async function putCalzado(request) {
    try {
        const startTime = Date.now();
        await connectDB();

        // Obtener los datos del body
        const data = await request.json();

        // Obtener ID del calzado del body
        const calzadoId = data.id;
        if (!calzadoId) {
            return NextResponse.json({
                status: 400,
                error: {
                    message: "ID de calzado no proporcionado",
                    timestamp: new Date().toISOString(),
                },
                metadata: {
                    success: false
                }
            }, { status: 400 });
        }

        // Verificar si el calzado existe
        const calzadoExistente = await Calzado.findById(calzadoId);
        if (!calzadoExistente) {
            return NextResponse.json({
                status: 404,
                error: {
                    message: "Calzado no encontrado",
                    timestamp: new Date().toISOString(),
                },
                metadata: {
                    success: false
                }
            }, { status: 404 });
        }

        // Validar campos requeridos
        const requiredFields = ['codigo_barras', 'modelo', 'marca', 'precio_compra', 'precio_venta', 'variantes', 'estado'];
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

        // Actualizar los datos del calzado
        Object.assign(calzadoExistente, data);
        await calzadoExistente.save();

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
                message: "Calzado actualizado exitosamente",
                calzado: calzadoExistente
            }
        };

        return NextResponse.json(response, {
            status: 200,
            headers: {
                'X-Response-Time': responseTime.toString()
            }
        });

    } catch (error) {
        console.error('Error in PUT /api/calzado:', error);

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