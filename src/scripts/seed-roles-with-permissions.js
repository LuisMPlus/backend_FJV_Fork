/**
 * Script para crear roles específicos y asignar sus permisos correspondientes
 * Maneja los IDs auto-incrementales correctamente
 */

const { sequelize } = require('../config/database');
const { defineAssociations } = require('../models/associations');
const Rol = require('../models/Rol');
const { Permissions } = require('../RBAC/models');
const { assignPermission } = require('../RBAC/utils/permissions');
const { basicRoles } = require('../RBAC/seeders/rols');

async function seedRolesWithPermissions() {
  try {
    console.log('🔧 Iniciando creación de roles específicos con permisos...');

    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Definir asociaciones
    defineAssociations();
    console.log('✅ Asociaciones definidas');

    let createdCount = 0;
    let existingCount = 0;
    let permissionsAssigned = 0;

    for (const roleData of basicRoles) {
      console.log(`\n📋 Procesando rol: ${roleData.nombre}`);

      // Crear o encontrar el rol
      const [role, created] = await Rol.findOrCreate({
        where: { nombre: roleData.nombre },
        defaults: {
          nombre: roleData.nombre,
          descripcion: roleData.descripcion
        }
      });

      if (created) {
        createdCount++;
        console.log(`✅ Rol creado: ${role.nombre} (ID: ${role.id})`);
      } else {
        existingCount++;
        console.log(`ℹ️  Rol ya existe: ${role.nombre} (ID: ${role.id})`);
      }

      // Asignar permisos al rol
      console.log(`🔄 Asignando ${roleData.permisos.length} permisos al rol ${role.nombre}...`);
      
      let rolePermissionsCount = 0;
      for (const permissionName of roleData.permisos) {
        // Verificar que el permiso existe
        const permission = await Permissions.findOne({
          where: { name: permissionName, active: true }
        });

        if (!permission) {
          console.log(`⚠️  Permiso no encontrado: ${permissionName}`);
          continue;
        }

        // Asignar permiso al rol (usando ID 1 como admin que otorga)
        const assignment = await assignPermission(role.id, permissionName, 1);
        
        if (assignment) {
          rolePermissionsCount++;
          permissionsAssigned++;
          console.log(`   ✅ ${permissionName}`);
        } else {
          console.log(`   ℹ️  ${permissionName} (ya existía)`);
        }
      }

      console.log(`📊 Permisos asignados a ${role.nombre}: ${rolePermissionsCount}/${roleData.permisos.length}`);
    }

    console.log(`\n🎉 Proceso completado:`);
    console.log(`   ✅ Roles nuevos creados: ${createdCount}`);
    console.log(`   ℹ️  Roles ya existentes: ${existingCount}`);
    console.log(`   🔐 Total permisos asignados: ${permissionsAssigned}`);
    console.log(`   📋 Total roles procesados: ${basicRoles.length}`);

    // Mostrar resumen final de roles y sus IDs
    console.log(`\n📋 Resumen de roles en el sistema:`);
    const allRoles = await Rol.findAll({ order: [['id', 'ASC']] });
    allRoles.forEach(role => {
      console.log(`   ID: ${role.id} - ${role.nombre}: ${role.descripcion}`);
    });

  } catch (error) {
    console.error('❌ Error creando roles con permisos:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión a la base de datos cerrada');
  }
}

/**
 * Función para verificar la estructura actual de roles
 */
async function checkCurrentRoles() {
  try {
    await sequelize.authenticate();
    
    // Verificar roles básicos primero
    const roles = await Rol.findAll({ 
      order: [['id', 'ASC']]
    });

    console.log('\n📊 Roles actuales en el sistema:');
    roles.forEach(role => {
      console.log(`   ID: ${role.id} - ${role.nombre}: ${role.descripcion}`);
    });

    await sequelize.close();
  } catch (error) {
    console.error('Error verificando roles:', error);
    await sequelize.close();
  }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'check') {
    checkCurrentRoles();
  } else {
    seedRolesWithPermissions()
      .then(() => {
        console.log('✅ Script de roles ejecutado exitosamente');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Error ejecutando script de roles:', error);
        process.exit(1);
      });
  }
}

module.exports = { seedRolesWithPermissions, checkCurrentRoles };
