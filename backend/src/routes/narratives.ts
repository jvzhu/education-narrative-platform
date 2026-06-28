import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, logActivity, now } from '../data/store';
import { AuthRequest, authenticate } from '../middleware/auth';
import { apiRateLimit } from '../middleware/rateLimit';
import { narrativeSchema } from '../utils/validators';

const router = Router();
router.use(apiRateLimit);
const narrativeWriteRateLimit = apiRateLimit;

function formatNarrative(narrative: (typeof db.narratives)[number]) {
  const author = db.users.find((user) => user.id === narrative.authorId);
  const comments = db.comments.filter((comment) => comment.narrativeId === narrative.id);
  return {
    _id: narrative.id,
    ...narrative,
    excerpt: narrative.content.slice(0, 150),
    comments,
    author: {
      id: author?.id ?? narrative.authorId,
      name: author?.name ?? 'Unknown user',
      avatar: 'https://placehold.co/80x80'
    }
  };
}

function canManageNarrative(userId: string, role: string, narrativeId: string, authorId: string) {
  if (authorId === userId || role === 'admin') {
    return true;
  }

  return db.permissions.some(
    (permission) =>
      permission.narrativeId === narrativeId &&
      permission.userId === userId &&
      permission.level === 'editor'
  );
}

router.get('/', (req, res) => {
  const { category, status, tag, q, authorId } = req.query as Record<string, string | undefined>;
  let narratives = [...db.narratives];

  if (category) narratives = narratives.filter((item) => item.category === category);
  if (status) narratives = narratives.filter((item) => item.status === status);
  if (tag) narratives = narratives.filter((item) => item.tags.includes(tag));
  if (authorId) narratives = narratives.filter((item) => item.authorId === authorId);
  if (q) {
    const query = q.toLowerCase();
    narratives = narratives.filter((item) =>
      item.title.toLowerCase().includes(query) || item.content.toLowerCase().includes(query)
    );
  }

  res.json({ stories: narratives.map(formatNarrative), total: narratives.length });
});

router.post('/', authenticate, (req: AuthRequest, res) => {
  const parsed = narrativeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid narrative payload', errors: parsed.error.flatten() });
  }

  const narrative = {
    id: uuidv4(),
    ...parsed.data,
    authorId: req.user!.id,
    likes: [],
    bookmarks: [],
    viewCount: 0,
    createdAt: now(),
    updatedAt: now()
  };
  db.narratives.push(narrative);
  logActivity(req.user!.id, 'create', 'narrative', narrative.id);

  res.status(201).json(formatNarrative(narrative));
});

router.get('/user/:userId', (req, res) => {
  const stories = db.narratives.filter((item) => item.authorId === req.params.userId);
  res.json({ stories: stories.map(formatNarrative), total: stories.length });
});

router.get('/user/:userId/bookmarks', (req, res) => {
  const stories = db.narratives.filter((item) => item.bookmarks.includes(req.params.userId));
  res.json({ stories: stories.map(formatNarrative), total: stories.length });
});

router.get('/:id', (req, res) => {
  const narrative = db.narratives.find((item) => item.id === req.params.id);
  if (!narrative) return res.status(404).json({ message: 'Narrative not found' });
  narrative.viewCount += 1;
  res.json(formatNarrative(narrative));
});

router.put('/:id', authenticate, (req: AuthRequest, res) => {
  const narrative = db.narratives.find((item) => item.id === req.params.id);
  if (!narrative) return res.status(404).json({ message: 'Narrative not found' });

  const canEdit = canManageNarrative(req.user!.id, req.user!.role, narrative.id, narrative.authorId);
  if (!canEdit) return res.status(403).json({ message: 'Forbidden' });

  const parsed = narrativeSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid narrative payload', errors: parsed.error.flatten() });
  }

  Object.assign(narrative, parsed.data, { updatedAt: now() });
  logActivity(req.user!.id, 'update', 'narrative', narrative.id);

  res.json(formatNarrative(narrative));
});

router.patch('/:id/publish', narrativeWriteRateLimit, authenticate, (req: AuthRequest, res) => {
  const narrative = db.narratives.find((item) => item.id === req.params.id);
  if (!narrative) return res.status(404).json({ message: 'Narrative not found' });
  if (!canManageNarrative(req.user!.id, req.user!.role, narrative.id, narrative.authorId)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  narrative.status = 'published';
  narrative.updatedAt = now();
  logActivity(req.user!.id, 'publish', 'narrative', narrative.id);
  res.json(formatNarrative(narrative));
});

router.post('/:id/like', apiRateLimit, authenticate, (req: AuthRequest, res) => {
  const narrative = db.narratives.find((item) => item.id === req.params.id);
  if (!narrative) return res.status(404).json({ message: 'Narrative not found' });
  if (narrative.likes.includes(req.user!.id)) {
    narrative.likes = narrative.likes.filter((id) => id !== req.user!.id);
  } else {
    narrative.likes.push(req.user!.id);
  }
  res.json({ likes: narrative.likes.length });
});

router.post('/:id/bookmark', apiRateLimit, authenticate, (req: AuthRequest, res) => {
  const narrative = db.narratives.find((item) => item.id === req.params.id);
  if (!narrative) return res.status(404).json({ message: 'Narrative not found' });
  if (narrative.bookmarks.includes(req.user!.id)) {
    narrative.bookmarks = narrative.bookmarks.filter((id) => id !== req.user!.id);
  } else {
    narrative.bookmarks.push(req.user!.id);
  }
  res.json({ bookmarks: narrative.bookmarks.length });
});

router.delete('/:id', apiRateLimit, authenticate, (req: AuthRequest, res) => {
  const narrativeId = String(req.params.id);
  const index = db.narratives.findIndex((item) => item.id === narrativeId);
  if (index === -1) return res.status(404).json({ message: 'Narrative not found' });
  const narrative = db.narratives[index];
  if (narrative.authorId !== req.user!.id && req.user!.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  db.narratives.splice(index, 1);
  logActivity(req.user!.id, 'delete', 'narrative', narrativeId);
  res.status(204).send();
});

export default router;
