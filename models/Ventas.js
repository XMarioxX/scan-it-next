const mongoose = require('mongoose');

const ventaSchema = new mongoose.Schema({
    id: { type: String, required: true },
    numero_ticket: { type: String, required: true },
    fecha_venta: { type: Date, required: true },
    vendedor_id: { type: String, required: true },
    items: { type: Array, required: true },
    subtotal: { type: Number, required: true },
    descuento: { type: Number, required: true },
    total: { type: Number, required: true },
    metodo_pago: { type: String, required: true },
    cliente: { type: Object, required: true }
});

const Venta = mongoose.model('Venta', ventaSchema);

module.exports = Venta;