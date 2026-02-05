import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(req) {
    try {
        // Ensure request is multipart/form-data
        if (!req.headers.get('content-type')?.includes('multipart/form-data')) {
            return NextResponse.json({ error: 'Invalid Content-Type' }, { status: 400 });
        }

        const formData = await req.formData();
        const file = formData.get('file'); // Extract file

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Convert file to Base64
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;

        // Upload to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(base64String, {
            folder: 'nextjs_uploads',
        });

        return NextResponse.json({ url: uploadResponse.secure_url }, { status: 200 });
    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
