# API de estaciones YPF

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.19.0-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
![Versión](https://img.shields.io/badge/versi%C3%B3n-1.0.0-blue)

API REST desarrollada con Express y MongoDB para consultar y administrar documentos de estaciones. Permite listar, buscar, crear, actualizar y eliminar estaciones almacenadas en la colección `Ypf` de la base de datos `Ypf`.

> La implementación no define una estructura completa para las estaciones: solo exige `id` y `nombre` al crear; los demás campos dependen de los documentos que se almacenen.

## Índice

- [Introducción, objetivos y alcance](#introducción-objetivos-y-alcance)
- [Tecnologías y requisitos previos](#tecnologías-y-requisitos-previos)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Instalación y ejecución local](#instalación-y-ejecución-local)
- [Configuración](#configuración)
- [Uso de la API](#uso-de-la-api)
- [Resumen de endpoints](#resumen-de-endpoints)
- [Detalle de endpoints](#detalle-de-endpoints)
- [Datos y modelos](#datos-y-modelos)
- [Limitaciones conocidas](#limitaciones-conocidas)
- [Licencia](#licencia)

## Introducción, objetivos y alcance

Este proyecto ofrece una API HTTP para que una aplicación cliente —por ejemplo, un frontend— pueda leer y mantener registros de estaciones en MongoDB. Esta guía está dirigida a quienes desarrollan, ejecutan o integran esa API; documenta su configuración local y el contrato observable en el código.

La API expone una ruta de comprobación y operaciones CRUD para estaciones. No incluye interfaz gráfica, carga inicial de datos, reglas de negocio adicionales ni una especificación de campos de estación más allá de lo que se indica en [Datos y modelos](#datos-y-modelos). Tampoco hay una URL de producción definida en el repositorio.

## Tecnologías y requisitos previos

- Node.js **20.19.0 o posterior**, requisito del controlador MongoDB fijado en el archivo de dependencias.
- npm, incluido con Node.js.
- Una instancia de MongoDB accesible mediante una URI. Puede ser local o un servicio remoto compatible; el código no exige MongoDB Atlas.
- Acceso de red desde la aplicación a esa instancia.

Tecnologías y versiones declaradas en el proyecto:

- Express `5.3.0`
- Controlador `mongodb` `7.7.0`
- `dotenv` `18.0.8`
- `nodemon` `3.1.14` (desarrollo)
- CommonJS

No se requiere un servicio externo aparte de MongoDB. No se declara una versión de MongoDB servidor ni se incluye un servicio de base de datos en el proyecto.

## Estructura del proyecto

```text
Backend-2da-Entrega/
├── src/
│   └── mongodb.js       # Conexión y desconexión del cliente MongoDB
├── .env.example         # Plantilla de variables de entorno
├── .gitignore           # Excluye node_modules/ y .env
├── package.json         # Dependencias y scripts npm
├── package-lock.json    # Versiones resueltas de dependencias
├── server.js            # Aplicación Express y rutas de la API
└── README.md
```

## Instalación y ejecución local

1. Clona el repositorio usando la URL que te haya proporcionado el equipo:

   ```sh
   git clone <URL-del-repositorio> Backend-2da-Entrega-main
   cd Backend-2da-Entrega-main
   ```

   Si ya tienes una copia del proyecto, abre una terminal en su directorio raíz.

2. Instala las dependencias:

   ```sh
   npm ci
   ```

3. Crea el archivo local de configuración a partir de la plantilla. En PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

   En macOS o Linux:

   ```sh
   cp .env.example .env
   ```

4. Edita `.env` y configura al menos `MONGO_URI`, según la sección [Configuración](#configuración).

5. Inicia el servidor:

   ```sh
   npm start
   ```

   El servidor informa en consola la dirección local. Si no se configura `PORT`, escucha en `http://localhost:3008`.

Para desarrollo, el script `npm run dev` inicia `nodemon server.js` y reinicia el servidor al detectar cambios.

El proyecto no tiene un proceso de importación o carga de datos iniciales. La colección puede estar vacía al comenzar; en ese caso, el listado devuelve `[]`. MongoDB crea la base o colección cuando se inserta el primer documento si aún no existen.

> `npm test` no ejecuta una suite: el script definido termina con error e indica que no hay pruebas especificadas.

## Configuración

El servidor carga variables desde `.env` mediante `dotenv`. La plantilla `.env.example` contiene estas dos variables:

| Variable | Uso | Valor por defecto |
|---|---|---|
| `PORT` | Puerto HTTP en el que escucha Express. | `3008` si está vacía o no se define. |
| `MONGO_URI` | URI utilizada por el controlador para conectarse a MongoDB. | No hay valor por defecto útil; configúrala. |

Ejemplo para una instancia local sin credenciales (ajusta el host, puerto o autenticación a tu entorno):

```dotenv
PORT=3008
MONGO_URI=mongodb://localhost:27017
```

La base de datos y la colección no son variables de entorno: ambas están fijadas como `Ypf` en el código. Si usas un proveedor remoto, configura la URI que te haya entregado tu equipo o proveedor; no guardes credenciales reales en el repositorio. `.env` está excluido por `.gitignore`.

El proceso HTTP puede arrancar sin una URI válida, pero las operaciones que consultan o modifican MongoDB fallarán con `500`. No se valida la conexión al iniciar el servidor.

## Uso de la API

- **URL base local:** `http://localhost:3008`, salvo que configures otro `PORT`.
- **Prefijo de versión:** no hay. Las rutas se sirven directamente en `/`.
- **Formato:** las operaciones con cuerpo reciben JSON; Express configura `express.json()`. Las respuestas de recursos y errores son JSON, excepto la respuesta de comprobación `GET /`, que es texto plano.
- **Autenticación:** no está implementada; no se requiere token ni credencial HTTP.
- **CORS:** no hay middleware ni política CORS configurada. Un frontend servido desde otro origen necesitará una configuración CORS/proxy que esta API no proporciona.

Los ejemplos de solicitudes usan la URL local predeterminada `http://localhost:3008`; si configuraste otro puerto, reemplázala por tu URL base. Se usa `curl`; en Windows PowerShell, escribe `curl.exe` para invocar el ejecutable de curl en lugar del alias `Invoke-WebRequest`.

## Resumen de endpoints

| Método HTTP | Ruta | URL base o ejemplo de URL | Propósito | Parámetros principales | Respuestas posibles |
|---|---|---|---|---|---|
| GET | `/` | `<BASE_URL>/` | Comprobar que el servidor responde. | Ninguno. | `200 OK`, `400 Bad Request`* |
| GET | `/estaciones` | `<BASE_URL>/estaciones` | Listar todas las estaciones. | Ninguno. | `200 OK`, `400 Bad Request`*, `500 Internal Server Error` |
| GET | `/estaciones/:id` | `<BASE_URL>/estaciones/12` | Buscar una estación por `id`. | Ruta: `id`. | `200 OK`, `400 Bad Request`*, `404 Not Found`, `500 Internal Server Error` |
| POST | `/estaciones` | `<BASE_URL>/estaciones` | Crear una estación. | Cuerpo JSON: `id` y `nombre` truthy. | `201 Created`, `400 Bad Request`, `500 Internal Server Error` |
| PUT | `/estaciones/:id` | `<BASE_URL>/estaciones/12` | Actualizar campos de una estación existente. | Ruta: `id`; cuerpo JSON con cambios. | `200 OK`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error` |
| DELETE | `/estaciones/:id` | `<BASE_URL>/estaciones/12` | Eliminar una estación existente. | Ruta: `id`. | `200 OK`, `400 Bad Request`*, `404 Not Found`, `500 Internal Server Error` |

Las respuestas `400` de `POST` corresponden a los campos obligatorios ausentes o falsy. `express.json()` se ejecuta antes de todas las rutas: si una solicitud incluye un cuerpo con `Content-Type: application/json` mal formado, cualquier endpoint puede responder `400`* con el error genérico documentado al final. Las operaciones de base de datos devuelven `500` cuando se produce un error. Una ruta no implementada responde `404` con el formato genérico documentado al final.

## Detalle de endpoints

### `GET /`

Comprobación simple de que el servidor está disponible. No accede a MongoDB.

**Solicitud**

```sh
curl -i "http://localhost:3008/"
```

**Respuesta `200 OK`** (`text/html; charset=utf-8`):

```text
API funcionando correctamente 🚀
```

No define parámetros, cuerpo ni respuestas de error propios.

Como en las demás rutas, un cuerpo JSON mal formado recibido con `Content-Type: application/json` se rechaza antes de llegar al handler y devuelve `400` con el formato genérico descrito al final.

### `GET /estaciones`

Devuelve todos los documentos de la colección `Ypf`. No admite filtros ni paginación.

**Solicitud**

```sh
curl -i "http://localhost:3008/estaciones"
```

**Respuesta `200 OK`**: arreglo de documentos. Si no hay documentos, devuelve `[]`. Ejemplo representativo:

```json
[
  {
    "_id": "65f32a0fd58c2e2b7a4c1201",
    "id": 12,
    "nombre": "Estación de ejemplo"
  }
]
```

`_id` es el identificador que MongoDB agrega al documento; el valor mostrado es ilustrativo. La API no define otros campos de estación.

**Respuesta `500 Internal Server Error`**:

```json
{
  "error": "Error al obtener las estaciones"
}
```

Se produce ante un error al conectar o consultar MongoDB.

Un cuerpo JSON mal formado recibido con `Content-Type: application/json` también produce `400` antes de ejecutar la consulta.

### `GET /estaciones/:id`

Busca un documento por su campo `id`. La ruta se convierte a número antes de consultar MongoDB; envía el identificador numérico usado al crear el documento.

**Parámetros**

- `id` (ruta, requerido): identificador convertible a número.
- No hay parámetros de consulta ni cuerpo.

**Solicitud**

```sh
curl -i "http://localhost:3008/estaciones/12"
```

**Respuesta `200 OK`**: el documento encontrado, por ejemplo:

```json
{
  "_id": "65f32a0fd58c2e2b7a4c1201",
  "id": 12,
  "nombre": "Estación de ejemplo"
}
```

**Respuesta `404 Not Found`**, cuando no hay un documento con ese `id`:

```json
{
  "error": "404",
  "mensaje": "Estación no encontrada"
}
```

**Respuesta `500 Internal Server Error`**, si falla la operación de MongoDB:

```json
{
  "error": "Error al buscar la estación"
}
```

Un cuerpo JSON mal formado recibido con `Content-Type: application/json` también produce `400` antes de ejecutar la búsqueda.

### `POST /estaciones`

Inserta el objeto JSON recibido en la colección. El código exige que `id` y `nombre` existan y sean truthy. Para que la búsqueda por ruta coincida, se recomienda enviar `id` como número. No hay un esquema que valide otros campos.

**Cuerpo requerido** (`Content-Type: application/json`):

```json
{
  "id": 12,
  "nombre": "Estación de ejemplo"
}
```

**Solicitud**

```sh
curl -i -X POST "http://localhost:3008/estaciones" -H "Content-Type: application/json" -d "{\"id\":12,\"nombre\":\"Estación de ejemplo\"}"
```

**Respuesta `201 Created`**:

```json
{
  "mensaje": "Estación creada exitosamente ✅ ",
  "estacion": {
    "id": 12,
    "nombre": "Estación de ejemplo"
  }
}
```

El objeto de respuesta es el recibido; el `_id` que MongoDB genera no se añade a esta respuesta.

**Respuesta `400 Bad Request`**, si falta `id` o `nombre`, o si cualquiera es falsy:

```json
{
  "error": "400",
  "mensaje": "Faltan campos obligatorios (id, nombre)"
}
```

Un cuerpo JSON mal formado también produce `400`:

```json
{
  "error": "400",
  "mensaje": "Solicitud inválida"
}
```

**Respuesta `500 Internal Server Error`**, si falla la inserción:

```json
{
  "error": "Error al insertar la estación"
}
```

### `PUT /estaciones/:id`

Aplica los campos del cuerpo mediante `$set` al documento cuyo campo `id` coincide con el parámetro numérico. El código no valida campos obligatorios ni restringe qué campos pueden actualizarse.

**Parámetros y cuerpo**

- `id` (ruta, requerido): identificador convertido a número.
- Cuerpo JSON con los campos que se desean establecer; por ejemplo:

  ```json
  {
    "nombre": "Estación actualizada"
  }
  ```

**Solicitud**

```sh
curl -i -X PUT "http://localhost:3008/estaciones/12" -H "Content-Type: application/json" -d "{\"nombre\":\"Estación actualizada\"}"
```

**Respuesta `200 OK`**, si el documento existe:

```json
{
  "mensaje": "Estación actualizada exitosamente ⚡",
  "id": 12,
  "cambios": {
    "nombre": "Estación actualizada"
  }
}
```

La respuesta indica que el documento coincidió; no informa si los valores cambiaron efectivamente.

**Respuesta `404 Not Found`**, si no hay un documento con ese `id`:

```json
{
  "error": "404",
  "mensaje": "No se encontró la estación para actualizar"
}
```

**Respuesta `400 Bad Request`** para JSON mal formado:

```json
{
  "error": "400",
  "mensaje": "Solicitud inválida"
}
```

**Respuesta `500 Internal Server Error`**, si falla la operación:

```json
{
  "error": "Error al actualizar la estación ❌"
}
```

### `DELETE /estaciones/:id`

Elimina el primer documento cuyo campo `id` coincida con el parámetro convertido a número.

**Parámetros**

- `id` (ruta, requerido): identificador convertible a número.
- No hay cuerpo ni parámetros de consulta.

**Solicitud**

```sh
curl -i -X DELETE "http://localhost:3008/estaciones/12"
```

**Respuesta `200 OK`**, si se eliminó un documento:

```json
{
  "mensaje": "Estación eliminada exitosamente 🗑️",
  "id": 12
}
```

**Respuesta `404 Not Found`**, si no se encontró un documento con ese `id`:

```json
{
  "error": "404",
  "mensaje": "No se encontró la estación para eliminar"
}
```

**Respuesta `500 Internal Server Error`**, si falla la operación:

```json
{
  "error": "Error al eliminar la estación ❌"
}
```

Como el parser JSON está instalado globalmente, un cuerpo JSON mal formado recibido con `Content-Type: application/json` en esta solicitud también produce `400` antes de ejecutar la eliminación.

### Ruta no implementada o JSON inválido

Las rutas no definidas —y las combinaciones de método y ruta que no coinciden con un endpoint— responden `404 Not Found`:

```json
{
  "error": "404",
  "mensaje": "Ruta no encontrada"
}
```

El JSON mal formado enviado a rutas que procesan cuerpo se responde con `400 Bad Request`:

```json
{
  "error": "400",
  "mensaje": "Solicitud inválida"
}
```

## Datos y modelos

No existe un esquema formal de MongoDB ni una definición de modelo en el repositorio. Los documentos son objetos flexibles en la colección `Ypf`; al crear, la aplicación solo comprueba que `id` y `nombre` sean truthy:

| Campo | Requisito observado | Uso |
|---|---|---|
| `id` | Obligatorio al crear según una comprobación de valor truthy. Se recomienda número. | Se convierte a número desde la ruta y se usa para buscar, actualizar o eliminar. |
| `nombre` | Obligatorio al crear según una comprobación de valor truthy. | Campo descriptivo; no hay validación de tipo o formato. |
| `_id` | Lo agrega MongoDB al insertar cuando no se proporciona. | Identificador propio del documento MongoDB; no se usa en las rutas de esta API. |
| Otros campos | No están definidos por el proyecto. | Se conservan en MongoDB y pueden establecerse mediante `POST` o `$set` en `PUT`. |

La colección no declara unicidad para `id`; por tanto, la implementación no garantiza que sea único. Los endpoints por `id` operan sobre un documento coincidente (y `DELETE` elimina uno).
