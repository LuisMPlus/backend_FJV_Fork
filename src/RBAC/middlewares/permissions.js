/**
 * Middleware para verificación de permisos y roles RBAC
 * Verifica si el usuario autenticado tiene los permisos o roles necesarios
 */

const { hasPermission, hasMultiplePermissions } = require('../utils/permissions');
const Rol = require('../../models/Rol');

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

/**
 * Middleware que verifica si el usuario tiene un rol específico
 * @param {string} requiredRole - Nombre del rol requerido
 * @returns {Function} - Middleware function
 */
function requireRole(requiredRole) {
  return async (req, res, next) => {
    try {
      // Verificar si el usuario está autenticado
      if (!req.user || !req.user.rolId) {
        return res.status(401).json({
          error: 'Usuario no autenticado o sin rol asignado'
        });
      }

      // Obtener el rol del usuario
      const userRole = await Rol.findByPk(req.user.rolId);
      
      if (!userRole || userRole.nombre !== requiredRole) {
        return res.status(403).json({
          error: 'No tienes el rol necesario para realizar esta acción',
          requiredRole,
          userRole: userRole?.nombre || 'Sin rol'
        });
      }

      // El usuario tiene el rol, continuar
      next();
    } catch (error) {
      console.error('Error en middleware de roles:', error);
      return res.status(500).json({
        error: 'Error interno del servidor al verificar roles'
      });
    }
  };
}

/**
 * Middleware que verifica si el usuario tiene uno de los roles especificados
 * @param {Array<string>} allowedRoles - Array de nombres de roles permitidos
 * @returns {Function} - Middleware function
 */
function requireAnyRole(allowedRoles) {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.rolId) {
        return res.status(401).json({
          error: 'Usuario no autenticado o sin rol asignado'
        });
      }

      // Obtener el rol del usuario
      const userRole = await Rol.findByPk(req.user.rolId);
      
      if (!userRole || !allowedRoles.includes(userRole.nombre)) {
        return res.status(403).json({
          error: 'No tienes ninguno de los roles necesarios para realizar esta acción',
          allowedRoles,
          userRole: userRole?.nombre || 'Sin rol'
        });
      }

      next();
    } catch (error) {
      console.error('Error en middleware de roles múltiples:', error);
      return res.status(500).json({
        error: 'Error interno del servidor al verificar roles'
      });
    }
  };
}

/**
 * Middleware que verifica si el usuario tiene un permiso específico O un rol específico
 * @param {string} requiredPermission - Nombre del permiso requerido
 * @param {string|Array<string>} allowedRoles - Rol(es) que pueden acceder sin el permiso
 * @returns {Function} - Middleware function
 */
function requirePermissionOrRole(requiredPermission, allowedRoles) {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.rolId) {
        return res.status(401).json({
          error: 'Usuario no autenticado o sin rol asignado'
        });
      }

      // Obtener el rol del usuario
      const userRole = await Rol.findByPk(req.user.rolId);
      const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      
      // Verificar si tiene el rol permitido
      if (userRole && rolesArray.includes(userRole.nombre)) {
        return next(); // Tiene el rol, puede continuar
      }

      // Si no tiene el rol, verificar si tiene el permiso
      const hasRequiredPermission = await hasPermission(req.user.rolId, requiredPermission);
      
      if (!hasRequiredPermission) {
        return res.status(403).json({
          error: 'No tienes el permiso ni el rol necesario para realizar esta acción',
          requiredPermission,
          allowedRoles: rolesArray,
          userRole: userRole?.nombre || 'Sin rol'
        });
      }

      next();
    } catch (error) {
      console.error('Error en middleware de permiso o rol:', error);
      return res.status(500).json({
        error: 'Error interno del servidor al verificar permisos y roles'
      });
    }
  };
}

/**
 * Middleware que verifica si el usuario es administrador
 * Equivale a requireRole('admin') pero más directo
 * @returns {Function} - Middleware function
 */
function requireAdmin() {
  return requireRole('admin');
}

/**
 * Middleware que verifica si el usuario tiene permisos administrativos (admin o manage_system_config)
 * @returns {Function} - Middleware function
 */
function requireAdminAccess() {
  return requirePermissionOrRole('manage_system_config', 'admin');
}

module.exports = {
  requirePermission,
  requireAllPermissions,
  requireAnyPermission,
  loadUserPermissions,
  // Middlewares para verificación por roles
  requireRole,
  requireAnyRole,
  requirePermissionOrRole,
  requireAdmin,
  requireAdminAccess
};
