# Sistema RBAC (Role-Based Access Control)

Este sistema implementa un control de acceso basado en roles para la aplicación FJV, permitiendo gestionar permisos de manera granular y flexible.

## 🏗️ Estructura del Sistema

### Modelos

#### `Permissions`
Tabla que almacena los permisos disponibles en el sistema.

```javascript
{
  id: INTEGER (PK),
  name: STRING (UNIQUE) - Nombre único del permiso
  description: STRING - Descripción del permiso
  resource: STRING - Recurso al que se aplica (user, club, noticia, etc.)
  action: STRING - Acción permitida (create, read, update, delete, etc.)
  active: BOOLEAN - Estado del permiso
}
```

#### `RolPermissions` (Tabla Intermedia)
Tabla que relaciona roles con permisos en una relación muchos a muchos.

```javascript
{
  id: INTEGER (PK),
  rolId: INTEGER (FK -> Rols.id),
  permissionId: INTEGER (FK -> permissions.id),
  grantedBy: INTEGER (FK -> usuarios.id),
  grantedAt: DATE - Fecha de asignación
  active: BOOLEAN - Estado de la asignación
}
```

### Relaciones

- **Rol ↔ Permissions**: Muchos a muchos a través de `RolPermissions`
- **Usuario → RolPermissions**: Un usuario puede otorgar permisos (auditoría)
- **RolPermissions → Rol**: Cada asignación pertenece a un rol
- **RolPermissions → Permission**: Cada asignación se refiere a un permiso

## 🚀 Uso del Sistema

### Middlewares Disponibles

#### `requirePermission(permissionName)`
Requiere que el usuario tenga un permiso específico.

```javascript
router.get('/clubs', 
  authenticateToken,
  requirePermission('read_club'),
  clubController.getAll
);
```

#### `requireAllPermissions([permissions])`
Requiere que el usuario tenga TODOS los permisos especificados.

```javascript
router.delete('/users/:id',
  authenticateToken,
  requireAllPermissions(['delete_user', 'manage_system']),
  userController.delete
);
```

#### `requireAnyPermission([permissions])`
Requiere que el usuario tenga AL MENOS UNO de los permisos especificados.

```javascript
router.get('/admin-panel',
  authenticateToken,
  requireAnyPermission(['manage_roles', 'manage_system_config']),
  adminController.dashboard
);
```

#### `loadUserPermissions()`
Carga los permisos del usuario en `req.userPermissions`.

```javascript
router.get('/dashboard',
  authenticateToken,
  loadUserPermissions(),
  (req, res) => {
    // req.userPermissions contiene los permisos del usuario
    res.json({ permissions: req.userPermissions });
  }
);
```

### Funciones Utilitarias

#### Verificación de Permisos

```javascript
const { hasPermission } = require('../RBAC/utils/permissions');

// Verificar si un rol tiene un permiso
const canEdit = await hasPermission(rolId, 'update_club');
```

#### Asignación de Permisos

```javascript
const { assignPermission } = require('../RBAC/utils/permissions');

// Asignar permiso a un rol
await assignPermission(rolId, 'create_noticia', grantedByUserId);
```

#### Revocación de Permisos

```javascript
const { revokePermission } = require('../RBAC/utils/permissions');

// Revocar permiso de un rol
await revokePermission(rolId, 'delete_user');
```

#### Obtener Permisos de un Rol

```javascript
const { getRolePermissions } = require('../RBAC/utils/permissions');

// Obtener todos los permisos de un rol
const permissions = await getRolePermissions(rolId);
```

## 🛠️ API Endpoints

### Gestión de Permisos

- `GET /api/rbac/permissions` - Obtener todos los permisos
- `GET /api/rbac/roles/:rolId/permissions` - Obtener permisos de un rol
- `POST /api/rbac/assign-permission` - Asignar permiso a rol
- `POST /api/rbac/revoke-permission` - Revocar permiso de rol
- `GET /api/rbac/check/:rolId/:permissionName` - Verificar permiso
- `GET /api/rbac/permissions/:permissionName/roles` - Roles con un permiso
- `GET /api/rbac/overview` - Resumen del sistema RBAC
- `GET /api/rbac/my-permissions` - Permisos del usuario autenticado

### Ejemplos de Uso de API

#### Obtener permisos del usuario autenticado
```bash
GET /api/rbac/my-permissions
Authorization: Bearer <token>
```

