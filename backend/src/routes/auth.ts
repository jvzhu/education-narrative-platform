import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db, now } from '../data/store';
import { authenticate, AuthRequest, createToken } from '../middleware/auth';
import { apiRateLimit } from '../middleware/rateLimit';
import { registerSchema } from '../utils/validators';

const router = Router();
router.use(apiRateLimit);

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
  }

  const { email, password, name, role } = parsed.data;
  if (db.users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ message: 'Email already in use' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: uuidv4(), email, passwordHash, name, role, createdAt: now(), updatedAt: now() };
  db.users.push(user);

  const token = createToken({ id: user.id, role: user.role, email: user.email });
  res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = db.users.find((item) => item.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = createToken({ id: user.id, role: user.role, email: user.email });
  res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
});

router.get('/profile', apiRateLimit, authenticate, (req: AuthRequest, res) => {
  const user = db.users.find((item) => item.id === req.user?.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ id: user.id, email: user.email, role: user.role, name: user.name, createdAt: user.createdAt });
});

router.post('/logout', apiRateLimit, authenticate, (_req, res) => {
  res.json({ message: 'Logged out' });
});

export default router;
