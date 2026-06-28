import { Request, Response, Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, logActivity, now } from '../data/store';
import { AuthRequest, authenticate } from '../middleware/auth';
import { apiRateLimit } from '../middleware/rateLimit';
import { commentSchema } from '../utils/validators';

const router = Router();
router.use(apiRateLimit);

function enrichComment(comment: (typeof db.comments)[number]) {
  const author = db.users.find((user) => user.id === comment.authorId);
  return {
    ...comment,
    author: {
      id: author?.id ?? comment.authorId,
      name: author?.name ?? 'Unknown user',
      avatar: 'https://placehold.co/80x80'
    }
  };
}

function handleGetComments(req: Request, res: Response) {
  const comments = db.comments
    .filter((comment) => comment.narrativeId === req.params.narrativeId)
    .map(enrichComment);
  res.json(comments);
}

router.get('/narrative/:narrativeId', handleGetComments);
router.get('/story/:narrativeId', handleGetComments);

function handleCreateComment(req: AuthRequest, res: Response) {
  const narrativeId = String(req.params.narrativeId);
  const parsed = commentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid comment payload', errors: parsed.error.flatten() });
  }

  const comment = {
    id: uuidv4(),
    narrativeId,
    authorId: req.user!.id,
    content: parsed.data.content,
    parentId: parsed.data.parentId,
    likes: [],
    createdAt: now()
  };
  db.comments.push(comment);
  logActivity(req.user!.id, 'comment', 'narrative', narrativeId);
  res.status(201).json(enrichComment(comment));
}

router.post('/narrative/:narrativeId', authenticate, handleCreateComment);
router.post('/story/:narrativeId', authenticate, handleCreateComment);

router.put('/:id', apiRateLimit, authenticate, (req: AuthRequest, res) => {
  const comment = db.comments.find((item) => item.id === req.params.id);
  if (!comment) return res.status(404).json({ message: 'Comment not found' });
  if (comment.authorId !== req.user!.id && req.user!.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const parsed = commentSchema.partial().safeParse(req.body);
  if (!parsed.success || !parsed.data.content) {
    return res.status(400).json({ message: 'Invalid comment payload' });
  }
  comment.content = parsed.data.content;
  res.json(comment);
});

function handleDeleteComment(req: AuthRequest, res: Response) {
  const index = db.comments.findIndex((item) => item.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Comment not found' });
  const comment = db.comments[index];
  if (comment.authorId !== req.user!.id && req.user!.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  db.comments.splice(index, 1);
  res.status(204).send();
}

router.delete('/:id', apiRateLimit, authenticate, handleDeleteComment);

router.post('/:id/like', authenticate, (req: AuthRequest, res) => {
  const comment = db.comments.find((item) => item.id === req.params.id);
  if (!comment) return res.status(404).json({ message: 'Comment not found' });

  if (comment.likes.includes(req.user!.id)) {
    comment.likes = comment.likes.filter((id) => id !== req.user!.id);
  } else {
    comment.likes.push(req.user!.id);
  }

  res.json({ likes: comment.likes.length });
});

export default router;
