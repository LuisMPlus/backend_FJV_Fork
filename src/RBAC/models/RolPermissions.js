const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const RolPermissions = sequelize.define('RolPermissions', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  rolId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Rols',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    comment: 'ID del rol'
  },
  permissionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'permissions',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    comment: 'ID del permiso'
  },
  grantedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    },
    onUpdate: 'SET NULL',
    onDelete: 'SET NULL',
    comment: 'ID del usuario que otorgó el permiso'
  },
  grantedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha y hora en que se otorgó el permiso'
  },
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Indica si la asignación del permiso está activa'
  }
}, {
  timestamps: true,
  tableName: 'rol_permissions',
  indexes: [
    {
      unique: true,
      fields: ['rolId', 'permissionId'],
      name: 'unique_rol_permission'
    },
    {
      fields: ['rolId']
    },
    {
      fields: ['permissionId']
    },
    {
      fields: ['active']
    },
    {
      fields: ['grantedBy']
    }
  ]
});

module.exports = RolPermissions;
