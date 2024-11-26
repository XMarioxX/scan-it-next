import mongoose from "mongoose";

const proveedorSchema = new mongoose.Schema({
    nombre: String,
    rfc: String,
    direccion: String,
    telefonos: [String],
    email: String,
    productos_suministrados: [mongoose.Schema.Types.ObjectId],
    historial_compras: Object
});

const calzadoSchema = new mongoose.Schema({
    codigo_barras: {
        type: String,
        required: true,
        trim: true
    },
    modelo: {
        type: String,
        required: true,
        trim: true
    },
    marca: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: {
        type: String,
        trim: true
    },
    precio_compra: {
        type: Number,
        required: true
    },
    precio_venta: {
        type: Number,
        required: true
    },
    variantes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Variante'
    }],
    proveedor: proveedorSchema,
    proveedores_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proveedor'
    }],
    fecha_registro: {
        type: Date,
        default: Date.now
    },
    estado: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true });

// Verificamos si el modelo ya existe antes de compilarlo
const Calzado = mongoose.models.Calzado || mongoose.model('Calzado', calzadoSchema);

export default Calzado;