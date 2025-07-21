/**
 * Seeders para roles del sistema RBAC
 * Este archivo contiene los roles predeterminados que se pueden asignar a los usuarios
 */

const basicRoles = [
  {
    nombre: 'gestor_contenido',
    descripcion: 'Responsable de crear, actualizar, publicar y eliminar contenidos como noticias e información de clubes.',
    permisos: [
      'create_club',
      'read_club',
      'update_club',
      'delete_club',
      'create_noticia',
      'read_noticia',
      'update_noticia',
      'delete_noticia',
      'publish_noticia',
      'read_equipo'
    ]
  },
  {
    nombre: 'gestor_rrhh',
    descripcion: 'Encargado de la gestión de usuarios, personas y equipos del sistema, con facultades de mantenimiento general.',
    permisos: [
      'create_user',
      'read_user',
      'update_user',
      'delete_user',
      'create_persona',
      'read_persona',
      'update_persona',
      'delete_persona',
      'create_equipo',
      'read_equipo',
      'update_equipo',
      'delete_equipo'
    ]
  },
  {
    nombre: 'gestor_financiero',
    descripcion: 'Responsable de la administración financiera, incluyendo pagos y aspectos básicos de configuración del sistema.',
    permisos: [
      'create_pago',
      'read_pago',
      'update_pago',
      'delete_pago',
      'manage_system_config',
      'read_system_logs'
    ]
  }
];

module.exports = { basicRoles };
