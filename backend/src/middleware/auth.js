
const jwt = require('jsonwebtoken');
const { getCapabilitiesForRole } = require('../permissions');

function auth(requiredPermissions = []) {
  return (req, res, next) => {
    const hdr = req.headers.authorization || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'No token provided' });
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // { userId, companyId, role }
      req.user.capabilities = getCapabilitiesForRole(decoded.role);
      if (requiredPermissions.length) {
        const ok = requiredPermissions.every(p => req.user.capabilities.has(p));
        if (!ok) return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
      }
      next();
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}
module.exports = auth;
