import mongoose from "mongoose";

const apartadoSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        trim: true
    },
    numero_ticket: {
        type: String,
        required: true,
        trim: true
    },
    fecha_apartado: {
        type: Date,
        required: true
    },
    fecha_vencimiento: {
        type: Date,
        required: true
    },
    estado: {
        type: String,
        required: true,
        trim: true
    },
    items: [{
        variante_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Variante',
            required: true
        },
        cantidad: {
            type: Number,
            required: true
        },
        precio: {
            type: Number,
            required: true
        }
    }],
    total: {
        type: Number,
        required: true
    },
    anticipo: {
        type: Number,
        required: true
    },
    saldo_pendiente: {
        type: Number,
        required: true
    },
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true
    }
}, { timestamps: true });

// Verificamos si el modelo ya existe antes de compilarlo
const Apartado = mongoose.models.Apartado || mongoose.model('Apartado', apartadoSchema);

export default Apartado;