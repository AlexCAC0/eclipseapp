# 🌑 Eclipse Studio APP - Task Workspace (Notion Style)

Una aplicación de gestión de tareas estilo **Notion** con paleta de colores **roja y negra** (Dark & Crimson Red), sincronizada en la nube con **Firebase Realtime Database** en tiempo real.

---

## ⚡ Sincronización en la Nube con Firebase

La app se actualiza instantáneamente en todos los dispositivos usando **Firebase Realtime Database**.

### 🛠️ Pasos para conectar tu base de datos (Gratis en 2 minutos):

1. Ve a **[Firebase Console](https://console.firebase.google.com/)** e inicia sesión con tu cuenta de Google.
2. Haz clic en **"Crear un proyecto"** (nómbralo `Eclipse Studio` o el nombre que prefieras).
3. En el menú lateral izquierdo:
   - Ve a **Compilación > Realtime Database** y haz clic en **"Crear base de datos"**.
   - Elige la ubicación predeterminada y selecciona **Modo de prueba** (permite lectura y escritura inmediata).
4. Ve a la **Configuración del proyecto** (icono de engranaje ⚙️ arriba a la izquierda).
5. En la sección *"Tus apps"*, haz clic en el icono web `</>` para registrar una app web.
6. Copia el contenido del objeto `firebaseConfig` y pégalo en el archivo **[`firebase-config.js`](./firebase-config.js)**:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "tu-proyecto.firebaseapp.com",
  databaseURL: "https://tu-proyecto-default-rtdb.firebaseio.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};
```

---

## 🌐 Publicar la App en Internet (GitHub Pages)

Para que cualquier integrante pueda entrar desde su computadora o celular desde cualquier lugar:

1. En tu repositorio de GitHub: **[https://github.com/AlexCAC0/eclipseapp](https://github.com/AlexCAC0/eclipseapp)**
2. Ve a **Settings (Configuración)** > pestaña **Pages** (en el menú lateral izquierdo).
3. En **Build and deployment > Branch**, selecciona la rama **`main`** y la carpeta `/(root)`, luego haz clic en **Save**.
4. ¡Listo! En 1 minuto tendrás tu enlace público oficial:
   👉 **`https://alexcac0.github.io/eclipseapp/`**

---

## 🛠️ Características Principales

### 🔴 1. Vista de Moderador (Control Total)
- **Supervisión en Tiempo Real:** Métricas globales de Tareas Totales, Pendientes, Prontas y Progreso del equipo.
- **Gestión de Integrantes:**
  - Crear usuarios con su nombre, usuario y contraseña directamente en la nube.
  - Ver el progreso individual de cada integrante.
  - Eliminar integrantes cuando sea necesario.
- **Gestión de Tareas (CRUD completo):**
  - Asignar tareas a cualquier integrante con categoría, prioridad, fecha límite e instrucciones.
  - 3 Vistas estilo Notion: **Tarjetas (Grid)**, **Tablero Kanban (Pendientes / Prontas)** y **Tabla Notion**.
  - Filtros y buscador dinámico.

### ⚫ 2. Vista de Integrante (Espacio Personal Privado)
- **Foco Absoluto:** Cada integrante **solo ve sus tareas asignadas**.
- **Marcar como "Pronta":** Actualización instantánea en la nube que refleja el cambio en la vista del moderador en tiempo real.
- **Detalle de Tarea:** Modal para leer instrucciones completas.

---

## 🎨 Paleta de Diseño
- **Fondo:** Negro Ónix / Obsidiana (`#09090b`, `#14141a`)
- **Acentos:** Rojo Carmesí y Rubí Vibrante (`#e50914`, `#ff2a44`)
- **Estilo:** Notion minimalista, tarjetas con bordes limpios y tipografía *Plus Jakarta Sans*.
