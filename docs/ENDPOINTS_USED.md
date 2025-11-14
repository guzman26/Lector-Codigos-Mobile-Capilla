# Endpoints Usados por el Frontend

Este documento describe qué endpoints de Lambda está usando el frontend y cómo se mapean a las funciones del frontend.

## Endpoints Principales

### 1. `/inventory` - Operaciones de Inventario

#### Box Operations
- **GET** - `consolidatedApi.inventory.box.get(params)` 
  - Obtener información de una caja por código
  - Usado en: `getInfoFromScannedCode()`
  - Request: `{ resource: 'box', action: 'get', params: { codigo } }`

- **CREATE** - `consolidatedApi.inventory.box.create(params)`
  - Crear una nueva caja
  - Usado en: `registerBox()`
  - Request: `{ resource: 'box', action: 'create', params: { codigo, calibre, formato, empresa, ubicacion, operario } }`

- **MOVE** - `consolidatedApi.inventory.box.move(params)`
  - Mover una caja a otra ubicación
  - Usado en: `processScan()` para cajas
  - Request: `{ resource: 'box', action: 'move', params: { codigo, ubicacion } }`
  - Ubicaciones válidas: `PACKING`, `BODEGA`, `VENTA`, `TRANSITO`

- **UPDATE** - `consolidatedApi.inventory.box.update(params)`
  - Actualizar una caja
  - Disponible pero no usado actualmente en el frontend

- **UNASSIGN** - `consolidatedApi.inventory.box.unassign(params)`
  - Desasignar una caja de su pallet
  - Disponible pero no usado actualmente en el frontend

- **DELETE** - `consolidatedApi.inventory.box.delete(params)`
  - Eliminar una caja
  - Disponible pero no usado actualmente en el frontend

#### Pallet Operations
- **GET** - `consolidatedApi.inventory.pallet.get(params)`
  - Obtener información de un pallet por código
  - Usado en: `getInfoFromScannedCode()`, `getPalletDetails()`
  - Request: `{ resource: 'pallet', action: 'get', params: { codigo } }`

- **CREATE** - `consolidatedApi.inventory.pallet.create(params)`
  - Crear un nuevo pallet
  - Usado en: `createPallet()`
  - Request: `{ resource: 'pallet', action: 'create', params: { codigo, maxBoxes, ubicacion } }`

- **MOVE** - `consolidatedApi.inventory.pallet.move(params)`
  - **MOVER PALLET DE TRANSITO A BODEGA** ✅
  - Mover un pallet (y todas sus cajas) a otra ubicación
  - Usado en: `processScan()` para pallets
  - Request: `{ resource: 'pallet', action: 'move', params: { codigo, ubicacion } }`
  - Ubicaciones válidas: `PACKING`, `TRANSITO`, `BODEGA`, `PREVENTA`, `VENTA`
  - **Funcionalidad principal**: Mover pallets de TRANSITO a BODEGA está completamente implementado

- **CLOSE** - `consolidatedApi.inventory.pallet.close(params)`
  - Cerrar un pallet (prevenir adición de más cajas)
  - Disponible pero no usado actualmente en el frontend

- **UPDATE** - `consolidatedApi.inventory.pallet.update(params)`
  - Actualizar un pallet
  - Disponible pero no usado actualmente en el frontend

- **CREATE_SINGLE_BOX_PALLET** - `consolidatedApi.inventory.pallet.createSingleBoxPallet(params)`
  - Crear un pallet individual para una sola caja
  - Disponible pero no usado actualmente en el frontend

- **DELETE** - `consolidatedApi.inventory.pallet.delete(params)`
  - Eliminar un pallet
  - Disponible pero no usado actualmente en el frontend

### 2. `/admin` - Operaciones Administrativas

