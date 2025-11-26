// 1. Cargar la API de IFrame de YouTube de forma asíncrona
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 2. Esta función crea el reproductor <iframe> (y el video)
//    cuando la API está lista para usarse.
var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '100%',
        width: '100%',
        videoId: 'ELSm-G201Ls', // ID del video de Soy Dalto
        playerVars: {
            'playsinline': 1,
            'controls': 0, // Ocultamos los controles nativos de YouTube para usar los nuestros
            'rel': 0       // Evitamos videos relacionados al final
        },
        events: {
            'onReady': onPlayerReady
        }
    });
}

// 3. La API llamará a esta función cuando el reproductor esté listo.
function onPlayerReady(event) {
    // Aquí conectamos nuestros botones personalizados a la API
    
    // Botón Play
    document.getElementById('btnPlay').addEventListener('click', function() {
        player.playVideo();
    });

    // Botón Pausa
    document.getElementById('btnPause').addEventListener('click', function() {
        player.pauseVideo();
    });

    // Botón Stop (Detener)
    document.getElementById('btnStop').addEventListener('click', function() {
        player.stopVideo();
    });

    // Botón Mute / Unmute
    var btnMute = document.getElementById('btnMute');
    btnMute.addEventListener('click', function() {
        if (player.isMuted()) {
            player.unMute();
            btnMute.innerText = "🔊 Mute"; // Cambiamos texto/icono
            btnMute.style.backgroundColor = "#f1c40f"; // Color original
        } else {
            player.mute();
            btnMute.innerText = "🔇 Unmute";
            btnMute.style.backgroundColor = "#95a5a6"; // Color gris indicando silencio
        }
    });
}