#### Asignar permiso a un rol
```bash
POST /api/rbac/assign-permission
Authorization: Bearer <token>
Content-Type: application/json

{
  "rolId": 1,
  "permissionName": "create_club"
}
```

#### Verificar si un rol tiene un permiso
```bash
GET /api/rbac/check/1/create_club
Authorization: Bearer <token>
```

## 📋 Permisos Predefinidos

### Usuarios
- `create_user` - Crear nuevos usuarios
- `read_user` - Ver información de usuarios
- `update_user` - Actualizar información de usuarios
- `delete_user` - Eliminar usuarios

### Clubes
- `create_club` - Crear nuevos clubes
- `read_club` - Ver información de clubes
- `update_club` - Actualizar información de clubes
- `delete_club` - Eliminar clubes

### Noticias
- `create_noticia` - Crear nuevas noticias
- `read_noticia` - Ver noticias
- `update_noticia` - Actualizar noticias
- `delete_noticia` - Eliminar noticias
- `publish_noticia` - Publicar noticias

### Personas
- `create_persona` - Crear nuevas personas
- `read_persona` - Ver información de personas
- `update_persona` - Actualizar información de personas
- `delete_persona` - Eliminar personas

### Equipos
- `create_equipo` - Crear nuevos equipos
- `read_equipo` - Ver información de equipos
- `update_equipo` - Actualizar información de equipos
- `delete_equipo` - Eliminar equipos

### RBAC
- `manage_roles` - Gestionar roles del sistema
- `assign_permissions` - Asignar permisos a roles
- `revoke_permissions` - Revocar permisos de roles

### Pagos
- `create_pago` - Crear nuevos pagos
- `read_pago` - Ver información de pagos
- `update_pago` - Actualizar información de pagos
- `delete_pago` - Eliminar pagos

### Sistema
- `manage_system_config` - Gestionar configuración del sistema
- `read_system_logs` - Ver logs del sistema

## 🔧 Scripts de Configuración

### Insertar Permisos Básicos
```bash
node src/scripts/seed-permissions.js
```

### Asignar Permisos al Administrador
```bash
node src/scripts/assign-admin-permissions.js
```

## 💡 Ejemplo de Implementación

### Proteger una Ruta de Clubes

```javascript
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { requirePermission } = require('../RBAC/middlewares/permissions');
const clubController = require('../controllers/club.controller');

// Listar clubes - Solo lectura
router.get('/', 
  authenticateToken,
  requirePermission('read_club'),
  clubController.getAll
);

// Crear club - Requiere permiso de creación
router.post('/', 
  authenticateToken,
  requirePermission('create_club'),
  clubController.create
);

// Actualizar club - Requiere permiso de actualización
router.put('/:id', 
  authenticateToken,
  requirePermission('update_club'),
  clubController.update
);

// Eliminar club - Requiere permiso de eliminación
router.delete('/:id', 
  authenticateToken,
  requirePermission('delete_club'),
  clubController.delete
);

module.exports = router;
```

### Verificación Condicional en Controlador

```javascript
const { hasPermission } = require('../RBAC/utils/permissions');

const getClubDetails = async (req, res) => {
  try {
    const club = await Club.findByPk(req.params.id);
    
    // Verificar si el usuario puede ver información sensible
    const canViewSensitive = await hasPermission(req.user.rolId, 'manage_system_config');
    
    const response = {
      id: club.id,
      nombre: club.nombre,
      // Solo incluir información sensible si tiene permisos
      ...(canViewSensitive && {
        email: club.email,
        telefono: club.telefono,
        financialData: club.financialData
      })
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

## 🚨 Consideraciones de Seguridad

1. **Validación de Tokens**: Siempre usar `authenticateToken` antes de verificar permisos
2. **Principio de Menor Privilegio**: Asignar solo los permisos mínimos necesarios
3. **Auditoría**: El campo `grantedBy` permite rastrear quién otorgó cada permiso
4. **Desactivación**: Los permisos pueden ser desactivados sin eliminar el registro
5. **Verificación en Frontend**: Aunque los permisos se verifican en backend, también deben verificarse en frontend para UX

## 📝 Notas de Implementación

- Los permisos se verifican en cada request protegido
- La tabla intermedia permite auditoría completa de asignaciones
- Los permisos están organizados por recurso y acción para facilitar la gestión
- El sistema es extensible para agregar nuevos permisos según sea necesario
- Las relaciones están optimizadas para consultas eficientes
