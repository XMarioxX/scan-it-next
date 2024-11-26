import { getCalzado } from './controllers/getCliente';
import { postCalzado } from './controllers/postCliente';
import { putCalzado } from './controllers/putCliente';
import { deleteCalzado } from './controllers/deleteCliente';

export async function GET(request) {
    return getCalzado(request);
}

export async function POST(request) {
    return postCalzado(request);
}

export async function PUT(request) {
    return putCalzado(request);
}

export async function DELETE(request) {
    return deleteCalzado(request);
}