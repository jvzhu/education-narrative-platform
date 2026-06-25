import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, now } from '../data/store';
import { AuthRequest, authenticate } from '../middleware/auth';
import { apiRateLimit } from '../middleware/rateLimit';

const router = Router();
router.use(apiRateLimit);

router.post('/share', authenticate, (req: AuthRequest, res) => {
  const { narrativeId, userId, level } = req.body as {
    narrativeId?: string;
    userId?: string;
    level?: 'viewer' | 'editor';
  };

  if (!narrativeId || !userId || !level) {
    return res.status(400).json({ message: 'narrativeId, userId and level are required' });
  }

  const narrative = db.narratives.find((item) => item.id === narrativeId);
  if (!narrative) return res.status(404).json({ message: 'Narrative not found' });
  if (narrative.authorId !== req.user!.id && req.user!.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const permission = {
    id: uuidv4(),
    narrativeId,
    userId,
    level,
    createdAt: now()
  };

  db.permissions = db.permissions.filter((p) => !(p.narrativeId === narrativeId && p.userId === userId));
  db.permissions.push(permission);
  res.status(201).json(permission);
});

router.get('/narrative/:narrativeId', authenticate, (req: AuthRequest, res) => {
  const narrative = db.narratives.find((item) => item.id === req.params.narrativeId);
  if (!narrative) return res.status(404).json({ message: 'Narrative not found' });

  if (req.user?.role !== 'admin' && req.user?.id !== narrative.authorId) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  res.json(db.permissions.filter((item) => item.narrativeId === req.params.narrativeId));
});

export default router;
