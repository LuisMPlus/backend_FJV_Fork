/**
 * Script para insertar permisos básicos en la base de datos
 * Ejecuta este script para poblar la tabla de permisos con los permisos predefinidos
 */

const { sequelize } = require('../config/database');
const { Permissions } = require('../RBAC/models');
const { basicPermissions } = require('../RBAC/seeders/permissions');

async function seedPermissions() {
  try {
    console.log('🔧 Iniciando proceso de inserción de permisos...');

    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Insertar permisos básicos
    for (const permissionData of basicPermissions) {
      const [permission, created] = await Permissions.findOrCreate({
        where: { name: permissionData.name },
        defaults: permissionData
      });

      if (created) {
        console.log(`✅ Permiso creado: ${permission.name}`);
      } else {
        console.log(`ℹ️  Permiso ya existe: ${permission.name}`);
      }
    }

    console.log(`🎉 Proceso completado. Total de permisos en el sistema: ${basicPermissions.length}`);
    
    // Mostrar resumen de permisos por recurso
    const permissionsByResource = basicPermissions.reduce((acc, perm) => {
      if (!acc[perm.resource]) acc[perm.resource] = [];
      acc[perm.resource].push(perm.action);
      return acc;
    }, {});

    console.log('\n📊 Resumen de permisos por recurso:');
    Object.entries(permissionsByResource).forEach(([resource, actions]) => {
      console.log(`   ${resource}: ${actions.join(', ')}`);
    });

  } catch (error) {
    console.error('❌ Error insertando permisos:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión a la base de datos cerrada');
  }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
  seedPermissions()
    .then(() => {
      console.log('✅ Script de permisos ejecutado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error ejecutando script de permisos:', error);
      process.exit(1);
    });
}

module.exports = { seedPermissions };
