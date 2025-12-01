# Mejoras en el Manejo de Errores

Este documento describe las mejoras implementadas en el manejo de errores entre el frontend y backend para hacer los mensajes más amigables y útiles para los usuarios.

## Resumen de Mejoras

### 1. Sistema de Traducción de Errores (Frontend)

**Archivo**: `src/utils/errorMessages.ts`

- Sistema centralizado de traducción de errores técnicos a mensajes amigables en español
- Traducciones específicas por contexto (scan, move, create)
- Sugerencias de acción para cada tipo de error
- Soporte para mensajes ya en español del backend

**Características**:
- Detecta automáticamente si un mensaje ya está en español y es amigable
- Proporciona sugerencias de acción cuando es posible
- Traduce códigos de error técnicos a mensajes claros

### 2. Mensajes de Error Mejorados (Backend)

#### NotFoundError
- Mensajes específicos según el tipo de recurso (caja, tarja, cliente)
- Mensajes en español orientados al usuario
- Incluye el código o ID que no se encontró

**Ejemplos**:
- Antes: `Box not found: 1234567890123456`
- Ahora: `La caja con código 1234567890123456 no fue encontrada en el sistema`

#### ValidationError
- Mensajes mejorados para validación de códigos
- Explicaciones claras de qué está mal

**Ejemplos**:
- Antes: `Invalid box code: must be 16 digits`
- Ahora: `El código de caja debe tener exactamente 16 dígitos. Verifica que hayas escaneado el código completo`

### 3. Presentación de Errores (Backend)

**Archivo**: `src/interface-adapters/presenters/ErrorPresenter.js`

- Incluye información adicional en las respuestas de error:
  - `resource`: Tipo de recurso afectado
  - `id`: Identificador del recurso
  - `field`: Campo específico con error (para validaciones)

### 4. Visualización de Errores Mejorada (Frontend)

#### ScanContext
- Usa el sistema de traducción automáticamente
- Almacena tanto el mensaje como la sugerencia
- Proporciona errores más informativos

#### Componentes UI
- Muestran mensajes de error traducidos
- Incluyen sugerencias de acción cuando están disponibles
- Estilos mejorados para destacar sugerencias

**Ejemplo visual**:
```
⚠️ La caja con código 1234567890123456 no fue encontrada en el sistema
💡 El código de caja no existe en el sistema. Verifica que hayas escaneado correctamente
```

## Traducciones Implementadas

### Errores de Red
- `NETWORK_ERROR`: "Error de conexión con el servidor"
- `TIMEOUT_ERROR`: "Tiempo de espera agotado"

### Errores de Validación
- Códigos inválidos con explicaciones claras
- Mensajes específicos para cajas (16 dígitos) y tarjas (14 dígitos)

### Errores de No Encontrado
- Mensajes específicos para cajas y tarjas
- Sugerencias para verificar el código

### Errores de Conflicto
- Mensajes cuando un recurso ya existe
- Sugerencias para verificar duplicados

### Errores del Servidor
- Mensajes genéricos cuando hay errores internos
- Sugerencias para contactar al administrador

## Contextos de Operación

El sistema de traducción reconoce diferentes contextos:

### `scan`
- Operaciones de escaneo de códigos
- Mensajes específicos para códigos no encontrados o inválidos

### `move`
- Operaciones de movimiento de cajas/tarjas
- Mensajes sobre ubicaciones inválidas o códigos no encontrados

### `create`
- Operaciones de creación
- Mensajes sobre conflictos (códigos duplicados)

## Uso en el Código

### En el Frontend

```typescript
import { getUserFriendlyError, getErrorWithSuggestion } from '../utils/errorMessages';

// Obtener solo el mensaje
const errorMessage = getUserFriendlyError(error, 'scan');

// Obtener mensaje con sugerencia
const { message, suggestion } = getErrorWithSuggestion(error, 'scan');
```

### En el Backend

Los errores mejorados se usan automáticamente:

```javascript
// NotFoundError ahora produce mensajes amigables
throw new NotFoundError('Box', boxCode);
// Resultado: "La caja con código X no fue encontrada en el sistema"

// ValidationError con mensajes mejorados
throw new ValidationError('Invalid box code: must be 16 digits');
// Resultado: "El código de caja debe tener exactamente 16 dígitos..."
```

## Beneficios

1. **Mejor Experiencia de Usuario**: Mensajes claros y en español
2. **Acción Orientada**: Sugerencias de qué hacer cuando hay errores
3. **Consistencia**: Todos los errores siguen el mismo formato
4. **Mantenibilidad**: Sistema centralizado fácil de extender
5. **Contexto Específico**: Mensajes adaptados a la operación realizada

## Extensión Futura

Para agregar nuevas traducciones:

1. Agregar entrada en `ERROR_TRANSLATIONS` en `errorMessages.ts`
2. Agregar traducciones específicas por contexto en `CONTEXT_ERROR_MESSAGES` si aplica
3. Los mensajes del backend ya mejorados se usarán automáticamente

## Notas Técnicas

- El sistema detecta automáticamente si un mensaje ya está en español
- Las traducciones tienen prioridad: contexto > código de error > patrón de mensaje > mensaje original
- Los mensajes del backend mejorados tienen prioridad sobre traducciones genéricas

