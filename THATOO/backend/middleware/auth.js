const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

function verifyToken(req, res, next){
  const auth = req.headers.authorization;
  if(!auth) return res.status(401).json({ error: 'No token' });
  const token = auth.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if(err) return res.status(401).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  });
}

function requireRole(role){
  return function(req, res, next){
    if(!req.user) return res.status(401).json({ error: 'No user' });
    if(req.user.role !== role) return res.status(403).json({ error: 'Forbidden' });
    next();
  }
}

module.exports = { verifyToken, requireRole };