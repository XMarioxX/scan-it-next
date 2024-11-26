import mongoose from "mongoose";

const proveedorSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    rfc: {
        type: String,
        required: true
    },
    direccion: {
        type: String,
        required: true
    },
    telefonos: [{
        type: String,
        required: true
    }],
    email: {
        type: String,
        required: true
    },
    productos_suministrados: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Producto'
    }],
    historial_compras: {
        type: Object,
        required: true
    }
}, { timestamps: true });

const Proveedor = mongoose.models.Proveedor || mongoose.model('Proveedor', proveedorSchema);

export default Proveedor;