# Middlewares de Verificación por Roles

Esta documentación complementa el sistema RBAC con middlewares específicos para verificación por roles, además de permisos.

## 🎭 Nuevos Middlewares Disponibles

### 1. `requireRole(roleName)`
Requiere que el usuario tenga un rol específico.

```javascript
// Solo para administradores
router.get('/admin-panel', 
  authenticate,
  requireRole('admin'),
  adminController.dashboard
);

// Solo para usuarios regulares
router.get('/user-dashboard', 
  authenticate,
  requireRole('usuario'),
  userController.dashboard
);
```

### 2. `requireAnyRole([roles])`
Permite acceso si el usuario tiene cualquiera de los roles especificados.

```javascript
// Para administradores O usuarios regulares
router.get('/staff-area', 
  authenticate,
  requireAnyRole(['admin', 'usuario']),
  staffController.getArea
);

// Para cualquier tipo de usuario registrado
router.get('/member-content', 
  authenticate,
  requireAnyRole(['admin', 'usuario', 'usuario_social']),
  contentController.getMemberContent
);
```

### 3. `requirePermissionOrRole(permission, roles)`
Flexible: permite acceso si tiene el permiso específico O uno de los roles indicados.

```javascript
// Admin puede acceder sin permisos, otros necesitan el permiso
router.put('/users/:id', 
  authenticate,
  requirePermissionOrRole('update_user', 'admin'),
  userController.update
);

// Múltiples roles pueden acceder sin el permiso
router.get('/reports', 
  authenticate,
  requirePermissionOrRole('read_reports', ['admin', 'manager']),
  reportController.getReports
);
```

### 4. `requireAdmin()`
Atajo para `requireRole('admin')` - más directo para verificaciones de administrador.

```javascript
// Forma corta para verificar admin
router.delete('/system-config', 
  authenticate,
  requireAdmin(),
  systemController.deleteConfig
);
```

### 5. `requireAdminAccess()`
Permite acceso a administradores O usuarios con permiso `manage_system_config`.

```javascript
// Configuración del sistema: admin o con permiso específico
router.post('/system-settings', 
  authenticate,
  requireAdminAccess(),
  systemController.updateSettings
);
```

## 📋 Casos de Uso Comunes

### Protección por Jerarquía de Roles
```javascript
// Escalamiento de acceso según roles
router.get('/dashboard', authenticate, (req, res, next) => {
  const userRole = req.user.role;
  
  if (userRole === 'admin') {
    return adminController.getAdminDashboard(req, res);
  } else if (userRole === 'usuario') {
    return userController.getUserDashboard(req, res);
  } else {
    return socialController.getSocialDashboard(req, res);
  }
});
```

### Acceso Mixto (Roles + Permisos)
```javascript
// Los admin tienen acceso total, otros necesitan permisos específicos
router.post('/create-club', 
  authenticate,
  requirePermissionOrRole('create_club', 'admin'),
  clubController.create
);

router.delete('/club/:id', 
  authenticate,
  requirePermissionOrRole('delete_club', 'admin'),
  clubController.delete
);
```

### Verificación Condicional en Controladores
```javascript
const clubController = {
  async getClub(req, res) {
    try {
      const club = await Club.findByPk(req.params.id);
      
      // Obtener rol del usuario para determinar qué información mostrar
      const userRole = await Rol.findByPk(req.user.rolId);
      
      const response = {
        id: club.id,
        nombre: club.nombre,
        // Información básica para todos
      };
      
      // Información adicional solo para admin
      if (userRole.nombre === 'admin') {
        response.email = club.email;
        response.telefono = club.telefono;
        response.financialInfo = club.financialInfo;
      }
      
      // Información intermedia para usuarios regulares
      if (['admin', 'usuario'].includes(userRole.nombre)) {
        response.contacto = club.contacto;
        response.estadisticas = club.estadisticas;
      }
      
      res.json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
```

## 🔒 Estrategias de Seguridad

### 1. Principio de Menor Privilegio
```javascript
// ❌ Muy permisivo
router.get('/sensitive-data', 
  authenticate, // Solo autenticación
  dataController.getSensitive
);

// ✅ Específico y seguro
router.get('/sensitive-data', 
  authenticate,
  requireRole('admin'), // Solo administradores
  dataController.getSensitive
);
```

### 2. Defensa en Profundidad
```javascript
// Múltiples capas de verificación
router.delete('/critical-resource/:id',
  authenticate,                           // 1. Usuario autenticado
  requireAdmin(),                        // 2. Solo administradores
  requirePermission('delete_critical'),  // 3. Permiso específico adicional
  criticalController.delete
);
```

### 3. Acceso Escalable
```javascript
// Sistema que crece con nuevos roles
router.get('/content',
  authenticate,
  requireAnyRole(['admin', 'editor', 'moderator', 'usuario']),
  contentController.get
);

// Fácil agregar nuevos roles sin cambiar código
router.get('/management',
  authenticate,
  requireAnyRole(['admin', 'manager', 'supervisor']),
  managementController.panel
);
```

## 📊 Respuestas de Error

Los middlewares devuelven errores específicos según el tipo de verificación:

### Error de Rol
```json
{
  "error": "No tienes el rol necesario para realizar esta acción",
  "requiredRole": "admin",
  "userRole": "usuario"
}
```

### Error de Roles Múltiples
```json
{
  "error": "No tienes ninguno de los roles necesarios para realizar esta acción",
  "allowedRoles": ["admin", "manager"],
  "userRole": "usuario"
}
```

### Error de Permiso o Rol
```json
{
  "error": "No tienes el permiso ni el rol necesario para realizar esta acción",
  "requiredPermission": "create_club",
  "allowedRoles": ["admin"],
  "userRole": "usuario"
}
```

## 🧪 Testing

### Ejemplo de Tests
```javascript
describe('Role-based middleware', () => {
  it('should allow admin access', async () => {
    const req = { user: { rolId: 1 } }; // Admin role
    const res = mockResponse();
    const next = jest.fn();
    
    await requireRole('admin')(req, res, next);
    expect(next).toHaveBeenCalled();
  });
  
  it('should deny non-admin access', async () => {
    const req = { user: { rolId: 2 } }; // User role
    const res = mockResponse();
    const next = jest.fn();
    
    await requireRole('admin')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
```

## 💡 Mejores Prácticas

1. **Combina roles y permisos**: Usa `requirePermissionOrRole` para flexibilidad
2. **Roles jerárquicos**: Los admin siempre pueden acceder, otros roles según permisos
3. **Granularidad apropiada**: No todo necesita verificación por permiso, a veces el rol es suficiente
4. **Documentación clara**: Documenta qué roles pueden acceder a qué recursos
5. **Auditabilidad**: Las verificaciones por rol también quedan registradas en logs

## 🔄 Migración desde Solo Permisos

Si tienes rutas que solo usaban permisos:

```javascript
// Antes
router.get('/admin-panel', requirePermission('admin_access'), controller.panel);

// Después - más claro y eficiente
router.get('/admin-panel', requireAdmin(), controller.panel);

// O más flexible
router.get('/admin-panel', requireAdminAccess(), controller.panel);
```
