# Arquidiocesis de Monterrey - BDA Aplicación

## Paso 1 - Instalar NodeJS

[https://nodejs.org/en/](https://nodejs.org/en/)

- Descargar la versión para el sistema operativo utilizado.
- Versión recomendada **v12**.
- Asegurarse de que se instale **npm**.

## Paso 2 - Instalar Expo CLI

Expo es el framework de React-Native que se utiliza en el proyecto para el desarrollo y el deployment.

```
$ npm install expo-cli -g
```

## Paso 3 - Instalar librerias del proyecto

Correr el siguiente comando para instalar todas las librerias y componentes requeridos para correr la aplicación.  
**Este comando se debe de correr dentro de la carpeta de el proyecto.**

```
$ npm install
```

## Paso 4 - Correr servidor de desarrollo

Correr el siguiente comando dentro de la capreta del proyecto.  
Esto abrirá una página en el navegador web.

```
$ npm start
```

## Paso 5 - Correr aplicación en modo desarrollo

En el navegador web, dar click en cualquiera de las acciones en la parte izquierda de la página.

- **Run on Android device/emulator**: Correr la aplicación dentro del simulador de Android Studio.
- **Run on iOS Simulator**: Correr la aplicación dentro del simulador de iOS (Solo macOS).
- **Run on web browser**: Correr la aplicación en el navegador.

Para correr la aplicación en cualquier dispositivo móvil sin necesidad de conectarlo a la computadora se siguen los siguientes pasos:

1. Descargar la aplicación de Expo:
   - https://expo.io/tools#client
2. Escanear el código QR que se muestra en la página web que se abrió en el paso anterior.
3. Abrir la aplicación de Expo cuando muestre la opción.

## Paso 6.1: Construir aplicación de producción

- Se recomienda seguir los pasos de la documentación oficial de Expo
- https://docs.expo.io/distribution/building-standalone-apps/

1. Correr el siguiente comando para construir la aplicación:

```
// Para android:
$ expo build:android

// Para iOS
$ expo build:ios
```

2. Cada uno de los comandos pedirá las credenciales para hacer el sign de la appstore correspondiente.
   - Las credenciales que se piden no se guardan, solo se utilizan para firmar la aplicación con la cuenta que se utilizará
3. Estos comandos regresarán un enlace que mostrará el estatus de la compilación, al final regresará:
   - Un _.ipa_ si se compila para iOS
   - Un _.apk_ si se compila para Android

## Paso 6.2: Construir para web

Actualmente se utiliza Netlify para correr el servidor, ya que se requiere de un servidor estatico.

1. Correr el siguiente comando:

```
$ expo build:web
```

2. Esto creará una carpeta llamada _web-build_ que contiene los archivos para el servidor web.

## Paso 6.2.1: Subir a Netlify

1. Instalar Netlify

```
$ npm install netlify-cli -g
```

2. Iniciar sesión a Netlify con las credenciales que se proporcionaron anteriormente

```
$ netlify login
```

3. Realizar el deploy  
   **IMPORTANTE:** Cuando pregunte _"Publish directory"_ escribir: **web-build**

```
$ netlify deploy
```

4. Hacer deploy en Netlify

   - Entrar a la página de [Netlify](https://netlify.com)
   - Iniciar sesión con las credenciales proporcionadas anteriormente.
   - Entrar al proyecto de _arquidiocesis_
   - Buscar el deploy que se acaba de hacer.
   - Si el deploy es correcto: Dar click en **Publish deploy**

5. Listo
   - La aplicación ahora correrá en https://arquidiocesis.netlify.app/
