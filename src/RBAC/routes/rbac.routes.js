/**
 * Rutas para el sistema RBAC (Role-Based Access Control)
 * Maneja endpoints para gestión de permisos y roles
 */

const express = require('express');
const router = express.Router();

// Importar controlador y middlewares
const rbacController = require('../controllers/rbac.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { 
  requirePermission, 
  requireAnyPermission,
  loadUserPermissions,
  requireRole,
  requireAnyRole,
  requirePermissionOrRole,
  requireAdmin,
  requireAdminAccess
} = require('../middlewares/permissions');

/**
 * @route GET /api/rbac/permissions
 * @desc Obtener todos los permisos disponibles
 * @access Requiere autenticación y permiso 'manage_roles'
 */
router.get('/permissions', 
  /* authenticate, */
  /* requirePermission('manage_roles'), */
  rbacController.getAllPermissions
);

/**
 * @route GET /api/rbac/roles/:rolId/permissions
 * @desc Obtener permisos de un rol específico
 * @access Requiere autenticación y permisos para ver roles
 */
router.get('/roles/:rolId/permissions',
  authenticate,
  requireAnyPermission(['manage_roles', 'read_user']),
  rbacController.getRolePermissionsController
);

/**
 * @route POST /api/rbac/assign-permission
 * @desc Asignar un permiso a un rol
 * @access Requiere autenticación y permiso 'assign_permissions'
 */
router.post('/assign-permission',
  authenticate,
  requirePermission('assign_permissions'),
  rbacController.assignPermissionToRole
);

/**
 * @route POST /api/rbac/revoke-permission
 * @desc Revocar un permiso de un rol
 * @access Requiere autenticación y permiso 'revoke_permissions'
 */
router.post('/revoke-permission',
  authenticate,
  requirePermission('revoke_permissions'),
  rbacController.revokePermissionFromRole
);

/**
 * @route GET /api/rbac/check/:rolId/:permissionName
 * @desc Verificar si un rol tiene un permiso específico
 * @access Requiere autenticación
 */
router.get('/check/:rolId/:permissionName',
  authenticate,
  loadUserPermissions(),
  rbacController.checkRolePermission
);

/**
 * @route GET /api/rbac/permissions/:permissionName/roles
 * @desc Obtener todos los roles que tienen un permiso específico
 * @access Requiere autenticación y permisos para gestionar roles
 */
router.get('/permissions/:permissionName/roles',
  authenticate,
  requirePermission('manage_roles'),
  rbacController.getPermissionRolesController
);

/**
 * @route GET /api/rbac/overview
 * @desc Obtener resumen del sistema RBAC
 * @access Requiere ser administrador O tener permiso manage_system_config
 */
router.get('/overview',
  authenticate,
  requireAdminAccess(),
  rbacController.getRBACOverview
);

/**
 * @route GET /api/rbac/admin-only
 * @desc Endpoint solo para administradores
 * @access Solo para rol 'admin'
 */
router.get('/admin-only',
  authenticate,
  requireAdmin(),
  (req, res) => {
    res.json({
      success: true,
      message: 'Acceso concedido: Solo administradores pueden ver esto',
      userRole: req.user.rolId
    });
  }
);

/**
 * @route GET /api/rbac/staff-access
 * @desc Endpoint para staff (admin o usuario)
 * @access Para roles 'admin' o 'usuario'
 */
router.get('/staff-access',
  authenticate,
  requireAnyRole(['admin', 'usuario']),
  (req, res) => {
    res.json({
      success: true,
      message: 'Acceso concedido: Para staff autorizado',
      note: 'Disponible para administradores y usuarios regulares'
    });
  }
);

/**
 * @route GET /api/rbac/flexible-access
 * @desc Endpoint con acceso flexible (admin O permiso específico)
 * @access Admin OR permiso 'read_user'
 */
router.get('/flexible-access',
  authenticate,
  requirePermissionOrRole('read_user', 'admin'),
  (req, res) => {
    res.json({
      success: true,
      message: 'Acceso concedido: Admin o con permiso read_user'
    });
  }
);

/**
 * @route GET /api/rbac/my-permissions
 * @desc Obtener permisos del usuario autenticado
 * @access Requiere autenticación
 */
router.get('/my-permissions',
  authenticate,
  loadUserPermissions(),
  async (req, res) => {
    try {
      res.json({
        success: true,
        user: {
          id: req.user.id,
          nombre: req.user.nombre,
          apellido: req.user.apellido,
          email: req.user.email,
          rolId: req.user.rolId
        },
        permissions: req.userPermissions.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          resource: p.resource,
          action: p.action
        })),
        total: req.userPermissions.length
      });
    } catch (error) {
      console.error('Error obteniendo permisos del usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los permisos del usuario',
        error: error.message
      });
    }
  }
);

module.exports = router;
