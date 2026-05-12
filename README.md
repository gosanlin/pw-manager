# Gestor de Contraseñas

Aplicación de escritorio para generar, almacenar y gestionar contraseñas seguras en Windows.

## Archivos principales

- `index.html` — interfaz de usuario y estructura principal.
- `styles.css` — estilos de la aplicación.
- `app.js` — lógica del frontend y llamadas a la API local.
- `main.js` — proceso principal de Electron.
- `preload.js` — puente seguro entre renderer y Node/Electron.
- `package.json` — configuración del proyecto y de empaquetado.

## Cómo ejecutar en desarrollo

1. Abre una terminal en la carpeta del proyecto.
2. Ejecuta `npm install`.
3. Ejecuta `npm start`.

## Cómo crear el ejecutable (.exe)

1. Instala dependencias con `npm install`.
2. Asegúrate de poner el logo JPG en la carpeta del proyecto con el nombre `logo.jpg`.
3. Ejecuta `npm run package`.
4. El ejecutable se crea en `dist/PW Manager-win32-x64/PW Manager.exe`.

> Ya generado: `dist/PW Manager-win32-x64/PW Manager.exe`
>
> Ten en cuenta que el contenido exportado ya incluye esta carpeta con el archivo `.exe`.

## Almacenamiento local

- Las contraseñas se guardan en un archivo `entries.json` dentro de la carpeta dedicada `C:\Users\Daniel\Documents\Gestor de Contraseñas`.
- Esto permite que la app recuerde las entradas entre cierres y reinicios.
- Si no existe, la carpeta se crea automáticamente al iniciar la aplicación.
- El proyecto incluye `logo.png` y `logo.ico` para compatibilidad de Windows.

## Características

- Generador de contraseñas con opciones de longitud, mayúsculas, minúsculas, números y símbolos.
- Guardado local en archivo seguro del sistema.
- Navegación de entradas con copia, mostrar/ocultar y eliminación.
- Modo claro/oscuro.
