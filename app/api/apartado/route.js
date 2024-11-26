import { getApartado } from './controllers/getApartado';
import { postApartado } from './controllers/postApartado';
import { putApartado } from './controllers/putApartado';
import { deleteApartado } from './controllers/deleteApartado';

export async function GET(request) {
    return getApartado(request);
}

export async function POST(request) {
    return postApartado(request);
}

export async function PUT(request) {
    return putApartado(request);
}

export async function DELETE(request) {
    return deleteApartado(request);
}