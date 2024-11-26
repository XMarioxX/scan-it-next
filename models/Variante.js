import mongoose from "mongoose";

const varianteSchema = new mongoose.Schema({
    calzado_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Calzado',
        required: true
    },
    talla: {
        type: Number,
        required: true
    },
    color: {
        type: String,
        required: true,
        trim: true
    },
    stock_actual: {
        type: Number,
        required: true
    },
    stock_minimo: {
        type: Number,
        required: true
    },
    historial_precios: [{
        type: Number,
        required: true
    }]
}, { timestamps: true });

// Verificamos si el modelo ya existe antes de compilarlo
const Variante = mongoose.models.Variante || mongoose.model('Variante', varianteSchema);

export default Variante;