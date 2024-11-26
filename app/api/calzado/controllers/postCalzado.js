import { connectDB } from "@/libs/mongodb";
import Calzado from "@/models/Calzado";
import Variante from "@/models/Variante";
import Proveedor from "@/models/Proveedor";
import { NextResponse } from "next/server";

export async function postCalzado(request) {
    try {
        const startTime = Date.now();
        await connectDB();

        // Obtener los datos del body
        const data = await request.json();

        // Validación básica
        const requiredFields = ['codigo_barras', 'modelo', 'marca', 'precio_compra', 'precio_venta', 'estado'];
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

        // Verificar si el código de barras ya existe
        const existingCalzado = await Calzado.findOne({ codigo_barras: data.codigo_barras });
        if (existingCalzado) {
            return NextResponse.json({
                status: 409,
                error: {
                    message: "Ya existe un calzado con este código de barras",
                    timestamp: new Date().toISOString(),
                },
                metadata: {
                    success: false,
                    conflictingField: 'codigo_barras'
                }
            }, { status: 409 });
        }

        // Verificar si el proveedor existe y obtener su información completa
        let proveedor = null;
        if (data.proveedor_id) {
            proveedor = await Proveedor.findById(data.proveedor_id);
            if (!proveedor) {
                return NextResponse.json({
                    status: 400,
                    error: {
                        message: `Proveedor no válido: ${data.proveedor_id}`,
                        timestamp: new Date().toISOString(),
                    },
                    metadata: {
                        success: false,
                        receivedData: data
                    }
                }, { status: 400 });
            }
            proveedor = proveedor.toObject();
        } else {
            return NextResponse.json({
                status: 400,
                error: {
                    message: "ID de proveedor no proporcionado",
                    timestamp: new Date().toISOString(),
                },
                metadata: {
                    success: false,
                    receivedData: data
                }
            }, { status: 400 });
        }

        // Crear el nuevo calzado
        const nuevoCalzado = new Calzado({
            codigo_barras: data.codigo_barras,
            modelo: data.modelo,
            marca: data.marca,
            descripcion: data.descripcion,
            precio_compra: data.precio_compra,
            precio_venta: data.precio_venta,
            proveedor: proveedor,
            estado: data.estado
        });

        // Guardar el calzado para obtener su ID
        await nuevoCalzado.save();

        // Si se proporcionan variantes, crearlas y asociarlas al calzado
        let variantesCompletas = [];
        if (data.variantes && data.variantes.length > 0) {
            const variantes = data.variantes.map(variante => ({
                calzado_id: nuevoCalzado._id,
                talla: variante.talla,
                color: variante.color,
                stock_actual: variante.stock_actual,
                stock_minimo: variante.stock_minimo,
                historial_precios: variante.historial_precios
            }));

            variantesCompletas = await Variante.insertMany(variantes);

            // Asociar las variantes al calzado
            nuevoCalzado.variantes = variantesCompletas;
            await nuevoCalzado.save();
        }

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
                message: "Calzado creado exitosamente",
                calzado: nuevoCalzado
            }
        };

        return NextResponse.json(response, {
            status: 201,
            headers: {
                'X-Response-Time': responseTime.toString(),
                'Location': `/api/calzado/${nuevoCalzado._id}`
            }
        });

    } catch (error) {
        console.error('Error in POST /api/calzado:', error);

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