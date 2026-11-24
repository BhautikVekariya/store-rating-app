const router = require('express').Router();
const db = require('../db');
const { auth, role, orderBy } = require('../middleware');

router.use(auth);

const SORT = { name: 's.name', address: 's.address', overall: 'overall', my_rating: 'my_rating' };

// normal user: list + search
router.get('/', role('user'), async (req, res, next) => {
  try {
    const { search = '', sort, order } = req.query;
    const { rows } = await db.query(
      `SELECT s.id,s.name,s.address,
         COALESCE(ROUND(AVG(r.rating),1),0) AS overall,
         (SELECT rating FROM ratings WHERE store_id=s.id AND user_id=$1) AS my_rating
       FROM stores s LEFT JOIN ratings r ON r.store_id=s.id
       WHERE s.name ILIKE $2 OR s.address ILIKE $2
       GROUP BY s.id
       ORDER BY ${orderBy(SORT, sort, order, 'name')}`,
      [req.user.id, `%${search}%`]
    );
    res.json(rows);
  } catch (e) { next(e); }
});

// normal user: submit or modify rating
router.post('/:id/rate', role('user'), async (req, res, next) => {
  try {
    const rating = Number(req.body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5)
      return res.status(400).json({ error: 'Rating must be 1 to 5' });
    const s = await db.query('SELECT id FROM stores WHERE id=$1', [req.params.id]);
    if (!s.rows[0]) return res.status(404).json({ error: 'Store not found' });
    await db.query(
      `INSERT INTO ratings (user_id,store_id,rating) VALUES ($1,$2,$3)
       ON CONFLICT (user_id,store_id) DO UPDATE SET rating=$3, updated_at=NOW()`,
      [req.user.id, req.params.id, rating]
    );
    res.json({ message: 'Rating saved' });
  } catch (e) { next(e); }
});

// store owner dashboard
router.get('/owner/dashboard', role('owner'), async (req, res, next) => {
  try {
    const st = await db.query(
      `SELECT s.id,s.name,s.address, COALESCE(ROUND(AVG(r.rating),1),0) AS average
       FROM stores s LEFT JOIN ratings r ON r.store_id=s.id
       WHERE s.owner_id=$1 GROUP BY s.id`, [req.user.id]);
    if (!st.rows[0]) return res.json({ store: null, raters: [] });
    const raters = await db.query(
      `SELECT u.id,u.name,u.email,r.rating,r.updated_at FROM ratings r
       JOIN users u ON u.id=r.user_id WHERE r.store_id=$1 ORDER BY r.updated_at DESC`,
      [st.rows[0].id]);
    res.json({ store: st.rows[0], raters: raters.rows });
  } catch (e) { next(e); }
});

module.exports = router;
