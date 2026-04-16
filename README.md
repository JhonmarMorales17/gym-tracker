# 🏋️ GymTracker - Sistema de Registro de Ejercicios de Gimnasio Realizado por Jhonmar Morales

## 📝 Descripción

**GymTracker** es una aplicación web completa para el seguimiento y control de entrenamientos en el gimnasio. La aplicación permite gestionar ejercicios, crear rutinas personalizadas, registrar sesiones de entrenamiento y visualizar el progreso a través de un dashboard interactivo con gráficos.

El sistema utiliza **persistencia local en el navegador** mediante IndexedDB, lo que permite que todos los datos se almacenen directamente en el dispositivo del usuario, funcionando **sin necesidad de internet ni servidor backend**.

---

## 🚀 Tecnologías utilizadas

| Tecnología | Descripción |
|------------|-------------|
| **HTML5** | Estructura semántica de la aplicación |
| **CSS3** | Diseño responsive y moderno con Flexbox/Grid |
| **JavaScript Vanilla** | Lógica de negocio sin frameworks externos |
| **IndexedDB** | Base de datos NoSQL para persistencia local |
| **Chart.js** | Librería para gráficos interactivos |
| **SPA** | Single Page Application sin recargas de página |

---

## ✅ Funcionalidades implementadas

### 1. Gestión de Ejercicios (CRUD completo)
- ✅ Crear nuevos ejercicios personalizados
- ✅ Editar ejercicios existentes
- ✅ Eliminar ejercicios (con confirmación)
- ✅ Lista visual tipo tarjetas
- ✅ Filtros por grupo muscular (Pecho, Espalda, Piernas, Hombros, Brazos)
- ✅ Búsqueda en tiempo real por nombre
- ✅ Datos predefinidos cargados automáticamente

### 2. Gestión de Rutinas (CRUD completo)
- ✅ Crear rutinas seleccionando ejercicios del catálogo
- ✅ Definir series y repeticiones sugeridas por ejercicio
- ✅ Editar rutinas (agregar, quitar o modificar ejercicios)
- ✅ Eliminar rutinas
- ✅ Ver detalle completo de cada rutina
- ✅ Filtro de búsqueda por nombre

### 3. Registro de Sesiones de Entrenamiento
- ✅ Iniciar nueva sesión seleccionando una rutina
- ✅ Registrar peso y repeticiones para cada serie
- ✅ Agregar múltiples series por ejercicio dinámicamente
- ✅ Eliminar series individuales
- ✅ Editar sesiones pasadas
- ✅ Eliminar sesiones
- ✅ Filtrar sesiones por fecha o por rutina
- ✅ Ver historial completo ordenado cronológicamente
- ✅ Vista detallada de cada sesión

### 4. Dashboard Interactivo con Gráficos
- ✅ **Tarjetas de estadísticas**: Sesiones totales, días entrenados, racha actual, total de ejercicios y rutinas
- ✅ **Mejor progreso**: Ejercicio con mayor aumento de peso
- ✅ **Gráfico 1 - Frecuencia de entrenamiento**: Barras con sesiones por semana
- ✅ **Gráfico 2 - Progreso de peso**: Líneas con evolución del peso máximo por ejercicio (selector interactivo)
- ✅ **Gráfico 3 - Distribución por grupo muscular**: Dona con porcentaje de ejercicios realizados
- ✅ **Gráfico 4 - Volumen total**: Líneas con evolución del volumen (peso × repeticiones)
- ✅ **Sesiones recientes**: Lista de las últimas 5 sesiones registradas

### 5. Persistencia y Almacenamiento
- ✅ **IndexedDB** como mecanismo principal de persistencia
- ✅ Tres stores: `exercises`, `routines`, `sessions`
- ✅ Datos persistentes al cerrar y reabrir el navegador
- ✅ Funciona completamente offline

### 6. Navegación SPA
- ✅ Cambio de vistas sin recargar la página
- ✅ URLs con hash (`#dashboard`, `#exercises`, `#routines`, `#sessions`)
- ✅ Indicador visual de vista activa en la navegación
- ✅ Estados de carga y error

## 🖥️ Cómo ejecutar el proyecto
1. Clonar el repositorio:
```bash
git clone https://github.com/JhonmarMorales17/gym-tracker.git