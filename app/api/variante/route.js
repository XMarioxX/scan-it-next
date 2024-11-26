import { getVariante } from './controllers/getVariante';
// import { postVariante } from './controllers/postVariante';
// import { putVariante } from './controllers/putVariante';
// import { deleteVariante } from './controllers/deleteVariante';

export async function GET(request) {
    return getVariante(request);
}

// export async function POST(request) {
//     return postVariante(request);
// }

// export async function PUT(request) {
//     return putVariante(request);
// }

// export async function DELETE(request) {
//     return deleteVariante(request);
// }