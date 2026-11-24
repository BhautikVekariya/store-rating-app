const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { auth } = require('../middleware');
const { validateUser, passwordError } = require('../validate');

const sign = (u) =>
  jwt.sign({ id: u.id, role: u.role, name: u.name }, process.env.JWT_SECRET, { expiresIn: '1d' });

router.post('/signup', async (req, res, next) => {
  try {
    const errs = validateUser(req.body);
    if (errs.length) return res.status(400).json({ error: errs.join(', ') });
    const { name, email, address = '', password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await db.query(
      `INSERT INTO users (name,email,password,address,role) VALUES ($1,$2,$3,$4,'user')
       RETURNING id,name,email,role`,
      [name, email.toLowerCase(), hash, address]
    );
    res.status(201).json({ token: sign(rows[0]), user: rows[0] });
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email = '', password = '' } = req.body;
    const { rows } = await db.query('SELECT * FROM users WHERE email=$1', [email.toLowerCase()]);
    const u = rows[0];
    if (!u || !(await bcrypt.compare(password, u.password)))
      return res.status(401).json({ error: 'Invalid email or password' });
    res.json({ token: sign(u), user: { id: u.id, name: u.name, email: u.email, role: u.role } });
  } catch (e) { next(e); }
});

router.put('/password', auth, async (req, res, next) => {
  try {
    const { password } = req.body;
    const pe = passwordError(password);
    if (pe) return res.status(400).json({ error: pe });
    await db.query('UPDATE users SET password=$1 WHERE id=$2', [await bcrypt.hash(password, 10), req.user.id]);
    res.json({ message: 'Password updated' });
  } catch (e) { next(e); }
});

module.exports = router;
