/**
 * Seeders para permisos básicos del sistema RBAC
 * Este archivo contiene los permisos predeterminados que se pueden asignar a los roles
 */

const basicPermissions = [
  // Permisos para Usuarios
  {
    name: 'create_user',
    description: 'Crear nuevos usuarios',
    resource: 'user',
    action: 'create'
  },
  {
    name: 'read_user',
    description: 'Ver información de usuarios',
    resource: 'user',
    action: 'read'
  },
  {
    name: 'update_user',
    description: 'Actualizar información de usuarios',
    resource: 'user',
    action: 'update'
  },
  {
    name: 'delete_user',
    description: 'Eliminar usuarios',
    resource: 'user',
    action: 'delete'
  },

  // Permisos para Clubes
  {
    name: 'create_club',
    description: 'Crear nuevos clubes',
    resource: 'club',
    action: 'create'
  },
  {
    name: 'read_club',
    description: 'Ver información de clubes',
    resource: 'club',
    action: 'read'
  },
  {
    name: 'update_club',
    description: 'Actualizar información de clubes',
    resource: 'club',
    action: 'update'
  },
  {
    name: 'delete_club',
    description: 'Eliminar clubes',
    resource: 'club',
    action: 'delete'
  },

  // Permisos para Noticias
  {
    name: 'create_noticia',
    description: 'Crear nuevas noticias',
    resource: 'noticia',
    action: 'create'
  },
  {
    name: 'read_noticia',
    description: 'Ver noticias',
    resource: 'noticia',
    action: 'read'
  },
  {
    name: 'update_noticia',
    description: 'Actualizar noticias',
    resource: 'noticia',
    action: 'update'
  },
  {
    name: 'delete_noticia',
    description: 'Eliminar noticias',
    resource: 'noticia',
    action: 'delete'
  },
  {
    name: 'publish_noticia',
    description: 'Publicar noticias',
    resource: 'noticia',
    action: 'publish'
  },

  // Permisos para Personas
  {
    name: 'create_persona',
    description: 'Crear nuevas personas',
    resource: 'persona',
    action: 'create'
  },
  {
    name: 'read_persona',
    description: 'Ver información de personas',
    resource: 'persona',
    action: 'read'
  },
  {
    name: 'update_persona',
    description: 'Actualizar información de personas',
    resource: 'persona',
    action: 'update'
  },
  {
    name: 'delete_persona',
    description: 'Eliminar personas',
    resource: 'persona',
    action: 'delete'
  },

  // Permisos para Equipos
  {
    name: 'create_equipo',
    description: 'Crear nuevos equipos',
    resource: 'equipo',
    action: 'create'
  },
  {
    name: 'read_equipo',
    description: 'Ver información de equipos',
    resource: 'equipo',
    action: 'read'
  },
  {
    name: 'update_equipo',
    description: 'Actualizar información de equipos',
    resource: 'equipo',
    action: 'update'
  },
  {
    name: 'delete_equipo',
    description: 'Eliminar equipos',
    resource: 'equipo',
    action: 'delete'
  },

  // Permisos para Roles y Permisos (RBAC)
  {
    name: 'manage_roles',
    description: 'Gestionar roles del sistema',
    resource: 'role',
    action: 'manage'
  },
  {
    name: 'assign_permissions',
    description: 'Asignar permisos a roles',
    resource: 'permission',
    action: 'assign'
  },
  {
    name: 'revoke_permissions',
    description: 'Revocar permisos de roles',
    resource: 'permission',
    action: 'revoke'
  },

  // Permisos para Pagos
  {
    name: 'create_pago',
    description: 'Crear nuevos pagos',
    resource: 'pago',
    action: 'create'
  },
  {
    name: 'read_pago',
    description: 'Ver información de pagos',
    resource: 'pago',
    action: 'read'
  },
  {
    name: 'update_pago',
    description: 'Actualizar información de pagos',
    resource: 'pago',
    action: 'update'
  },
  {
    name: 'delete_pago',
    description: 'Eliminar pagos',
    resource: 'pago',
    action: 'delete'
  },

  // Permisos para Configuración del Sistema
  {
    name: 'manage_system_config',
    description: 'Gestionar configuración del sistema',
    resource: 'system',
    action: 'manage'
  },
  {
    name: 'read_system_logs',
    description: 'Ver logs del sistema',
    resource: 'system',
    action: 'read_logs'
  }
];

module.exports = { basicPermissions };
