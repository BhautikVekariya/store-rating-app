const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { auth, role, orderBy } = require('../middleware');
const { validateUser, validateStore } = require('../validate');

router.use(auth, role('admin'));

const like = (v) => `%${v || ''}%`;

router.get('/stats', async (req, res, next) => {
  try {
    const q = async (t) => +(await db.query(`SELECT COUNT(*) FROM ${t}`)).rows[0].count;
    res.json({ users: await q('users'), stores: await q('stores'), ratings: await q('ratings') });
  } catch (e) { next(e); }
});

router.post('/users', async (req, res, next) => {
  try {
    const errs = validateUser(req.body);
    const { name, email, address = '', password, role: r } = req.body;
    if (!['admin', 'user', 'owner'].includes(r)) errs.push('Invalid role');
    if (errs.length) return res.status(400).json({ error: errs.join(', ') });
    const { rows } = await db.query(
      `INSERT INTO users (name,email,password,address,role) VALUES ($1,$2,$3,$4,$5)
       RETURNING id,name,email,address,role`,
      [name, email.toLowerCase(), await bcrypt.hash(password, 10), address, r]
    );
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
});

router.post('/stores', async (req, res, next) => {
  try {
    const errs = validateStore(req.body);
    if (errs.length) return res.status(400).json({ error: errs.join(', ') });
    const { name, email, address = '', ownerEmail } = req.body;
    let ownerId = null;
    if (ownerEmail) {
      const o = await db.query("SELECT id FROM users WHERE email=$1 AND role='owner'", [ownerEmail.toLowerCase()]);
      if (!o.rows[0]) return res.status(400).json({ error: 'No store owner found with that email' });
      ownerId = o.rows[0].id;
    }
    const { rows } = await db.query(
      'INSERT INTO stores (name,email,address,owner_id) VALUES ($1,$2,$3,$4) RETURNING *',
      [name, email.toLowerCase(), address, ownerId]
    );
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
});

const USER_SORT = { name: 'u.name', email: 'u.email', address: 'u.address', role: 'u.role' };
router.get('/users', async (req, res, next) => {
  try {
    const { name, email, address, role: r, sort, order } = req.query;
    const { rows } = await db.query(
      `SELECT u.id,u.name,u.email,u.address,u.role FROM users u
       WHERE u.name ILIKE $1 AND u.email ILIKE $2 AND u.address ILIKE $3
         AND ($4 = '' OR u.role = $4)
       ORDER BY ${orderBy(USER_SORT, sort, order, 'name')}`,
      [like(name), like(email), like(address), r || '']
    );
    res.json(rows);
  } catch (e) { next(e); }
});

router.get('/users/:id', async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT u.id,u.name,u.email,u.address,u.role,
         (SELECT ROUND(AVG(r.rating),1) FROM ratings r JOIN stores s ON s.id=r.store_id
          WHERE s.owner_id=u.id) AS rating
       FROM users u WHERE u.id=$1`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    if (rows[0].role !== 'owner') delete rows[0].rating;
    res.json(rows[0]);
  } catch (e) { next(e); }
});

const STORE_SORT = { name: 's.name', email: 's.email', address: 's.address', rating: 'rating' };
router.get('/stores', async (req, res, next) => {
  try {
    const { name, email, address, sort, order } = req.query;
    const { rows } = await db.query(
      `SELECT s.id,s.name,s.email,s.address, COALESCE(ROUND(AVG(r.rating),1),0) AS rating
       FROM stores s LEFT JOIN ratings r ON r.store_id=s.id
       WHERE s.name ILIKE $1 AND s.email ILIKE $2 AND s.address ILIKE $3
       GROUP BY s.id
       ORDER BY ${orderBy(STORE_SORT, sort, order, 'name')}`,
      [like(name), like(email), like(address)]
    );
    res.json(rows);
  } catch (e) { next(e); }
});

module.exports = router;
