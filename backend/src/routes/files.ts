import { Router } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { db, now } from '../data/store';
import { AuthRequest, authenticate } from '../middleware/auth';
import { apiRateLimit } from '../middleware/rateLimit';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 }
});
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'text/plain',
  'video/mp4'
]);

router.post('/upload', apiRateLimit, authenticate, upload.single('file'), (req: AuthRequest, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'File is required' });
  }
  if (!ALLOWED_MIME_TYPES.has(req.file.mimetype)) {
    return res.status(400).json({ message: 'Unsupported file type' });
  }

  const meta = {
    id: uuidv4(),
    narrativeId: req.body.narrativeId as string | undefined,
    uploaderId: req.user!.id,
    fileName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    createdAt: now()
  };

  db.files.push(meta);
  res.status(201).json(meta);
});

router.get('/', authenticate, apiRateLimit, (req: AuthRequest, res) => {
  if (req.user?.role === 'admin') return res.json(db.files);
  res.json(db.files.filter((file) => file.uploaderId === req.user?.id));
});

export default router;
