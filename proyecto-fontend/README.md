# Qualica-RD - Sistema de Gestión de Almacén e Inventario

## Descripción

Qualica-RD es una aplicación web para la gestión de almacenes, inventario y tareas. Permite a los usuarios administrar productos, estanterías, almacenes y asignar tareas a empleados.

## Características

- **Gestión de Almacenes**: Crear, editar y eliminar almacenes con representación visual.
- **Gestión de Estanterías**: Posicionar estanterías en el almacén mediante arrastrar y soltar.
- **Inventario**: Administrar productos, categorías y stock.
- **Gestión de Tareas**: Crear, asignar y hacer seguimiento de tareas.
- **Calendario**: Visualizar tareas en un calendario mensual.
- **Autenticación**: Sistema de inicio de sesión y gestión de usuarios.

## Tecnologías Utilizadas

- **Frontend**: React, TailwindCSS, Headless UI
- **Comunicación con Backend**: Axios
- **Estilos**: TailwindCSS, Font Awesome
- **Gestión de Estado**: React Hooks, Context API
- **Enrutamiento**: React Router

## Estructura del Proyecto

\`\`\`
src/
├── components/         # Componentes reutilizables
│   ├── layout/         # Componentes de estructura
│   └── ui/             # Componentes de interfaz de usuario
├── context/            # Contextos de React
├── hooks/              # Hooks personalizados
├── pages/              # Páginas principales
├── services/           # Servicios de API
└── utilities/          # Utilidades y funciones auxiliares
\`\`\`

## Componentes Principales

### AlmacenVisual

Componente principal para la gestión visual de almacenes. Permite:
- Crear y eliminar almacenes
- Añadir estanterías y puertas
- Mover estanterías mediante arrastrar y soltar
- Asignar productos a estanterías
- Buscar productos en el almacén

### Inventario

Gestión completa de productos:
- Listar productos activos e inactivos
- Crear, editar y eliminar productos
- Asignar categorías
- Filtrar por categoría y cantidad

### Tareas

Sistema de gestión de tareas:
- Crear y asignar tareas a empleados
- Categorizar tareas
- Seguimiento del estado (Por hacer, En Proceso, Finalizada)
- Vista de calendario

## Instalación y Ejecución

1. Clonar el repositorio
2. Instalar dependencias:
   \`\`\`
   npm install
   \`\`\`
3. Iniciar el servidor de desarrollo:
   \`\`\`
   npm run dev
   \`\`\`

## Configuración

La aplicación se comunica con un backend en `http://localhost:8080`. Asegúrate de que el servidor backend esté en funcionamiento antes de iniciar la aplicación.

### Variables de Entorno

No se requieren variables de entorno para el funcionamiento básico, pero puedes configurar la URL del backend modificando la constante `BASE_URL` en el archivo `src/services/api.js`.

## Autenticación

La aplicación utiliza autenticación basada en tokens JWT. El token se almacena en localStorage y se envía en las cabeceras de las peticiones HTTP.

## Documentación de Componentes

### AuthContext

Proporciona acceso al estado de autenticación en toda la aplicación:
- `user`: Información del usuario actual
- `login`: Función para iniciar sesión
- `logout`: Función para cerrar sesión
- `updateUserName`: Función para actualizar el nombre del usuario

### useApi

Hook personalizado para realizar peticiones a la API:
- `data`: Datos recibidos de la API
- `loading`: Estado de carga
- `error`: Error de la petición
- `refetch`: Función para volver a realizar la petición

### AlmacenVisual

Componente principal para la gestión visual de almacenes:
- Permite crear, editar y eliminar almacenes
- Gestiona estanterías mediante arrastrar y soltar
- Asigna productos a estanterías
- Busca productos en el almacén

## Guía de Contribución

1. Crea una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
2. Realiza tus cambios y haz commit (`git commit -m 'Añadir nueva funcionalidad'`)
3. Sube tus cambios (`git push origin feature/nueva-funcionalidad`)
4. Crea un Pull Request

## Buenas Prácticas

- Utiliza los hooks personalizados para la lógica común
- Sigue el patrón de diseño de componentes presentacionales y contenedores
- Documenta los componentes y funciones con JSDoc
- Utiliza los componentes UI de la carpeta `components/ui` para mantener la consistencia visual

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

## Contacto

Para cualquier consulta o sugerencia, contacta con el equipo de desarrollo en contacto@qualicard.com.
