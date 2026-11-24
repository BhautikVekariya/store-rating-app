const jwt = require('jsonwebtoken');

exports.auth = (req, res, next) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

exports.role = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Forbidden' });

// safe ORDER BY from whitelist
exports.orderBy = (map, sort, order, fallback) =>
  `${map[sort] || map[fallback]} ${order === 'desc' ? 'DESC' : 'ASC'}`;
