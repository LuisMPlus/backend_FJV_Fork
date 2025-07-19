/**
 * Controlador para gestión de permisos RBAC
 * Maneja las operaciones CRUD para permisos y asignaciones de roles
 */

const { Permissions, RolPermissions } = require('../models');
const Rol = require('../../models/Rol');
const Usuario = require('../../models/Usuario');
const { 
  hasPermission, 
  assignPermission, 
  revokePermission, 
  getRolePermissions,
  getPermissionRoles 
} = require('../utils/permissions');

/**
 * Obtener todos los permisos disponibles
 */
const getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permissions.findAll({
      where: { active: true },
      order: [['resource', 'ASC'], ['action', 'ASC']]
    });

    // Agrupar por recurso para mejor visualización
    const groupedPermissions = permissions.reduce((acc, permission) => {
      if (!acc[permission.resource]) {
        acc[permission.resource] = [];
      }
      acc[permission.resource].push({
        id: permission.id,
        name: permission.name,
        action: permission.action,
        description: permission.description
      });
      return acc;
    }, {});

    res.json({
      success: true,
      permissions: groupedPermissions,
      total: permissions.length
    });
  } catch (error) {
    console.error('Error obteniendo permisos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los permisos',
      error: error.message
    });
  }
};

/**
 * Obtener permisos de un rol específico
 */
const getRolePermissionsController = async (req, res) => {
  try {
    const { rolId } = req.params;

    // Verificar que el rol existe
    const rol = await Rol.findByPk(rolId);
    if (!rol) {
      return res.status(404).json({
        success: false,
        message: 'Rol no encontrado'
      });
    }

    const permissions = await getRolePermissions(rolId);

    res.json({
      success: true,
      rol: {
        id: rol.id,
        nombre: rol.nombre,
        descripcion: rol.descripcion
      },
      permissions: permissions.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        resource: p.resource,
        action: p.action,
        grantedAt: p.RolPermissions?.grantedAt,
        grantedBy: p.RolPermissions?.grantedBy
      })),
      total: permissions.length
    });
  } catch (error) {
    console.error('Error obteniendo permisos del rol:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los permisos del rol',
      error: error.message
    });
  }
};

/**
 * Asignar un permiso a un rol
 */
const assignPermissionToRole = async (req, res) => {
  try {
    const { rolId, permissionName } = req.body;
    const grantedBy = req.user?.id;

    if (!rolId || !permissionName) {
      return res.status(400).json({
        success: false,
        message: 'rolId y permissionName son requeridos'
      });
    }

    // Verificar que el rol existe
    const rol = await Rol.findByPk(rolId);
    if (!rol) {
      return res.status(404).json({
        success: false,
        message: 'Rol no encontrado'
      });
    }

    // Verificar que el permiso existe
    const permission = await Permissions.findOne({
      where: { name: permissionName, active: true }
    });
    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permiso no encontrado'
      });
    }

    const assignment = await assignPermission(rolId, permissionName, grantedBy);

    if (assignment) {
      res.json({
        success: true,
        message: 'Permiso asignado exitosamente',
        assignment: {
          rolId,
          permissionName,
          grantedAt: assignment.grantedAt,
          grantedBy: assignment.grantedBy
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error al asignar el permiso'
      });
    }
  } catch (error) {
    console.error('Error asignando permiso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al asignar el permiso',
      error: error.message
    });
  }
};

/**
 * Revocar un permiso de un rol
 */
const revokePermissionFromRole = async (req, res) => {
  try {
    const { rolId, permissionName } = req.body;

    if (!rolId || !permissionName) {
      return res.status(400).json({
        success: false,
        message: 'rolId y permissionName son requeridos'
      });
    }

    const revoked = await revokePermission(rolId, permissionName);

    if (revoked) {
      res.json({
        success: true,
        message: 'Permiso revocado exitosamente'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'No se encontró la asignación del permiso o ya estaba revocada'
      });
    }
  } catch (error) {
    console.error('Error revocando permiso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al revocar el permiso',
      error: error.message
    });
  }
};

/**
 * Verificar si un rol tiene un permiso específico
 */
const checkRolePermission = async (req, res) => {
  try {
    const { rolId, permissionName } = req.params;

    const hasRequiredPermission = await hasPermission(rolId, permissionName);

    res.json({
      success: true,
      rolId: parseInt(rolId),
      permissionName,
      hasPermission: hasRequiredPermission
    });
  } catch (error) {
    console.error('Error verificando permiso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar el permiso',
      error: error.message
    });
  }
};

/**
 * Obtener todos los roles que tienen un permiso específico
 */
const getPermissionRolesController = async (req, res) => {
  try {
    const { permissionName } = req.params;

    const roles = await getPermissionRoles(permissionName);

    res.json({
      success: true,
      permissionName,
      roles: roles.map(role => ({
        id: role.id,
        nombre: role.nombre,
        descripcion: role.descripcion,
        grantedAt: role.RolPermissions?.grantedAt,
        grantedBy: role.RolPermissions?.grantedBy
      })),
      total: roles.length
    });
  } catch (error) {
    console.error('Error obteniendo roles del permiso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los roles del permiso',
      error: error.message
    });
  }
};

/**
 * Obtener resumen del sistema RBAC
 */
const getRBACOverview = async (req, res) => {
  try {
    // Contar totales
    const totalPermissions = await Permissions.count({ where: { active: true } });
    const totalRoles = await Rol.count();
    const totalAssignments = await RolPermissions.count({ where: { active: true } });

    // Obtener permisos por recurso
    const { sequelize } = require('../../config/database');
    const permissionsByResource = await Permissions.findAll({
      where: { active: true },
      attributes: ['resource', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['resource'],
      raw: true
    });

    // Obtener roles con más permisos
    const rolesWithPermissions = await Rol.findAll({
      include: [
        {
          model: Permissions,
          as: 'permissions',
          through: {
            where: { active: true },
            attributes: []
          },
          where: { active: true },
          required: false
        }
      ]
    });

    const rolesStats = rolesWithPermissions.map(role => ({
      id: role.id,
      nombre: role.nombre,
      permissionCount: role.permissions.length
    }));

    res.json({
      success: true,
      overview: {
        totals: {
          permissions: totalPermissions,
          roles: totalRoles,
          assignments: totalAssignments
        },
        permissionsByResource,
        rolesStats
      }
    });
  } catch (error) {
    console.error('Error obteniendo resumen RBAC:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el resumen RBAC',
      error: error.message
    });
  }
};

module.exports = {
  getAllPermissions,
  getRolePermissionsController,
  assignPermissionToRole,
  revokePermissionFromRole,
  checkRolePermission,
  getPermissionRolesController,
  getRBACOverview
};
