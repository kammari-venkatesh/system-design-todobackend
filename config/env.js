import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, '../.env') });

// Render sets RENDER_EXTERNAL_URL automatically — use it for upload links if PUBLIC_URL omitted
if (!process.env.PUBLIC_URL && process.env.RENDER_EXTERNAL_URL) {
  process.env.PUBLIC_URL = process.env.RENDER_EXTERNAL_URL;
}
