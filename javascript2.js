/*<!-- ---------------------------------------------------- -->
    <!-- LÓGICA DE NAVEGACIÓN (JAVASCRIPT) -->
    <!-- ---------------------------------------------------- -->*/
    
alert("El archivo JS se ha cargado correctamente barra busqueda y titulo3 dasfdasfasdfasdfaseftafsdfasdfasdfasdfas");
console.log("Prueba de consola");

    // Inicializar Iconos Lucide
lucide.createIcons();

//VARIABLES GLOBALES PARA TRABAJAR CON EL DOM
let eventsData = []; // Almacena todos los datos de la hoja de cálculo
let filteredEvents = []; // Eventos después de aplicar filtros y búsqueda
let currentPage = 0;
const eventsPerPage = 6;
let activeTab = 'valorados'; // RF 1.11: Valorados es el default
let currentView = 'PAN1';
let currentEvent = null; // Almacena el evento actual en PAN2

// Oculta todas las pantallas excepto la especificada y gestiona el estado del TabBar
function mostrarPantalla(pantallaId) {
    const pantallas = ['pantalla1', 'pantalla2', 'pantalla3', 'pantalla4'];
    pantallas.forEach(id => {
        const screen = document.getElementById(id);
        if (screen) {
            if (id === pantallaId) {
                    screen.classList.remove('hidden');
                } else {
                    screen.classList.add('hidden');
                }
            }
    });
    window.scrollTo(0, 0); // Ir al inicio de la página al cambiar de pantalla

    // --- Lógica de la TabBar ---
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        // Limpiar clases de activo
        item.classList.remove('nav-item-active', 'text-cyan-500', 'transform', 'scale-110', '-translate-y-2');
        // Restaurar clases de inactivo por defecto
        item.classList.add('text-gray-500', 'hover:text-indigo-600', 'group');
    });

    // Activar el item correspondiente a la pantalla
    let activeItemId = null;
    if (pantallaId === 'pantalla1' || pantallaId === 'pantalla2' || pantallaId === 'pantalla3') {
        // Por defecto, al volver a la pantalla principal, se destaca 'Valorados' (el centro)
        activeItemId = 'nav-valorados';
        } else if (pantallaId === 'pantalla4') {
            activeItemId = 'nav-perfil';
    }

    if (activeItemId) {
    const activeItem = document.getElementById(activeItemId);
    if (activeItem) {
        // Remover clases de inactivo
        activeItem.classList.remove('text-gray-500', 'hover:text-indigo-600', 'group');
        // Añadir clases de activo
        activeItem.classList.add('nav-item-active', 'text-cyan-500', 'transform', 'scale-110', '-translate-y-2');
        }
    }
}


// Funciones específicas para la UX
function mostrarPantalla1() {
    mostrarPantalla('pantalla1');
}

function mostrarPantalla2() {
    mostrarPantalla('pantalla2');
}

function mostrarPantalla3() {
    mostrarPantalla('pantalla3');
}

function mostrarPantalla4() {
    mostrarPantalla('pantalla4');
}

// Lógica de Pestañas en PAN4
let currentTab = 'comprados';
function selectTab(tabName) {
    if (currentTab === tabName) return;

    // Ocultar/Mostrar contenido
    document.getElementById('content-comprados').classList.add('hidden');
    document.getElementById('content-guardados').classList.add('hidden');
    document.getElementById(`content-${tabName}`).classList.remove('hidden');

    // Actualizar estilo de pestañas
    document.getElementById('tab-comprados').classList.remove('border-indigo-600', 'text-indigo-600');
    document.getElementById('tab-comprados').classList.add('border-transparent', 'text-gray-500', 'hover:text-gray-700');

    document.getElementById('tab-guardados').classList.remove('border-indigo-600', 'text-indigo-600');
    document.getElementById('tab-guardados').classList.add('border-transparent', 'text-gray-500', 'hover:text-gray-700');

    document.getElementById(`tab-${tabName}`).classList.add('border-indigo-600', 'text-indigo-600');
    document.getElementById(`tab-${tabName}`).classList.remove('border-transparent', 'text-gray-500', 'hover:text-gray-700');

    currentTab = tabName;
}

// Lógica del Modal QR
function showQrModal() {
    document.getElementById('qr-modal').classList.remove('hidden');
}

function closeQrModal() {
    document.getElementById('qr-modal').classList.add('hidden');
}

// Inicializar en PAN1 al cargar la página y configurar el TabBar
window.onload = () => {
// Asegura que se muestre PAN1 y se configure el TabBar inicial
mostrarPantalla('pantalla1');
// Asegura que la pestaña inicial de PAN4 sea 'comprados'
selectTab('comprados');
};

