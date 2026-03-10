import { IncomingForm } from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL.replace(/\/search$/, '')
  : 'https://ingreddit-api.onrender.com';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fields, files } = await new Promise((resolve, reject) => {
      const form = new IncomingForm({ keepExtensions: true, maxFileSize: 4 * 1024 * 1024 });
      form.parse(req, (err, fields, files) => {
        if (err) {
          if (err.code === 1009 || err.message?.includes('maxFileSize')) {
            reject(new Error('FILE_TOO_LARGE'));
          }
          reject(err);
          return;
        }
        resolve({ fields, files });
      });
    });

    const file = files.image;
    if (!file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const fileObj = Array.isArray(file) ? file[0] : file;
    const filePath = fileObj.filepath;
    if (!filePath) {
      return res.status(400).json({ error: 'No file path found for uploaded image' });
    }

    const mimeType = fileObj.mimetype || 'image/jpeg';

    // Reject unsupported formats
    const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!supportedTypes.includes(mimeType)) {
      fs.unlink(filePath, () => {});
      return res.status(400).json({
        error: `Unsupported image format: ${mimeType}. Please use JPEG, PNG, or WebP.`,
        code: 'UNSUPPORTED_FORMAT'
      });
    }

    // Read file and forward to backend
    const imageBuffer = fs.readFileSync(filePath);

    // Clean up temp file
    fs.unlink(filePath, () => {});

    // Build multipart form data for the backend
    const boundary = '----FormBoundary' + Math.random().toString(36).slice(2);
    const filename = fileObj.originalFilename || 'image.jpg';

    const header = Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
      `Content-Type: ${mimeType}\r\n\r\n`
    );
    const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
    const body = Buffer.concat([header, imageBuffer, footer]);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${BACKEND_URL}/analyze-image`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error || 'Backend detection failed',
        code: 'BACKEND_ERROR'
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    if (error.message === 'FILE_TOO_LARGE') {
      return res.status(400).json({
        error: 'Image is too large. Please use an image under 4MB.',
        code: 'FILE_TOO_LARGE'
      });
    }
    if (error.name === 'AbortError') {
      return res.status(504).json({
        error: 'Image analysis timed out. Please try a smaller image.',
        code: 'TIMEOUT'
      });
    }
    return res.status(500).json({
      error: 'Failed to detect ingredients: ' + (error.message || 'Unknown error'),
      code: 'INTERNAL_ERROR'
    });
  }
}