#### Issue Operations
- **CREATE** - `consolidatedApi.admin.issue.create(params)`
  - Crear un reporte de problema
  - Usado en: `postIssue()`
  - Request: `{ resource: 'issue', action: 'create', params: { descripcion, boxCode?, type?, ubicacion? } }`

### 3. `/health` - Health Check

- **GET** - `apiClient.get('/health')`
  - Verificar estado del servicio
  - Usado en: `healthCheck()`

## Funciones del Frontend

### Funciones Principales Usadas

1. **`processScan(request: ProcessScanRequest)`**
   - Función principal para procesar escaneos de cajas y pallets
   - Llama a: `consolidatedApi.inventory[resource].move()`
   - Soporta mover tanto cajas como pallets a diferentes ubicaciones
   - **✅ Soporta mover pallets de TRANSITO a BODEGA**

2. **`getInfoFromScannedCode(request: GetInfoFromScannedCodeRequest)`**
   - Obtener información de un código escaneado (caja o pallet)
   - Llama a: `consolidatedApi.inventory[resource].get()`

3. **`postIssue(request: PostIssueRequest)`**
   - Reportar un problema
   - Llama a: `consolidatedApi.admin.issue.create()`

4. **`registerBox(request: RegisterBoxRequest)`**
   - Registrar una nueva caja
   - Llama a: `consolidatedApi.inventory.box.create()`

5. **`createPallet(codigo: string, maxBoxes?: number)`**
   - Crear un nuevo pallet
   - Llama a: `consolidatedApi.inventory.pallet.create()`

6. **`getPalletDetails(codigo: string)`**
   - Obtener detalles de un pallet incluyendo información de cajas
   - Llama a: `consolidatedApi.inventory.pallet.get()`

## Ejemplo: Mover Pallets de TRANSITO a BODEGA

```typescript
// En el componente RecibirCaja.tsx
await processScan({
  codigo: '12345678901234', // Código del pallet
  ubicacion: 'BODEGA',       // Destino
  tipo: 'PALLET'            // Opcional, se detecta automáticamente
});

// Esto llama internamente a:
// consolidatedApi.inventory.pallet.move({
//   codigo: '12345678901234',
//   ubicacion: 'BODEGA'
// })

// Que envía a Lambda:
// POST /inventory
// {
//   "resource": "pallet",
//   "action": "move",
//   "params": {
//     "codigo": "12345678901234",
//     "ubicacion": "BODEGA"
//   }
// }
```

## Validaciones

### Ubicaciones Válidas para Boxes
- `PACKING`
- `BODEGA`
- `VENTA`
- `TRANSITO`

### Ubicaciones Válidas para Pallets
- `PACKING`
- `TRANSITO`
- `BODEGA`
- `PREVENTA`
- `VENTA`

## Notas Importantes

1. **Mover Pallets de TRANSITO a BODEGA**: ✅ **FUNCIONALIDAD COMPLETAMENTE IMPLEMENTADA**
   - El frontend usa `processScan()` con `ubicacion: 'BODEGA'`
   - Lambda maneja el movimiento correctamente con `MovePallet.useCase`
   - Se mueven todas las cajas del pallet automáticamente

2. **Detección Automática**: El frontend detecta automáticamente si el código es de caja o pallet basándose en la longitud del código.

3. **Confirmación de Pallets**: Cuando se escanea un pallet, se muestra un modal de confirmación antes de procesar.

4. **Historial**: Los escaneos se guardan en el historial del contexto `ScanContext`.

## Archivos Relacionados

- `src/api/endpoints.ts` - Funciones wrapper que llaman a la API consolidada
- `src/api/consolidatedClient.ts` - Cliente API consolidado que llama a los endpoints de Lambda
- `src/api/apiClient.ts` - Cliente HTTP base con manejo de errores y retries
- `src/context/ScanContext.tsx` - Contexto React para manejar escaneos
- `src/views/Scanning/RecibirCajaEnBodega/RecibirCaja.tsx` - Componente principal para recibir pallets/cajas en bodega

