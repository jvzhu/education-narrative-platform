import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, logActivity, now } from '../data/store';
import { AuthRequest, authenticate } from '../middleware/auth';
import { ratingSchema } from '../utils/validators';

const router = Router();

router.get('/narrative/:narrativeId', (req, res) => {
  const ratings = db.ratings.filter((rating) => rating.narrativeId === req.params.narrativeId);
  const average = ratings.length === 0 ? 0 : ratings.reduce((sum, item) => sum + item.score, 0) / ratings.length;
  res.json({ ratings, average, count: ratings.length });
});

router.post('/narrative/:narrativeId', authenticate, (req: AuthRequest, res) => {
  const narrativeId = String(req.params.narrativeId);
  const parsed = ratingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid rating payload', errors: parsed.error.flatten() });
  }

  const existing = db.ratings.find(
    (item) => item.narrativeId === narrativeId && item.authorId === req.user!.id
  );

  if (existing) {
    existing.score = parsed.data.score;
    existing.review = parsed.data.review;
    return res.json(existing);
  }

  const rating = {
    id: uuidv4(),
    narrativeId,
    authorId: req.user!.id,
    score: parsed.data.score,
    review: parsed.data.review,
    createdAt: now()
  };
  db.ratings.push(rating);
  logActivity(req.user!.id, 'rate', 'narrative', narrativeId);
  res.status(201).json(rating);
});

export default router;
