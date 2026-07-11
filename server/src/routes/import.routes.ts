import { Router } from 'express';
import multer from 'multer';
import { handleImport } from '../controllers/import.controller';
import { config } from '../config';

const router = Router();

// Configure multer for in-memory file storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.maxFileSize,
  },
  fileFilter: (_req, file, cb) => {
    const ext = file.originalname.toLowerCase().split('.').pop();
    if (ext === 'csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

// POST /api/import — Upload and process CSV
router.post('/', upload.single('file'), handleImport as any);

export default router;
