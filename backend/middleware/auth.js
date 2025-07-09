const jwt = require('jsonwebtoken');


module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('❌ No auth header');
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Auth Middleware - Token OK - userId:', payload.userId); 
    req.userId = payload.userId;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(403).json({ error: 'Invalid token' });
  }
};
