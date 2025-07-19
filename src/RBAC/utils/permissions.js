/**
 * Utilidades para el sistema RBAC
 * Funciones helper para gestionar roles y permisos
 */

const { Permissions, RolPermissions } = require('../models');
const Rol = require('../../models/Rol');

/**
 * Verifica si un rol tiene un permiso específico
 * @param {number} rolId - ID del rol
 * @param {string} permissionName - Nombre del permiso
 * @returns {Promise<boolean>} - True si el rol tiene el permiso
 */
async function hasPermission(rolId, permissionName) {
  try {
    const permission = await Permissions.findOne({
      where: { name: permissionName, active: true }
    });

    if (!permission) {
      return false;
    }

    const rolPermission = await RolPermissions.findOne({
      where: {
        rolId,
        permissionId: permission.id,
        active: true
      }
    });

    return !!rolPermission;
  } catch (error) {
    console.error('Error verificando permiso:', error);
    return false;
  }
}

/**
 * Asigna un permiso a un rol
 * @param {number} rolId - ID del rol
 * @param {string} permissionName - Nombre del permiso
 * @param {number} grantedBy - ID del usuario que otorga el permiso
 * @returns {Promise<Object|null>} - Objeto de la asignación creada o null si falla
 */
async function assignPermission(rolId, permissionName, grantedBy) {
  try {
    const permission = await Permissions.findOne({
      where: { name: permissionName, active: true }
    });

    if (!permission) {
      throw new Error(`Permiso '${permissionName}' no encontrado`);
    }

    // Verificar si ya existe la asignación
    const existingAssignment = await RolPermissions.findOne({
      where: {
        rolId,
        permissionId: permission.id
      }
    });

    if (existingAssignment) {
      // Si existe pero está inactiva, la activamos
      if (!existingAssignment.active) {
        return await existingAssignment.update({
          active: true,
          grantedBy,
          grantedAt: new Date()
        });
      }
      return existingAssignment;
    }

    // Crear nueva asignación
    return await RolPermissions.create({
      rolId,
      permissionId: permission.id,
      grantedBy,
      active: true
    });
  } catch (error) {
    console.error('Error asignando permiso:', error);
    return null;
  }
}

/**
 * Revoca un permiso de un rol
 * @param {number} rolId - ID del rol
 * @param {string} permissionName - Nombre del permiso
 * @returns {Promise<boolean>} - True si se revocó exitosamente
 */
async function revokePermission(rolId, permissionName) {
  try {
    const permission = await Permissions.findOne({
      where: { name: permissionName, active: true }
    });

    if (!permission) {
      return false;
    }

    const result = await RolPermissions.update(
      { active: false },
      {
        where: {
          rolId,
          permissionId: permission.id,
          active: true
        }
      }
    );

    return result[0] > 0;
  } catch (error) {
    console.error('Error revocando permiso:', error);
    return false;
  }
}

/**
 * Obtiene todos los permisos de un rol
 * @param {number} rolId - ID del rol
 * @returns {Promise<Array>} - Array de permisos del rol
 */
async function getRolePermissions(rolId) {
  try {
    const rol = await Rol.findByPk(rolId, {
      include: [
        {
          model: Permissions,
          as: 'permissions',
          through: {
            where: { active: true },
            attributes: ['grantedAt', 'grantedBy']
          },
          where: { active: true }
        }
      ]
    });

    return rol ? rol.permissions : [];
  } catch (error) {
    console.error('Error obteniendo permisos del rol:', error);
    return [];
  }
}

/**
 * Obtiene todos los roles que tienen un permiso específico
 * @param {string} permissionName - Nombre del permiso
 * @returns {Promise<Array>} - Array de roles que tienen el permiso
 */
async function getPermissionRoles(permissionName) {
  try {
    const permission = await Permissions.findOne({
      where: { name: permissionName, active: true },
      include: [
        {
          model: Rol,
          as: 'roles',
          through: {
            where: { active: true },
            attributes: ['grantedAt', 'grantedBy']
          }
        }
      ]
    });

    return permission ? permission.roles : [];
  } catch (error) {
    console.error('Error obteniendo roles del permiso:', error);
    return [];
  }
}

/**
 * Verifica múltiples permisos para un rol
 * @param {number} rolId - ID del rol
 * @param {Array<string>} permissionNames - Array de nombres de permisos
 * @returns {Promise<Object>} - Objeto con el resultado de cada permiso
 */
async function hasMultiplePermissions(rolId, permissionNames) {
  try {
    const results = {};
    
    for (const permissionName of permissionNames) {
      results[permissionName] = await hasPermission(rolId, permissionName);
    }

    return results;
  } catch (error) {
    console.error('Error verificando múltiples permisos:', error);
    return {};
  }
}

module.exports = {
  hasPermission,
  assignPermission,
  revokePermission,
  getRolePermissions,
  getPermissionRoles,
  hasMultiplePermissions
};
