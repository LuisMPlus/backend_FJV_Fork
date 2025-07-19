/**
 * Script para asignar permisos básicos al rol de administrador
 * Este script asigna todos los permisos administrativos al rol de administrador
 */

const { sequelize } = require('../config/database');
const Rol = require('../models/Rol');
const { Permissions } = require('../RBAC/models');
const { assignPermission } = require('../RBAC/utils/permissions');

async function assignAdminPermissions() {
  try {
    console.log('🔧 Iniciando asignación de permisos al rol administrador...');

    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Buscar el rol de administrador
    const adminRole = await Rol.findOne({
      where: { nombre: 'admin' }
    });

    if (!adminRole) {
      console.log('❌ No se encontró el rol de admin');
      return;
    }

    console.log(`📋 Rol encontrado: ${adminRole.nombre} (ID: ${adminRole.id})`);

    // Permisos que se asignarán al administrador (todos los permisos)
    const adminPermissions = [
      // Usuarios
      'create_user', 'read_user', 'update_user', 'delete_user',
      // Clubes
      'create_club', 'read_club', 'update_club', 'delete_club',
      // Noticias
      'create_noticia', 'read_noticia', 'update_noticia', 'delete_noticia', 'publish_noticia',
      // Personas
      'create_persona', 'read_persona', 'update_persona', 'delete_persona',
      // Equipos
      'create_equipo', 'read_equipo', 'update_equipo', 'delete_equipo',
      // RBAC
      'manage_roles', 'assign_permissions', 'revoke_permissions',
      // Pagos
      'create_pago', 'read_pago', 'update_pago', 'delete_pago',
      // Sistema
      'manage_system_config', 'read_system_logs'
    ];

    console.log(`🔄 Asignando ${adminPermissions.length} permisos al rol administrador...`);

    let assignedCount = 0;
    let existingCount = 0;

    for (const permissionName of adminPermissions) {
      const assignment = await assignPermission(adminRole.id, permissionName, 1); // Usuario admin con ID 1
      
      if (assignment) {
        if (assignment.id) {
          assignedCount++;
          console.log(`✅ Permiso asignado: ${permissionName}`);
        } else {
          existingCount++;
          console.log(`ℹ️  Permiso ya existía: ${permissionName}`);
        }
      } else {
        console.log(`❌ Error asignando: ${permissionName}`);
      }
    }

    console.log(`\n🎉 Proceso completado:`);
    console.log(`   ✅ Permisos nuevos asignados: ${assignedCount}`);
    console.log(`   ℹ️  Permisos ya existentes: ${existingCount}`);
    console.log(`   📊 Total de permisos para administrador: ${adminPermissions.length}`);

  } catch (error) {
    console.error('❌ Error asignando permisos al administrador:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión a la base de datos cerrada');
  }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
  assignAdminPermissions()
    .then(() => {
      console.log('✅ Script de asignación de permisos ejecutado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error ejecutando script de asignación:', error);
      process.exit(1);
    });
}

module.exports = { assignAdminPermissions };
