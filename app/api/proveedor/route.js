import { getProveedor } from './controllers/getProveedor';
import { postProveedor } from './controllers/postProveedor';
import { putProveedor } from './controllers/putProveedor';
import { deleteProveedor } from './controllers/deleteProveedor';

export async function GET(request) {
    return getProveedor(request);
}

export async function POST(request) {
    return postProveedor(request);
}

export async function PUT(request) {
    return putProveedor(request);
}

export async function DELETE(request) {
    return deleteProveedor(request);
}