# Integración de API - Código Escaneado

Esta documentación describe cómo utilizar la estructura de API implementada para el endpoint `/getInfoFromScannedCode`.

## 📁 Estructura de Archivos

```
src/
├── api/
│   ├── types.ts              # Tipos TypeScript
│   ├── apiClient.ts          # Cliente HTTP genérico
│   ├── endpoints.ts          # Endpoints específicos
│   ├── hooks/
│   │   └── useScannedCode.ts # Custom hooks
│   └── index.ts              # Exportaciones principales
├── utils/
│   └── validators.ts         # Validadores de códigos
└── components/
    └── CodeScanner/          # Componente de ejemplo
```

## 🔧 Configuración

### Variables de Entorno

Añade la URL base de tu API en `.env`:

```env
REACT_APP_API_BASE_URL=http://localhost:3000/api
```

### Tipos de Respuesta

El endpoint espera códigos válidos:
- **Código de Caja**: 15 dígitos (ej: `123456789012345`)
- **Código de Pallet**: 12 dígitos (ej: `123456789012`)

## 🚀 Uso Básico

### 1. Usando el Hook (Recomendado)

```tsx
import React, { useState } from 'react';
import { useScannedCode } from '../api';

const MyComponent = () => {
  const [code, setCode] = useState('');
  const { data, loading, error, getCodeInfo, reset } = useScannedCode();

  const handleScan = async () => {
    await getCodeInfo(code);
  };

  return (
    <div>
      <input 
        value={code} 
        onChange={(e) => setCode(e.target.value)}
        placeholder="Ingrese código de 12 o 15 dígitos"
      />
      <button onClick={handleScan} disabled={loading}>
        {loading ? 'Procesando...' : 'Escanear'}
      </button>
      
      {error && <div className="error">{error}</div>}
      
      {data && (
        <div>
          <h3>Información del Código</h3>
          <p><strong>Tipo:</strong> {data.tipo}</p>
          <p><strong>Estado:</strong> {data.estado}</p>
          {data.producto && (
            <p><strong>Producto:</strong> {data.producto.nombre}</p>
          )}
        </div>
      )}
    </div>
  );
};
```

### 2. Usando los Endpoints Directamente

```tsx
import { getScannedCodeInfo, ApiClientError } from '../api';

const fetchCodeData = async (codigo: string) => {
  try {
    const data = await getScannedCodeInfo(codigo);
    console.log('Información del código:', data);
    return data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error('Error de API:', error.message);
      // Manejo específico según error.code
    } else {
      console.error('Error desconocido:', error);
    }
  }
};
```

### 3. Hook para Fetch Único

```tsx
import { useScannedCodeFetch } from '../api';

const QuickScanComponent = () => {
  const { fetchCodeInfo, loading } = useScannedCodeFetch();

  const handleQuickScan = async (code: string) => {
    try {
      const result = await fetchCodeInfo(code);
      if (result) {
        console.log('Resultado:', result);
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  return (
    <button onClick={() => handleQuickScan('123456789012345')}>
      {loading ? 'Cargando...' : 'Scan Rápido'}
    </button>
  );
};
```

## 🔍 Validaciones

### Validación Automática

Los endpoints incluyen validación automática:

```tsx
import { validateScannedCode } from '../api';

const validation = validateScannedCode('123456789012345');
if (validation.isValid) {
  console.log('Tipo:', validation.type); // 'box' | 'pallet'
} else {
  console.error('Error:', validation.errorMessage);
}
```

### Utilidades de Formato

```tsx
import { formatCodeForDisplay, sanitizeCode } from '../api';

// Formatear para mostrar
const formatted = formatCodeForDisplay('123456789012345');
console.log(formatted); // "12345-67890-12345"

// Limpiar entrada del usuario
const clean = sanitizeCode('12345-67890-12345');
console.log(clean); // "123456789012345"
```

## 🛠️ Configuración Avanzada

### Configuración del Cliente HTTP

```tsx
import { apiClient } from '../api';

// Request con configuración personalizada
const customRequest = await apiClient.get('/customEndpoint', {
  param1: 'value1'
}, {
  timeout: 15000,  // 15 segundos
  retries: 5,      // 5 reintentos
  headers: {
    'Authorization': 'Bearer token'
  }
});
```

### Manejo de Errores

```tsx
import { ApiClientError } from '../api';

try {
  const data = await getScannedCodeInfo(codigo);
} catch (error) {
  if (error instanceof ApiClientError) {
    switch (error.code) {
      case 'VALIDATION_ERROR':
        // Error de validación del cliente
        break;
      case 'NETWORK_ERROR':
        // Error de red
        break;
      case 404:
        // Código no encontrado
        break;
      default:
        // Otros errores
    }
  }
}
```

## 📊 Tipos de Datos

### Respuesta del Código Escaneado

```typescript
interface ScannedCodeInfo {
  codigo: string;
  tipo: 'caja' | 'pallet';
  producto?: {
    id: string;
    nombre: string;
    descripcion?: string;
  };
  ubicacion?: {
    almacen: string;
    zona: string;
    posicion?: string;
  };
  estado: 'activo' | 'inactivo' | 'bloqueado';
  fechaCreacion: string;
  ultimaActualizacion: string;
  informacionAdicional?: Record<string, unknown>;
}
```

## 🎯 Mejores Prácticas

### 1. Usar TypeScript
Siempre importa y usa los tipos definidos:

```tsx
import type { ScannedCodeInfo } from '../api';

const [data, setData] = useState<ScannedCodeInfo | null>(null);
```

### 2. Manejo de Loading States
Siempre maneja los estados de carga:

```tsx
const { loading, getCodeInfo } = useScannedCode();

return (
  <button disabled={loading} onClick={() => getCodeInfo(code)}>
    {loading ? 'Procesando...' : 'Escanear'}
  </button>
);
```

### 3. Validación del Cliente
Valida antes de enviar requests:

```tsx
import { isValidBoxCode, isValidPalletCode } from '../api';

const isValid = isValidBoxCode(code) || isValidPalletCode(code);
if (!isValid) {
  // Mostrar error al usuario
  return;
}
```

### 4. Reset de Estados
Resetea estados cuando sea necesario:

```tsx
const { reset } = useScannedCode();

const handleClear = () => {
  setCode('');
  reset(); // Limpia data, loading, y error
};
```

## 🔄 Extensión

### Agregar Nuevos Endpoints

1. **Tipos** (`src/api/types.ts`):
```typescript
export interface NewEndpointRequest {
  param: string;
}

export interface NewEndpointResponse {
  result: string;
}
```

2. **Endpoint** (`src/api/endpoints.ts`):
```typescript
export const newEndpoint = async (
  request: NewEndpointRequest
): Promise<ApiResponse<NewEndpointResponse>> => {
  return await apiClient.post('/newEndpoint', request);
};
```

3. **Hook** (`src/api/hooks/useNewEndpoint.ts`):
```typescript
export const useNewEndpoint = () => {
  // Implementar lógica similar
};
```

4. **Exportar** (`src/api/index.ts`):
```typescript
export { newEndpoint, useNewEndpoint } from './endpoints';
```

Esta estructura garantiza código limpio, mantenible y escalable siguiendo principios de clean code. 