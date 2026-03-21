# Sesión de Tutoría: Spotify Widget en Astro

## Resumen del Objetivo
Crear un widget para un sitio "Link in Bio" (hecho en Astro) que muestre en tiempo real la canción que el dueño del sitio está escuchando en Spotify.

**Restricción:** El usuario busca aprender la lógica y el "por qué" de las cosas, actuando la IA como tutor senior, evitando dar código copypaste.

---

## Conceptos Clave Aprendidos

### 1. Flujo de Autenticación (OAuth 2.0)
Identificamos dos flujos posibles:
*   **Flujo A (Login de Usuario):** El visitante se loguea para ver SU música. (No deseado para este caso).
*   **Flujo B (Client Credentials / Refresh Token):** El servidor actúa en nombre del dueño del sitio para mostrar SU música. (El elegido).

**La Pieza Clave:** El `refresh_token`.
*   A diferencia del `access_token` (que caduca en 1 hora), el `refresh_token` es "eterno" y permite pedir nuevos tokens de acceso sin intervención humana.

### 2. Arquitectura en Astro
*   **Frontend (Cliente):** Componente visual `.astro` que hace un `fetch` simple a nuestro propio servidor. No maneja secretos.
*   **Backend (Servidor):** Endpoint `src/pages/api/spotify.ts`.
    *   Actúa como intermediario seguro (Proxy).
    *   Almacena `CLIENT_ID`, `CLIENT_SECRET` y `REFRESH_TOKEN` en `.env`.
    *   Expone un método `GET` al frontend, pero internamente ejecuta un flujo `POST` (a Spotify Auth) y luego `GET` (a Spotify API).

### 3. Herramientas de Desarrollo
*   **Terminal / CURL:** Para generar el `base64` de las credenciales y obtener el primer token manualmente.
*   **Bruno (Cliente HTTP):** Vital para probar la lógica de las peticiones (Headers, Body, Auth) antes de escribir código. Nos permitió validar que el `refresh_token` funcionaba y ver la estructura del JSON de respuesta.

---

## Log de Pasos Realizados

1.  **Investigación:** Se descartó el uso de un servidor Express separado. Se optó por Astro Endpoints.
2.  **Obtención de Credenciales:**
    *   Se generó la URL de autorización manual.
    *   Se obtuvo el `code` temporal.
    *   Se intercambió por el `refresh_token` usando `curl` (superando el error de "code expired").
3.  **Pruebas en Bruno:**
    *   **POST:** Se configuró la petición para renovar el token (`grant_type: refresh_token`). Aprendimos a usar la pestaña "Auth > Basic" para las credenciales.
    *   **GET:** Se usó el nuevo `access_token` para consultar `/me/player/currently-playing`. Se obtuvo un JSON real con datos de la canción.
4.  **Diseño de la API:**
    *   Se definió la estructura de `src/pages/api/spotify.ts`.
    *   Se aclaró que aunque hagamos llamadas internas POST y GET, el endpoint de Astro solo necesita exportar `GET`.

---

## Skill: Cómo aprender programación con IA (Modo Tutor)

Esta guía te ayudará a seguir utilizando la IA para mejorar tus habilidades, enfocándote en entender la lógica en lugar de solo copiar soluciones.

### La Regla de Oro
**"No me des el código, explícame el flujo."**

### Estrategias de Pregunta (Prompts para Aprender)

#### 1. Cuando no entiendas un concepto (como OAuth o SSR):
> "Explícame [concepto] como si fuera un diagrama de flujo. ¿Qué entra y qué sale en cada paso?"
> "Tengo una analogía: ¿Es [concepto] parecido a [algo que ya sabes]? Corrígeme si me equivoco."

#### 2. Antes de escribir código:
> "Tengo planeado hacer [X] siguiendo estos pasos: 1... 2... 3... ¿Es esta la mejor arquitectura o estoy complicando algo innecesariamente?"
> "Ayúdame a escribir el pseudocódigo o los comentarios de este archivo antes de escribir la sintaxis real."

#### 3. Cuando tengas un error:
> "Me salió este error [pegar error]. No me des la solución directa. Dame 3 pistas de qué podría estar fallando o qué debo revisar en mi configuración."
> "¿Qué herramienta (log, debugger, network tab) debería usar para inspeccionar este fallo yo mismo?"

#### 4. Para mejorar tu código (Code Review):
> "Aquí está mi código que YA funciona [pegar código]. Actúa como un Tech Lead senior y dime: ¿Qué malas prácticas ves? ¿Cómo lo harías más limpio o seguro? (Explícame el porqué, no solo lo cambies)."

### Tu Próximo Reto (Hoja de Ruta)

Ahora que tienes los datos en Bruno y la lógica clara, sigue este camino para completar tu widget:

1.  **Variables de Entorno:** Implementar `import.meta.env` en Astro y asegurar que TypeScript no se queje (archivo `env.d.ts`).
2.  **El Fetch en Astro:** Traducir la petición de Bruno a `fetch` de JavaScript dentro de `src/pages/api/spotify.ts`.
    *   *Reto:* Manejar correctamente el `URLSearchParams` para el body del POST.
3.  **Tipado (TypeScript):** Definir una interfaz para la respuesta de Spotify (para no trabajar con `any`).
4.  **Frontend:** Crear el componente `.astro` o `.jsx` (React/Preact) que consuma tu endpoint y muestre la carátula y el título.
