// Auto-generated wrapper for route GET /api/courses
// Original file: THATOO/backend/server.js
module.exports = async (req, res) => {
  try {
    const orig = require('../THATOO/backend/server.js');
    if (typeof orig === 'function') return orig(req,res);
    if (orig && typeof orig.handler === 'function') return orig.handler(req,res);
    res.status(200).json({
      message: 'Generated wrapper for GET /api/courses.',
      note: 'Please adapt the original Express route to export a handler(req,res).',
      originalFile: 'THATOO/backend/server.js'
    });
  } catch (err) {
    console.error('Wrapper error:', err);
    res.status(500).json({ error: String(err) });
  }
};
