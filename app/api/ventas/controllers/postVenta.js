import { connectDB } from "@/libs/mongodb";
import Venta from "@/models/Venta";
import Variante from "@/models/Variante";
import Cliente from "@/models/Cliente";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function postVenta(request) {
    try {
        const startTime = Date.now();
        await connectDB();

        // Obtener los datos del body
        const data = await request.json();

        // Validación básica
        const requiredFields = ['id', 'numero_ticket', 'fecha_venta', 'vendedor_id', 'items', 'descuento', 'metodo_pago', 'cliente'];
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

            // Restar la cantidad vendida del stock
            variante.stock_actual -= item.cantidad;
            await variante.save();

            // Calcular el subtotal
            subtotal += item.cantidad * item.precio;
        }

        // Calcular el total aplicando el descuento
        const total = subtotal - data.descuento;

        // Verificar si el cliente ya existe
        let cliente = await Cliente.findOne({ email: data.cliente.email });
        if (!cliente) {
            // Crear el nuevo cliente
            cliente = new Cliente(data.cliente);
            await cliente.save();
        }

        // Crear la nueva venta
        const nuevaVenta = new Venta({
            ...data,
            subtotal,
            total,
            cliente: cliente._id
        });
        await nuevaVenta.save();

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
                message: "Venta creada exitosamente",
                venta: nuevaVenta
            }
        };

        return NextResponse.json(response, {
            status: 201,
            headers: {
                'X-Response-Time': responseTime.toString(),
                'Location': `/api/venta/${nuevaVenta._id}`
            }
        });

    } catch (error) {
        console.error('Error in POST /api/venta:', error);

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