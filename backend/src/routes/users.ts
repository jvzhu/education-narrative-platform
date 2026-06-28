import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db, now } from '../data/store';
import { AuthRequest, authenticate, requireRole } from '../middleware/auth';
import { apiRateLimit } from '../middleware/rateLimit';

const router = Router();
router.use(apiRateLimit);

const createUserRateLimit = apiRateLimit;
router.get('/', authenticate, requireRole('admin'), (_req, res) => {
  res.json(db.users.map(({ passwordHash, ...user }) => user));
});

router.post('/', authenticate, requireRole('admin'), async (req, res) => {
router.post('/', createUserRateLimit, authenticate, requireRole('admin'), async (req, res) => {
  if (!email || !password || !name || !role) {
    return res.status(400).json({ message: 'email/password/name/role are required' });
  }
  if (db.users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ message: 'Email already in use' });
  }
  const user = {
    id: uuidv4(),
    email,
    passwordHash: await bcrypt.hash(password, 10),
    name,
    role,
    createdAt: now(),
    updatedAt: now()
  };
  db.users.push(user);
  const { passwordHash, ...safeUser } = user;
  res.status(201).json(safeUser);
});

router.get('/:id', authenticate, (req: AuthRequest, res) => {
  const target = db.users.find((user) => user.id === req.params.id);
  if (!target) return res.status(404).json({ message: 'User not found' });
  if (req.user?.role !== 'admin' && req.user?.id !== target.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const { passwordHash, ...safeUser } = target;
  res.json(safeUser);
});

router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  const target = db.users.find((user) => user.id === req.params.id);
  if (!target) return res.status(404).json({ message: 'User not found' });
  if (req.user?.role !== 'admin' && req.user?.id !== target.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const { name, role, password } = req.body as { name?: string; role?: 'admin' | 'educator' | 'student'; password?: string };
  if (name) target.name = name;
  if (role && req.user?.role === 'admin') target.role = role;
  if (password) target.passwordHash = await bcrypt.hash(password, 10);
  target.updatedAt = now();

  const { passwordHash, ...safeUser } = target;
  res.json(safeUser);
});

router.delete('/:id', authenticate, requireRole('admin'), (req, res) => {
  const index = db.users.findIndex((user) => user.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'User not found' });
  db.users.splice(index, 1);
  res.status(204).send();
});

export default router;
