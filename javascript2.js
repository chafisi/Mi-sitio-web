/*<!-- ---------------------------------------------------- -->
    <!-- LÓGICA DE NAVEGACIÓN (JAVASCRIPT) -->
    <!-- ---------------------------------------------------- -->*/
    
//alert("El archivo JS se ha cargado correctamente");
console.log("Prueba de consola");

    // Inicializar Iconos Lucide
lucide.createIcons();

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
let eventsData = []; // Aquí se guardarán los eventos (de Google o Mock)
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

    cargarTarjetas();
}

/********FUNCIONES PARA LA PANTALLA 1******** */
function cargarTarjetas() {
    //Se definió la clase event-list que es el listado de eventos de PAN1 donde están las tarjetas y ahora las vamos a cargar conectando con el modelo de datos
    const container = document.getElementById('events-list');
    if (!container) return;

    container.innerHTML = ''; // Limpiar el grid antes de cargar los datos

    eventsData.forEach(evento => {
        // Formatear el precio (si es 0 poner Gratis)
        const precioTexto = evento.PRECIO_MIN === 0 ? "Gratis" : `${evento.PRECIO_MIN.toFixed(2)} €`;
        
        // Crear el elemento div de la tarjeta
        const card = document.createElement('div');
        card.className = "bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transform hover:scale-[1.02] transition duration-300 ease-out cursor-pointer";
        
        // Al hacer clic, llamamos a mostrarPantalla2 pasando el ID del evento
        card.setAttribute('onclick', `mostrarPantalla2(${evento.ID_EVENTO})`);

        card.innerHTML = `
            <div class="relative h-40">
                <img src="${evento.URL_IMAGEN}" alt="${evento.TITULO}" class="w-full h-full object-cover">
                <span class="absolute top-2 left-2 bg-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    ${evento.CATEGORIA}
                </span>
            </div>
            <div class="p-4">
                <h3 class="text-xl font-bold text-gray-900 mb-1 truncate">${evento.TITULO}</h3>
                <p class="text-sm text-gray-500 mb-2 flex items-center space-x-1">
                    <i data-lucide="map-pin" class="h-4 w-4"></i>
                    <span>${evento.UBICACION_CIUDAD} • ${evento.FECHA_EVENTO}</span>
                </p>
                <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span class="text-xl font-extrabold text-green-600">${precioTexto}</span>
                    <button class="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition duration-300">
                        Detalles
                    </button>
                </div>
            </div>
        `;

        container.appendChild(card);
    });

    // Re-ejecutar Lucide para que los iconos (map-pin) se dibujen en las nuevas tarjetas
    if (window.lucide) {
        lucide.createIcons();
    }
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

// Filtra y ordena los eventos según la pestaña activa y la búsqueda
function filtrarEventosInicio() {
    
    const query = document.getElementById('search-input').value.toLowerCase();
    //const listTitle = document.getElementById('list-title');

    // 1. Filtrado por Búsqueda (RF 1.08)
    let tempEvents = eventsData.filter(event => {
        const searchMatch = event.TITULO.toLowerCase().includes(query) ||
                            event.CATEGORIA.toLowerCase().includes(query) ||
                            event.UBICACION_CIUDAD.toLowerCase().includes(query);
        return searchMatch;
    });
    
    // 2. Ordenación y Título según Tab Activa (RF 1.10, 1.11)
    if (activeTab === 'valorados') {
        // RF 1.11: Ordenar por RATING_ESTRELLAS
        tempEvents.sort((a, b) => b.RATING_ESTRELLAS - a.RATING_ESTRELLAS);
        listTitle.textContent = "Mejor Valorados";
    } else if (activeTab === 'cercanos') {
        // RF 1.10: Simulación de ordenación por Cercanía (usaremos ID_EVENTO como proxy)
        tempEvents.sort((a, b) => a.ID_EVENTO - b.ID_EVENTO); 
        listTitle.textContent = "Eventos Cercanos";
    } else {
            // Default: Próximos Eventos (Ordenado por fecha)
            tempEvents.sort((a, b) => new Date(a.FECHA_EVENTO) - new Date(b.FECHA_EVENTO));
            listTitle.textContent = "Próximos Eventos";
    }

    filteredEvents = tempEvents;
    appendEventsToDOM(filteredEvents, true); // Renderiza desde la primera página
}



/**---FIN---- */

// --- DISPARADOR DE INICIO ---
window.onload = function() {
    console.log("Página cargada. Iniciando sistema...");
    
    // 1. Dibujar iconos iniciales (Menú, perfil, etc.)
    if (window.lucide) {
        lucide.createIcons();
    }

    // 2. Ejecutar la carga de datos y tarjetas
    cargarEventos();

};
