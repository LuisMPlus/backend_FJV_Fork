/**
 * Índice de modelos RBAC
 * Exporta todos los modelos relacionados con el sistema de roles y permisos
 */

const Permissions = require('./Permissions');
const RolPermissions = require('./RolPermissions');

module.exports = {
  Permissions,
  RolPermissions
};
