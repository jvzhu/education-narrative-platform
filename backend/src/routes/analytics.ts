import { Router } from 'express';
import { db } from '../data/store';
import { authenticate, requireRole } from '../middleware/auth';
import { apiRateLimit } from '../middleware/rateLimit';

const router = Router();
router.use(apiRateLimit);

router.get('/dashboard', authenticate, requireRole('admin', 'educator'), (_req, res) => {
  const popularNarratives = [...db.narratives]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 10);

  const engagementByNarrative = db.narratives.map((narrative) => ({
    narrativeId: narrative.id,
    title: narrative.title,
    views: narrative.viewCount,
    comments: db.comments.filter((item) => item.narrativeId === narrative.id).length,
    ratings: db.ratings.filter((item) => item.narrativeId === narrative.id).length
  }));

  res.json({
    totals: {
      users: db.users.length,
      narratives: db.narratives.length,
      comments: db.comments.length,
      ratings: db.ratings.length,
      files: db.files.length
    },
    popularNarratives,
    engagementByNarrative,
    recentActivity: db.activities.slice(-20).reverse()
  });
});

export default router;