//*****************FUNCIONES PARA CARGAR LOS DATOS DESDE GOOGLE SHEETS Y SI NO FUNCIONA LO HACEMOS MANUALMENTE****************
//************************************************************************************************************************** */

let GAS_WEB_APP_URL = 'TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI';

// Carga inicial de datos desde la API
async function cargarEventos() {
        
    // URLs de ejemplo con el formato drive.google.com/thumbnailasd
    eventsData = [
        { ID_EVENTO: 101, TITULO: "El Rey León, El Musical", CATEGORIA: "Musicales", RATING_ESTRELLAS: 5, NUM_RESEÑAS: 542, UBICACION_CIUDAD: "Madrid", PRECIO_MIN: 35, FECHA_EVENTO: "2024-11-14 20:00", URL_IMAGEN: "https://drive.google.com/thumbnail?id=1wL1MID8BLWZL0PvzkLqNh61jb4i4S1ey&sz=w500", DESCRIPCION: "Una experiencia teatral inolvidable que transporta al espectador a la sabana africana. Con impresionantes vestuarios y música icónica.", VISTO: 1, CONTACTO: "reyleon@gmail.com", ENLACE_DE_RESERVA: "https://example.com/rey-leon", RESERVADO: 1, FAVORITO: 0 },
        { ID_EVENTO: 102, TITULO: "Monólogo de Raúl Antón2", CATEGORIA: "Monólogos", RATING_ESTRELLAS: 3, NUM_RESEÑAS: 187, UBICACION_CIUDAD: "Ibi", PRECIO_MIN: 28, FECHA_EVENTO: "2024-02-25 21:30", URL_IMAGEN: "https://drive.google.com/thumbnail?id=1pC3oHgZ6WPcXGjxbrJdZzbbBiSlqvbmA&sz=w500", DESCRIPCION: "Noche de risas garantizadas con el humor irreverente y cercano de Raúl Antón. ¡No pararás de reír!", VISTO: 1, CONTACTO: "raulanton12@gmail.com", ENLACE_DE_RESERVA: "https://example.com/raul-anton", RESERVADO: 0, FAVORITO: 1 },
        { ID_EVENTO: 103, TITULO: "Concierto de Nathy Peluso", CATEGORIA: "Musicales", RATING_ESTRELLAS: 5, NUM_RESEÑAS: 310, UBICACION_CIUDAD: "Alicante", PRECIO_MIN: 45, FECHA_EVENTO: "2024-02-26 22:00", URL_IMAGEN: "https://drive.google.com/thumbnail?id=1GxPncAi_Gmh6ZJJSVpY8UvF-b7EFlw2o&sz=w500", DESCRIPCION: "La artista argentina Nathy Peluso en vivo, presentando sus éxitos y nuevos temas con su inconfundible estilo.", VISTO: 0, CONTACTO: "eventime23@gmail.com", ENLACE_DE_RESERVA: "https://example.com/nathy-peluso", RESERVADO: 0, FAVORITO: 1 },
        { ID_EVENTO: 104, TITULO: "Festival de Jazz de Madrid", CATEGORIA: "Festivales", RATING_ESTRELLAS: 5, NUM_RESEÑAS: 250, UBICACION_CIUDAD: "Elche", PRECIO_MIN: 25, FECHA_EVENTO: "2024-03-10 19:00", URL_IMAGEN: "https://drive.google.com/thumbnail?id=1swDqkti9GTl9tUlE3lvYJa_YaZTOkJkH&sz=w500", DESCRIPCION: "Una selección de los mejores talentos del jazz nacional e internacional en diferentes escenarios de la ciudad.", VISTO: 0, CONTACTO: "jazzmadrid@gmail.com", ENLACE_DE_RESERVA: "https://example.com/jazz-madrid", RESERVADO: 0, FAVORITO: 0 },
        { ID_EVENTO: 106, TITULO: "Formula 1 Madrid Grand Prix", CATEGORIA: "Motor", RATING_ESTRELLAS: 5, NUM_RESEÑAS: 789, UBICACION_CIUDAD: "Madrid", PRECIO_MIN: 150, FECHA_EVENTO: "2025-05-18 15:00", URL_IMAGEN: "https://drive.google.com/thumbnail?id=1PHrEk1X9SppVzf2Jnl1EAdOcTO7BYLFN&sz=w500", DESCRIPCION: "La emoción de la Fórmula 1 llega a Madrid con una carrera urbana espectacular. Vive la velocidad y la adrenalina en primera persona.", VISTO: 1, CONTACTO: "f1best@gmail.com", ENLACE_DE_RESERVA: "https://example.com/f1", RESERVADO: 0, FAVORITO: 0 },
        { ID_EVENTO: 107, TITULO: "Exposición Maestros del Renacimiento", CATEGORIA: "Arte", RATING_ESTRELLAS: 4, NUM_RESEÑAS: 120, UBICACION_CIUDAD: "Madrid", PRECIO_MIN: 15, FECHA_EVENTO: "2024-03-20 11:00", URL_IMAGEN: "https://drive.google.com/thumbnail?id=1Fn1KKqiCYKu1iudHCE0W8_JEGPHDw8xN&sz=w500", DESCRIPCION: "Un viaje a través de las obras cumbre de los grandes artistas del Renacimiento europeo.", VISTO: 1, CONTACTO: "topeventos@gmail.com", ENLACE_DE_RESERVA: "https://example.com/renacimiento", RESERVADO: 0, FAVORITO: 0 },
        { ID_EVENTO: 108, TITULO: "Festival de Comedia Indie", CATEGORIA: "Comedia", RATING_ESTRELLAS: 4, NUM_RESEÑAS: 65, UBICACION_CIUDAD: "Madrid", PRECIO_MIN: 18, FECHA_EVENTO: "2024-04-05 21:00", URL_IMAGEN: "https://drive.google.com/thumbnail?id=16YwfLSk9E_N9hxr2VS24bedOBiHvgbTg&sz=w500", DESCRIPCION: "Descubre nuevas voces del stand-up y monólogos emergentes en este festival innovador.", VISTO: 0, CONTACTO: "topeventos@gmail.com", ENLACE_DE_RESERVA: "https://example.com/comedia-indie", RESERVADO: 0, FAVORITO: 0 },
        { ID_EVENTO: 109, TITULO: "Ópera: Carmen en el Real", CATEGORIA: "Ópera", RATING_ESTRELLAS: 4, NUM_RESEÑAS: 450, UBICACION_CIUDAD: "Madrid", PRECIO_MIN: 70, FECHA_EVENTO: "2024-05-10 20:30", URL_IMAGEN: "https://drive.google.com/thumbnail?id=1Dn2qJt1KykWpFRJKwYxsNoHIhlLVY8lK&sz=w500", DESCRIPCION: "La icónica ópera de Bizet, Carmen, interpretada por un elenco de talla mundial en el Teatro Real.", VISTO: 0, CONTACTO: "topeventos@gmail.com", ENLACE_DE_RESERVA: "https://example.com/opera-carmen", RESERVADO: 0, FAVORITO: 0 },
        { ID_EVENTO: 110, TITULO: "Maratón de Madrid 2024", CATEGORIA: "Deportes", RATING_ESTRELLAS: 4, NUM_RESEÑAS: 980, UBICACION_CIUDAD: "Madrid", PRECIO_MIN: 50, FECHA_EVENTO: "2024-04-28 08:00", URL_IMAGEN: "https://drive.google.com/thumbnail?id=158sxGzMliFIAze4ZAsiQ8TL56Yvtp7WN&sz=w500", DESCRIPCION: "Corre por las calles de Madrid en uno de los maratones más emblemáticos de España.", VISTO: 0, CONTACTO: "topeventos@gmail.com", ENLACE_DE_RESERVA: "https://example.com/maraton", RESERVADO: 0, FAVORITO: 0 },
        { ID_EVENTO: 111, TITULO: "Conferencia 'El Futuro de la IA'", CATEGORIA: "Conferencias", RATING_ESTRELLAS: 4, NUM_RESEÑAS: 75, UBICACION_CIUDAD: "Madrid", PRECIO_MIN: 25, FECHA_EVENTO: "2024-06-15 10:00", URL_IMAGEN: "https://drive.google.com/thumbnail?id=1ioMt06JSFH0JPlwbGC6xStRVheWpRFr7&sz=w500", DESCRIPCION: "Expertos en inteligencia artificial debaten sobre los avances y el impacto de la IA en nuestra sociedad.", VISTO: 0, CONTACTO: "topeventos@gmail.com", ENLACE_DE_RESERVA: "https://example.com/ia-conferencia", RESERVADO: 0, FAVORITO: 0 }
    ];

    // 2. Inicializamos filteredEvents con una copia de todos los eventos
    filteredEvents = [...eventsData];

    cargarTarjetas();
}
/*************/
/** PANTALLA 1  */
/*************/

