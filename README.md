# 🌑 Eclipse Studio APP - Task Workspace (Notion Style)

Una aplicación de gestión de tareas estilo **Notion** con paleta de colores **roja y negra** (Dark & Crimson Red), pensada para equipos y estudios donde los moderadores gestionan y asignan tareas, y los integrantes visualizan únicamente lo que les corresponde.

---

## 🚀 Cómo iniciar la aplicación

Tienes dos formas súper sencillas de usarla:

### Opción 1: Un solo click (Recomendada)
- Haz doble clic en el archivo **`iniciar_app.bat`**.
- Se abrirá automáticamente en tu navegador en `http://localhost:8000`.

### Opción 2: Desde la consola / terminal
```bash
python server.py
```
Luego abre en tu navegador: **`http://localhost:8000`**

*(Nota: La app también funciona de forma autónoma abriendo directamente `index.html` en cualquier navegador gracias a su sistema de respaldo con LocalStorage).*

---

## 🛠️ Características Principales

### 🔴 1. Vista de Moderador (Control Total)
- **Supervisión Global:** Métricas en tiempo real de Tareas Totales, Pendientes, Prontas y Porcentaje de Progreso.
- **Gestión de Integrantes:**
  - Crear nuevos usuarios con su nombre, usuario y contraseña.
  - Ver el progreso individual de cada integrante.
  - Eliminar usuarios (la cuenta de *AlexCAC* está protegida contra borrado accidental).
- **Gestión de Tareas (CRUD completo):**
  - Crear nuevas tareas asignándolas al integrante correspondiente, con categoría (Diseño, Dev, Video, Audio, Redes, General), nivel de prioridad (Alta, Media, Baja), fecha límite e instrucciones detalladas.
  - Editar y eliminar tareas existentes.
  - 3 Modos de visualización estilo Notion:
    - **Cuadrícula de Tarjetas (Cards View)**
    - **Tablero Kanban (Pendientes vs Prontas)**
    - **Tabla Notion con filtros y ordenamiento**
- **Buscador y Filtros:** Filtrar instantáneamente por integrante, estado o prioridad.

---

### ⚫ 2. Vista de Integrante (Espacio Personal Privado)
- **Foco Absoluto:** El integrante **solo ve las tareas que le fueron asignadas por el moderador**. No tiene acceso a tareas ajenas.
- **Barra de Progreso Personal:** Visualización de su avance individual.
- **Marcar Tarea como "Pronta":** Con un solo clic cambia de estado con feedback visual y felicitación.
- **Ver Detalles:** Popup para leer descripciones extensas, enlaces o notas del moderador.
- **Filtros rápidos:** Pestañas para ver *Todas*, *Solo Pendientes* o *Solo Prontas*.

---

## 🎨 Paleta de Diseño
- **Fondo Principal:** Negro Ónix / Obsidiana (`#09090b`, `#14141a`)
- **Acentos:** Rojo Carmesí y Rubí Vibrante (`#e50914`, `#ff2a44`)
- **Estilo:** Minimalismo Notion, bordes limpios, insignias de estado y tipografía moderna *Plus Jakarta Sans*.
