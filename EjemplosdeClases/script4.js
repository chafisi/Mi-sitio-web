// --- Lógica de la API de YouTube ---
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '100%',
        width: '100%',
        videoId: 'ELSm-G201Ls', // ID del curso de Soy Dalto
        playerVars: {
            'playsinline': 1,
            'controls': 0, 
            'rel': 0,
            'modestbranding': 1
        },
        events: {
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    // Conexión de los botones
    document.getElementById('btnPlay').addEventListener('click', () => player.playVideo());
    document.getElementById('btnPause').addEventListener('click', () => player.pauseVideo());
    document.getElementById('btnStop').addEventListener('click', () => player.stopVideo());

    // Botón Mute con cambio visual
    var btnMute = document.getElementById('btnMute');
    btnMute.addEventListener('click', function() {
        if (player.isMuted()) {
            player.unMute();
            btnMute.innerHTML = '<span class="icon">🔊</span>';
            btnMute.style.color = ""; 
        } else {
            player.mute();
            btnMute.innerHTML = '<span class="icon">🔇</span>';
            btnMute.style.color = "#ff4757"; // Rojo para indicar muteado
        }
    });
}

// --- Lógica para el tamaño de pantalla (Nuevo) ---
const badge = document.getElementById('res-badge');

function updateScreenSize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Muestra el ancho y el alto del viewport
    badge.innerText = `VIEWPORT: ${width}px x ${height}px`;
}

// Ejecutar al cargar y al redimensionar
updateScreenSize();
window.addEventListener('resize', updateScreenSize);
