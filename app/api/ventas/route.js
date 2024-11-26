import { getVentas } from './controllers/getVenta';
import { postVenta } from './controllers/postVenta';
import { putVenta } from './controllers/putVenta';
import { deleteVenta } from './controllers/deleteVenta';

export async function GET(request) {
    return getVentas(request);
}

export async function POST(request) {
    return postVenta(request);
}

export async function PUT(request) {
    return putVenta(request);
}

export async function DELETE(request) {
    return deleteVenta(request);
}