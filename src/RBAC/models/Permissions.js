const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Permissions = sequelize.define('Permissions', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Nombre único del permiso (ej: create_user, read_club, update_noticia)'
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Descripción del permiso'
  },
  resource: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Recurso al que se aplica el permiso (ej: user, club, noticia)'
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Acción permitida (ej: create, read, update, delete)'
  },
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Indica si el permiso está activo'
  }
}, {
  timestamps: true,
  tableName: 'permissions',
  indexes: [
    {
      unique: true,
      fields: ['resource', 'action'],
      name: 'unique_resource_action'
    },
    {
      fields: ['active']
    }
  ]
});

module.exports = Permissions;
