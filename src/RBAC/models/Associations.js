// Importar modelos RBAC
const Permissions = require('./Permissions');
const RolPermissions = require('./RolPermissions');
const Rol = require('../../models/Rol');
const Usuario = require('../../models/Usuario');

function defineRBACAssociations() {
  // --- Asociaciones RBAC ---
  console.log("Definiendo asociaciones RBAC...");

  // Relación muchos a muchos entre Rol y Permissions a través de RolPermissions
  Rol.belongsToMany(Permissions, {
    through: RolPermissions,
    foreignKey: 'rolId',
    otherKey: 'permissionId',
    as: 'permissions',
    timestamps: false
  });

  Permissions.belongsToMany(Rol, {
    through: RolPermissions,
    foreignKey: 'permissionId',
    otherKey: 'rolId',
    as: 'roles',
    timestamps: false
  });

  // Asociaciones directas con la tabla intermedia para acceso completo
  Rol.hasMany(RolPermissions, {
    foreignKey: 'rolId',
    as: 'rolPermissions',
    onDelete: 'CASCADE'
  });

  Permissions.hasMany(RolPermissions, {
    foreignKey: 'permissionId',
    as: 'rolPermissions',
    onDelete: 'CASCADE'
  });

  RolPermissions.belongsTo(Rol, {
    foreignKey: 'rolId',
    as: 'rol'
  });

  RolPermissions.belongsTo(Permissions, {
    foreignKey: 'permissionId',
    as: 'permission'
  });

  // Asociación con Usuario para el campo grantedBy
  RolPermissions.belongsTo(Usuario, {
    foreignKey: 'grantedBy',
    as: 'grantedByUser'
  });

  Usuario.hasMany(RolPermissions, {
    foreignKey: 'grantedBy',
    as: 'grantedPermissions'
  });
}

module.exports = {
    defineRBACAssociations,
    Permissions,
    RolPermissions
};