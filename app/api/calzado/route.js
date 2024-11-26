import { getCalzado } from './controllers/getCalzado';
import { postCalzado } from './controllers/postCalzado';
import { putCalzado } from './controllers/putCalzado';
import { deleteCalzado } from './controllers/deleteCalzado';

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