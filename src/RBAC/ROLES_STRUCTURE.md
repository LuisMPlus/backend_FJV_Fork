# Estructura de Roles del Sistema RBAC

## 📋 Roles Definidos en el Sistema

### 🏛️ **Roles Base del Sistema**

| ID | Nombre | Descripción | Permisos Asignados |
|----|--------|-------------|-------------------|
| **1** | `admin` | Administrador del sistema | **TODOS** (30 permisos) |
| **2** | `usuario` | Usuario regular | *Sin permisos específicos* |
| **3** | `usuario_social` | Usuario de redes sociales | *Sin permisos específicos* |

### 🎯 **Roles Específicos por Área**

| ID | Nombre | Descripción | Cantidad de Permisos |
|----|--------|-------------|---------------------|
| **4** | `gestor_contenido` | Responsable de contenidos | **10 permisos** |
| **5** | `gestor_rrhh` | Encargado de gestión de usuarios | **12 permisos** |
| **6** | `gestor_financiero` | Responsable financiero | **6 permisos** |

---

## 🔐 Detalle de Permisos por Rol

### **Rol ID: 4 - `gestor_contenido`**
**Responsabilidad:** Gestión de contenidos (clubes, noticias, información)

**Permisos (10):**
- `create_club` - Crear clubes
- `read_club` - Ver información de clubes
- `update_club` - Actualizar clubes
- `delete_club` - Eliminar clubes
- `create_noticia` - Crear noticias
- `read_noticia` - Ver noticias
- `update_noticia` - Actualizar noticias
- `delete_noticia` - Eliminar noticias
- `publish_noticia` - Publicar noticias
- `read_equipo` - Ver información de equipos

### **Rol ID: 5 - `gestor_rrhh`**
**Responsabilidad:** Gestión de recursos humanos y equipos

**Permisos (12):**
- `create_user` - Crear usuarios
- `read_user` - Ver usuarios
- `update_user` - Actualizar usuarios
- `delete_user` - Eliminar usuarios
- `create_persona` - Crear personas
- `read_persona` - Ver personas
- `update_persona` - Actualizar personas
- `delete_persona` - Eliminar personas
- `create_equipo` - Crear equipos
- `read_equipo` - Ver equipos
- `update_equipo` - Actualizar equipos
- `delete_equipo` - Eliminar equipos

### **Rol ID: 6 - `gestor_financiero`**
**Responsabilidad:** Gestión financiera y configuración básica del sistema

**Permisos (6):**
- `create_pago` - Crear pagos
- `read_pago` - Ver pagos
- `update_pago` - Actualizar pagos
- `delete_pago` - Eliminar pagos
- `manage_system_config` - Gestionar configuración del sistema
- `read_system_logs` - Ver logs del sistema

---

## 🚀 Uso en Código

### **Por ID de Rol:**
```javascript
// Verificar por ID específico
const isAdmin = req.user.rolId === 1;
const isContentManager = req.user.rolId === 4;
const isHRManager = req.user.rolId === 5;
const isFinanceManager = req.user.rolId === 6;
```

### **Por Nombre de Rol:**
```javascript
// Usar middlewares específicos
router.get('/admin-panel', requireRole('admin'), controller.admin);
router.get('/content-management', requireRole('gestor_contenido'), controller.content);
router.get('/hr-panel', requireRole('gestor_rrhh'), controller.hr);
router.get('/finance-panel', requireRole('gestor_financiero'), controller.finance);
```

### **Acceso Combinado:**
```javascript
// Permitir acceso a múltiples roles
router.get('/management-area', 
  requireAnyRole(['admin', 'gestor_contenido', 'gestor_rrhh', 'gestor_financiero']),
  controller.management
);

// Admin o con permiso específico
router.post('/create-club', 
  requirePermissionOrRole('create_club', 'admin'),
  controller.createClub
);
```

---

## 📊 Estadísticas del Sistema

- **Total de roles:** 6
- **Roles con permisos específicos:** 4 (admin + 3 gestores)
- **Total de permisos únicos:** 30
- **Permisos asignados:** 58 (30 al admin + 28 a gestores)

---

## 🔄 Auto-Increment Sequence

Los roles siguen el orden de inserción:

1. **ID 1-3:** Roles base del sistema (admin, usuario, usuario_social)
2. **ID 4-6:** Roles específicos por área (gestor_contenido, gestor_rrhh, gestor_financiero)

Si necesitas agregar más roles, comenzarán desde el **ID 7** en adelante.

---

## 🛠️ Scripts de Gestión

### **Crear/Actualizar Roles:**
```bash
node src/scripts/seed-roles-with-permissions.js
```

### **Verificar Roles Actuales:**
```bash
node src/scripts/seed-roles-with-permissions.js check
```

### **Asignar Todos los Permisos al Admin:**
```bash
node src/scripts/assign-admin-permissions.js
```

---

## 💡 Recomendaciones de Uso

1. **Admin (ID: 1):** Usar para superusuarios con acceso total
2. **Gestores (ID: 4-6):** Asignar según el área de responsabilidad
3. **Usuario regular (ID: 2):** Para usuarios finales sin permisos administrativos
4. **Usuario social (ID: 3):** Para usuarios que se registran via OAuth

### **Jerarquía Recomendada:**
```
Admin (ID: 1)
├── Gestores Especializados (ID: 4-6)
└── Usuarios Regulares (ID: 2-3)
```

Esta estructura permite un control granular y escalable del acceso a las funcionalidades del sistema.