/********FUNCIONES PARA LA PANTALLA 1******** */
function cargarTarjetas(datosAMostrar = filteredEvents) {
    const container = document.getElementById('events-list');
    if (!container) return;

    container.innerHTML = ''; 

    // Calculamos cuántos eventos mostrar: (0 hasta página_actual + 1 * eventos_por_página)
    const maxEventos = (currentPage + 1) * eventsPerPage;
    const limite = datosAMostrar.slice(0, maxEventos);

    limite.forEach(evento => {
    // ... (Aquí va todo tu código anterior de generación de la tarjeta y estrellas) ...
    // (Asegúrate de mantener el bloque de estrellasHTML y card.innerHTML que ya tenemos)
    
    // --- COPIA AQUÍ EL BLOQUE DE GENERACIÓN DE TARJETA QUE YA TENÍAS ---
    const precioTexto = evento.PRECIO_MIN === 0 ? "Gratis" : `${evento.PRECIO_MIN.toFixed(2)} €`;
    let estrellasHTML = '';
    for (let i = 1; i <= 5; i++) {
        const color = i <= evento.RATING_ESTRELLAS ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300';
        estrellasHTML += `<i data-lucide="star" class="h-3 w-3 ${color}"></i>`;
    }
    const card = document.createElement('div');
    card.className = "bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transform hover:scale-[1.02] transition duration-300 ease-out cursor-pointer";
    card.setAttribute('onclick', `mostrarPantalla2(${evento.ID_EVENTO})`);
    card.innerHTML = `
        <div class="relative h-40">
            <img src="${evento.URL_IMAGEN}" alt="${evento.TITULO}" class="w-full h-full object-cover">
            <span class="absolute top-2 left-2 bg-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded-full">${evento.CATEGORIA}</span>
        </div>
        <div class="p-4">
            <h3 class="text-xl font-bold text-gray-900 mb-1 truncate">${evento.TITULO}</h3>
            <div class="flex items-center space-x-1 mb-2">
                <div class="flex">${estrellasHTML}</div>
                <span class="text-xs text-gray-400">(${evento.NUM_RESEÑAS})</span>
            </div>
            <p class="text-sm text-gray-500 mb-2 flex items-center space-x-1">
                <i data-lucide="map-pin" class="h-4 w-4"></i>
                <span>${evento.UBICACION_CIUDAD} • ${evento.FECHA_EVENTO}</span>
            </p>
            <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span class="text-xl font-extrabold text-green-600">${precioTexto}</span>
                <button class="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition duration-300">Detalles</button>
            </div>
        </div>
    `;
    container.appendChild(card);
});

// --- LÓGICA PARA OCULTAR EL BOTÓN ---
const btnCargarMas = document.getElementById('btn-cargar-mas');
if (btnCargarMas) {
    // Si los eventos mostrados son iguales o mayores al total de la lista, ocultamos botón
    if (limite.length >= datosAMostrar.length) {
        btnCargarMas.classList.add('hidden');
    } else {
        btnCargarMas.classList.remove('hidden');
    }
}

if (window.lucide) lucide.createIcons();
}
/*************/
/** RF1.09  */
/*CAPTURAR LA ESCRITURA DEL INPUT Y DESPUES FILTRAR*/
/*************/
// Debounce para la búsqueda rápida (RF 1.08)
let searchTimeout;
function activarEscritura() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        filtrarEventosInicio();
    }, 300); // 300ms de retardo
}

