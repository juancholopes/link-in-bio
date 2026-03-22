# Link in bio

Esta es una página web utilizada para ser un link in bio, el cual cuenta con varias secciones simples, la primera el hero una imagen simple con un diseño, el segundo componente es la sección de links, la tercera sección es una integración con Spotify para mostrar la canción que se esta reproduciendo en el momento, y la cuarta sección muestra el ultimo post de x.com

# Spotify Widget

Este componente tiene una lógica simple todo integrada con lo que astro nos ofrece como framework

- Se crea un endpoint GET con Astro que internamente hace un POST a el endpoint de Spotify el cual se encarga de generar un acces_token con el refresh_token necesario en las variables de entorno, después con ese asccess_token se hace una petición GET al otro endpoint de Spotify para obtener el current_playing de Spotify, luego devolvemos solo los tres datos que necesitamos para nuestro widget, (item.album.name, item.artist.name, item.images.url)

- El SpotifyWidget con un script hace una petición a ese endpoint creado y luego renderiza esos datos para que esos datos sean actualizados se hace una petición cada 10 segundos
