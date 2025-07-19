/**
 * Middleware para verificación de permisos RBAC
 * Verifica si el usuario autenticado tiene los permisos necesarios
 */

const { hasPermission, hasMultiplePermissions } = require('../utils/permissions');

/**
 * Middleware que verifica si el usuario tiene un permiso específico
 * @param {string} requiredPermission - Nombre del permiso requerido
 * @returns {Function} - Middleware function
 */
function requirePermission(requiredPermission) {
  return async (req, res, next) => {
    try {
      // Verificar si el usuario está autenticado
      if (!req.user || !req.user.rolId) {
        return res.status(401).json({
          error: 'Usuario no autenticado o sin rol asignado'
        });
      }

      // Verificar si el rol tiene el permiso requerido
      const hasRequiredPermission = await hasPermission(req.user.rolId, requiredPermission);

      if (!hasRequiredPermission) {
        return res.status(403).json({
          error: 'No tienes permisos suficientes para realizar esta acción',
          requiredPermission
        });
      }

      // El usuario tiene el permiso, continuar
      next();
    } catch (error) {
      console.error('Error en middleware de permisos:', error);
      return res.status(500).json({
        error: 'Error interno del servidor al verificar permisos'
      });
    }
  };
}

/**
 * Middleware que verifica si el usuario tiene TODOS los permisos especificados
 * @param {Array<string>} requiredPermissions - Array de nombres de permisos requeridos
 * @returns {Function} - Middleware function
 */
function requireAllPermissions(requiredPermissions) {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.rolId) {
        return res.status(401).json({
          error: 'Usuario no autenticado o sin rol asignado'
        });
      }

      const permissions = await hasMultiplePermissions(req.user.rolId, requiredPermissions);
      const missingPermissions = requiredPermissions.filter(permission => !permissions[permission]);

      if (missingPermissions.length > 0) {
        return res.status(403).json({
          error: 'No tienes todos los permisos necesarios para realizar esta acción',
          missingPermissions
        });
      }

      next();
    } catch (error) {
      console.error('Error en middleware de múltiples permisos:', error);
      return res.status(500).json({
        error: 'Error interno del servidor al verificar permisos'
      });
    }
  };
}

/**
 * Middleware que verifica si el usuario tiene AL MENOS UNO de los permisos especificados
 * @param {Array<string>} requiredPermissions - Array de nombres de permisos (necesita al menos uno)
 * @returns {Function} - Middleware function
 */
function requireAnyPermission(requiredPermissions) {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.rolId) {
        return res.status(401).json({
          error: 'Usuario no autenticado o sin rol asignado'
        });
      }

      const permissions = await hasMultiplePermissions(req.user.rolId, requiredPermissions);
      const hasAnyPermission = requiredPermissions.some(permission => permissions[permission]);

      if (!hasAnyPermission) {
        return res.status(403).json({
          error: 'No tienes ninguno de los permisos necesarios para realizar esta acción',
          requiredPermissions
        });
      }

      next();
    } catch (error) {
      console.error('Error en middleware de permisos alternativos:', error);
      return res.status(500).json({
        error: 'Error interno del servidor al verificar permisos'
      });
    }
  };
}

/**
 * Middleware que agrega los permisos del usuario al objeto request
 * Útil para verificaciones condicionales en los controladores
 */
function loadUserPermissions() {
  return async (req, res, next) => {
    try {
      if (req.user && req.user.rolId) {
        const { getRolePermissions } = require('../utils/permissions');
        req.userPermissions = await getRolePermissions(req.user.rolId);
      } else {
        req.userPermissions = [];
      }
      next();
    } catch (error) {
      console.error('Error cargando permisos del usuario:', error);
      req.userPermissions = [];
      next();
    }
  };
}

module.exports = {
  requirePermission,
  requireAllPermissions,
  requireAnyPermission,
  loadUserPermissions
};
