import mongoose from "mongoose";

const schema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    telefono: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    historial_compras: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Venta'
    }],
    historial_apartados: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Apartado'
    }]
}, { timestamps: true });

// Verificamos si el modelo ya existe antes de compilarlo
const Cliente = mongoose.models.Cliente || mongoose.model('Cliente', schema);

export default Cliente;