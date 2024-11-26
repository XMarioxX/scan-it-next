import { connectDB } from "@/libs/mongodb";
import Apartado from "@/models/Apartado";
import Variante from "@/models/Variante";
import Cliente from "@/models/Cliente";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function putApartado(request) {
    try {
        const startTime = Date.now();
        await connectDB();

        // Obtener los datos del body
        const data = await request.json();

        // Obtener ID del apartado del body
        const apartadoId = data.id;
        if (!apartadoId || !mongoose.Types.ObjectId.isValid(apartadoId)) {
            return NextResponse.json({
                status: 400,
                error: {
                    message: "ID de apartado no proporcionado o no es válido",
                    timestamp: new Date().toISOString(),
                },
                metadata: {
                    success: false
                }
            }, { status: 400 });
        }

        // Verificar si el apartado existe
        const apartadoExistente = await Apartado.findById(apartadoId).populate('items.variante_id');
        if (!apartadoExistente) {
            return NextResponse.json({
                status: 404,
                error: {
                    message: "Apartado no encontrado",
                    timestamp: new Date().toISOString(),
                },
                metadata: {
                    success: false
                }
            }, { status: 404 });
        }

        // Restaurar el stock de las variantes a su estado original
        for (const item of apartadoExistente.items) {
            const variante = await Variante.findById(item.variante_id._id);
            if (variante) {
                variante.stock_actual += item.cantidad;
                await variante.save();
            }
        }

        // Validar campos requeridos
        const requiredFields = ['numero_ticket', 'fecha_apartado', 'fecha_vencimiento', 'estado', 'items', 'anticipo', 'cliente'];
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

        // Validar y actualizar las variantes
        let subtotal = 0;
        for (const item of data.items) {
            if (!mongoose.Types.ObjectId.isValid(item.variante_id)) {
                return NextResponse.json({
                    status: 400,
                    error: {
                        message: `El ID de la variante ${item.variante_id} no es válido`,
                        timestamp: new Date().toISOString(),
                    },
                    metadata: {
                        success: false,
                        conflictingField: 'variante_id'
                    }
                }, { status: 400 });
            }

            const varianteId = new mongoose.Types.ObjectId(item.variante_id);
            const variante = await Variante.findById(varianteId);
            if (!variante) {
                return NextResponse.json({
                    status: 404,
                    error: {
                        message: `Variante con ID ${item.variante_id} no encontrada`,
                        timestamp: new Date().toISOString(),
                    },
                    metadata: {
                        success: false,
                        conflictingField: 'variante_id'
                    }
                }, { status: 404 });
            }

            if (variante.stock_actual < item.cantidad) {
                return NextResponse.json({
                    status: 400,
                    error: {
                        message: `Stock insuficiente para la variante con ID ${item.variante_id}`,
                        timestamp: new Date().toISOString(),
                    },
                    metadata: {
                        success: false,
                        conflictingField: 'cantidad'
                    }
                }, { status: 400 });
            }

            // Restar la cantidad apartada del stock
            variante.stock_actual -= item.cantidad;
            await variante.save();

            // Calcular el subtotal
            subtotal += item.cantidad * item.precio;
        }

        // Calcular el total
        const total = subtotal;

        // Verificar si el cliente ya existe
        let cliente;
        if (typeof data.cliente === 'string' && mongoose.Types.ObjectId.isValid(data.cliente)) {
            cliente = await Cliente.findById(data.cliente);
            if (!cliente) {
                return NextResponse.json({
                    status: 404,
                    error: {
                        message: `Cliente con ID ${data.cliente} no encontrado`,
                        timestamp: new Date().toISOString(),
                    },
                    metadata: {
                        success: false,
                        conflictingField: 'cliente'
                    }
                }, { status: 404 });
            }
        } else if (typeof data.cliente === 'object') {
            cliente = await Cliente.findOne({ email: data.cliente.email });
            if (!cliente) {
                cliente = new Cliente(data.cliente);
                await cliente.save();
            }
        } else {
            return NextResponse.json({
                status: 400,
                error: {
                    message: "El cliente proporcionado no es válido",
                    timestamp: new Date().toISOString(),
                },
                metadata: {
                    success: false,
                    conflictingField: 'cliente'
                }
            }, { status: 400 });
        }

        // Actualizar los datos del apartado
        Object.assign(apartadoExistente, {
            ...data,
            subtotal,
            total,
            saldo_pendiente: total - data.anticipo,
            cliente: cliente._id
        });
        await apartadoExistente.save();

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
                message: "Apartado actualizado exitosamente",
                apartado: apartadoExistente
            }
        };

        return NextResponse.json(response, {
            status: 200,
            headers: {
                'X-Response-Time': responseTime.toString()
            }
        });

    } catch (error) {
        console.error('Error in PUT /api/apartado:', error);

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