function filtrarEventosInicio() {
    const textoBusqueda = document.getElementById('search-input').value.toLowerCase();
    
    // Filtramos eventsData comparando título, categoría o ciudad
    filteredEvents = eventsData.filter(evento => {
        return (
            evento.TITULO.toLowerCase().includes(textoBusqueda) ||
            evento.CATEGORIA.toLowerCase().includes(textoBusqueda) ||
            evento.UBICACION_CIUDAD.toLowerCase().includes(textoBusqueda)
        );
    });

    // Si el input está vacío, mostramos todos de nuevo (respetando el límite de página)
    if (textoBusqueda === "") {
        cargarTarjetas(eventsData);
    } else {
        // Si hay búsqueda, mostramos los filtrados
        cargarTarjetas(filteredEvents);
    }
}

/*************/
/** RF1.03  */
/*CARGAR MAS EVENTOS*/
/*************/
function cargarMasEventos() {
    // 1. Aumentamos la página actual
    currentPage++;
    
    // 2. Volvemos a renderizar las tarjetas
    // Como cargarTarjetas usa slice(0, (currentPage + 1) * eventsPerPage),
    // ahora mostrará más elementos.
    cargarTarjetas();
}


/**---FIN---- */

// --- DISPARADOR DE INICIO ---
window.onload = function() {
    console.log("Página cargada. Iniciando sistemasadfasdfasdfasdfasdfasdfasdfasdf...");
    
    // 1. Dibujar iconos iniciales (Menú, perfil, etc.)
    if (window.lucide) {
        lucide.createIcons();
    }

    // 2. Ejecutar la carga de datos y tarjetas
    cargarEventos();

};


