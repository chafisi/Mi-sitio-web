<!-- ###################################################################### -->
    <!-- LÓGICA JAVASCRIPT -->
    <!-- ###################################################################### -->

// Placeholder para la URL de la API de Google Apps Script
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwlFtiPHwIAImM1uDQLudy8geqqR00LEWU2VOT_XFZLqIXlipmsDMy2V6l2Xgvw88H7/exec"; // ¡REEMPLAZAR CON LA URL REAL!

let eventsData = []; // Almacena todos los datos de la hoja de cálculo
let filteredEvents = []; // Eventos después de aplicar filtros y búsqueda
let currentPage = 0;
const eventsPerPage = 6;
let activeTab = 'valorados'; // RF 1.11: Valorados es el default
let currentView = 'PAN1';
let currentEvent = null; // Almacena el evento actual en PAN2

// #################################################################
// UTILITIES
// #################################################################

// Inicializa los iconos de Lucide
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    loadEvents();
    // Inicializa el contador del carrito al cargar
    updateCartCounter();
});

/**
 * Ajusta el parámetro 'sz' de una URL de thumbnail de Google Drive.
 * @param {string} url La URL original de la imagen.
 * @param {string} size El tamaño deseado (ej: 'w80', 'w800').
 * @returns {string} La URL optimizada.
 */
function getOptimizedImageUrl(url, size) {
    if (!url || typeof url !== 'string') {
        // Fallback si la URL es inválida
        return 'https://placehold.co/800x400/94a3b8/FFFFFF?text=IMG+Error';
    }

    // Regex para encontrar '?sz=...' o '&sz=...' y lo que le siga
    const sizeRegex = /([?&])sz=[^&]*/;

    if (url.match(sizeRegex)) {
        // Reemplaza el parámetro 'sz' existente
        return url.replace(sizeRegex, `$1sz=${size}`);
    } else {
        // Añade el parámetro 'sz' al final. Usa '?' si no hay, o '&' si ya hay parámetros
        return url.includes('?') ? `${url}&sz=${size}` : `${url}?sz=${size}`;
    }
}

// Función para simular el formato de estrellas (RF 1.02)
function getStarRating(rating) {
    const fullStar = '<i data-lucide="star" class="w-4 h-4 text-yellow-500 fill-yellow-400 inline"></i>';
    const emptyStar = '<i data-lucide="star" class="w-4 h-4 text-gray-300 inline"></i>';
    
    let starsHtml = '';
    // Asegurarse de que el icono de estrella se actualice si es necesario
    lucide.createIcons(); 
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            starsHtml += fullStar;
        } else {
            starsHtml += emptyStar;
        }
    }
    return starsHtml;
}

// Debounce para la búsqueda rápida (RF 1.08)
let searchTimeout;
function debounceSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        applyFiltersAndRender();
    }, 300); // 300ms de retardo
}

// Función para simular un modal de éxito/error (Reemplaza a alert())
function showMessage(message, type = 'success') {
    const backgroundColor = type === 'success' ? 'bg-emerald-500' : 'bg-red-500';
    const html = `
        <div class="fixed top-20 left-1/2 transform -translate-x-1/2 ${backgroundColor} text-white px-4 py-2 rounded-lg shadow-xl z-50 transition-opacity duration-300" role="alert" style="max-width: 90%;">
            ${message}
        </div>
    `;
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);

    setTimeout(() => {
        container.remove();
    }, 3000);
}

// #################################################################
// RENDERIZADO Y VISTAS (PANEL 1)
// #################################################################

// Función para renderizar una única tarjeta de evento
// Función para renderizar una única tarjeta de evento
function renderEventCard(event) {
    // Obtener la URL optimizada para la miniatura (usamos 800px para el nuevo diseño grande)
    const thumbnailUrl = getOptimizedImageUrl(event.URL_IMAGEN, 'w800');

    // Uso del símbolo del Euro (€)
    const priceText = event.PRECIO_MIN > 0 ? `${event.PRECIO_MIN.toFixed(0)} €` : 'Gratis';
    const priceColor = event.PRECIO_MIN > 0 ? 'text-green-600 font-bold' : 'text-cyan-600 font-bold';
    const ratingHtml = getStarRating(event.RATING_ESTRELLAS);

    // Nuevo diseño de tarjeta con imagen destacada (Estilo 4-2-1)
    return `
        <div onclick="handleNavigation('PAN2', ${event.ID_EVENTO})" class="bg-white rounded-xl shadow-lg card-effect cursor-pointer group overflow-hidden">
            
            <div class="h-48 overflow-hidden">
                <img src="${thumbnailUrl}" 
                        onerror="this.onerror=null; this.src='https://placehold.co/800x400/94a3b8/FFFFFF?text=IMG+Evento';" 
                        alt="${event.TITULO}" 
                        class="w-full h-full object-cover transition duration-300 group-hover:scale-105">
            </div>

            <div class="p-4">
                <div class="flex items-start justify-between">
                    <div class="min-w-0 pr-2">
                        <h3 class="text-xl font-extrabold text-gray-900 truncate">${event.TITULO}</h3>
                        <p class="text-sm text-gray-500 mt-1 truncate">
                            ${event.UBICACION_CIUDAD}, ${new Date(event.FECHA_EVENTO).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} • ${new Date(event.FECHA_EVENTO).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    <span class="flex-shrink-0 bg-cyan-100 text-cyan-800 text-xs px-2 py-0.5 rounded-full font-semibold">${event.CATEGORIA}</span>
                </div>
                
                <div class="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                    <div class="flex items-center space-x-1">
                        ${ratingHtml}
                    </div>
                    <span class="${priceColor} text-lg">${priceText}</span>
                </div>
            </div>
        </div>
    `;
}

// Renderiza el lote actual de eventos en el DOM
function appendEventsToDOM(events, isNewLoad = false) {
    const listContainer = document.getElementById('events-list');
    
    if (isNewLoad) {
        listContainer.innerHTML = '';
    }
    
    const start = currentPage * eventsPerPage;
    const end = start + eventsPerPage;
    const eventsToRender = events.slice(start, end);

    if (eventsToRender.length === 0 && isNewLoad) {
        listContainer.innerHTML = '<p class="col-span-full text-center text-gray-500 mt-10">No se encontraron eventos con los criterios actuales.</p>';
        document.getElementById('load-more-container').classList.add('hidden');
    } else {
        eventsToRender.forEach(event => {
            listContainer.innerHTML += renderEventCard(event);
        });
        // Vuelve a crear los iconos después de inyectar el HTML
        lucide.createIcons();
        
        // Mostrar/Ocultar el botón "Cargar Más"
        if (end < events.length) {
            document.getElementById('load-more-container').classList.remove('hidden');
        } else {
            document.getElementById('load-more-container').classList.add('hidden');
        }
    }
}

// Carga más eventos al hacer clic en el botón (RF 1.03)
function loadMoreEvents() {
    currentPage++;
    appendEventsToDOM(filteredEvents, false);
}

// #################################################################
// RENDERIZADO Y VISTAS (PANEL 2: DETALLE)
// #################################################################

// Variable global para el ID del evento actual en PAN2
let currentEventId = null;

/**
 * Función para renderizar la pantalla de detalle del evento (PAN2)
 *
 * @param {number} eventId - El ID del evento a mostrar.
 */
function renderEventDetail(eventId) {
    const event = eventsData.find(e => e.ID_EVENTO === eventId);
    if (!event) {
        showMessage('Error: Evento no encontrado.', 'error');
        return;
    }
    
    // 1. Guardar el ID actual y datos de estado
    currentEventId = eventId;

    // Obtener datos formateados
    const optimizedImageUrl = getOptimizedImageUrl(event.URL_IMAGEN, 'w1200');
    // Formato de fecha detallado (Ej: viernes, 15 de Noviembre de 2025)
    const dateStr = new Date(event.FECHA_EVENTO).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    // Formato de hora (Ej: 20:00)
    const timeStr = new Date(event.FECHA_EVENTO).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    // Formato de precio
    const priceText = event.PRECIO_MIN > 0 ? `${event.PRECIO_MIN.toFixed(2)} €` : 'Gratis';
    // Clase de color para el precio (verde para pago, cian para gratis/destacado)
    const priceColorClass = event.PRECIO_MIN > 0 ? 'text-green-600' : 'text-cyan-600';
    
    // Lógica de estado simulada con localStorage
    const isFavorite = localStorage.getItem(`favorite-${eventId}`) === 'true';
    const isReserved = localStorage.getItem(`reserved-${eventId}`) === 'true';

    // 2. Renderizar el HEADER (Imagen de cabecera)
    const headerImageDiv = document.getElementById('pan2-header-image');
    headerImageDiv.innerHTML = `
        <img src="${optimizedImageUrl}" 
             onerror="this.onerror=null; this.src='https://placehold.co/1000x500/3b82f6/ffffff?text=CONCIERTO+DESTACADO';" 
             alt="${event.TITULO}" 
             class="w-full h-full object-cover">
    `;

    // 3. Renderizar el BODY (Contenido principal)
    const contentBody = document.getElementById('pan2-content-body');
    
    contentBody.innerHTML = `
        <!-- Título -->
        <h1 class="text-4xl font-extrabold text-gray-900 mb-4">${event.TITULO}</h1>
        
        <!-- Valoración -->
        <div class="mb-4">
            ${getStarRating(event.RATING_ESTRELLAS)}
        </div>

        <!-- Metadatos Clave -->
        <div class="space-y-3 mb-6 border-b pb-4">
            <!-- Fecha -->
            <p class="text-lg text-gray-700 flex items-center space-x-3">
                <i data-lucide="calendar" class="h-6 w-6 text-cyan-600"></i>
                <span class="font-semibold">Fecha:</span> ${dateStr}
            </p>
            <!-- Hora -->
            <p class="text-lg text-gray-700 flex items-center space-x-3">
                <i data-lucide="clock" class="h-6 w-6 text-cyan-600"></i>
                <span class="font-semibold">Hora:</span> ${timeStr}
            </p>
            <!-- Ubicación -->
            <p class="text-lg text-gray-700 flex items-center space-x-3">
                <i data-lucide="map-pin" class="h-6 w-6 text-cyan-600"></i>
                <span class="font-semibold">Ubicación:</span> ${event.UBICACION_CIUDAD}, ${event.UBICACION_DIRECCION}.
            </p>
        </div>

        <!-- Descripción Completa -->
        <h2 class="text-2xl font-bold text-gray-800 mb-3">Sobre el Evento</h2>
        <p class="text-gray-600 mb-6 leading-relaxed">
            ${event.DESCRIPCION}
        </p>

        <!-- Precio Destacado -->
        <div class="text-center p-4 bg-cyan-50 rounded-xl">
            <span class="text-sm font-medium text-gray-600 block">Precio base por persona desde</span>
            <span class="text-4xl font-extrabold ${priceColorClass}">${priceText}</span>
        </div>
    `;
    
    // 4. Renderizar el FOOTER (Botón CTA)
    const reserveBtn = document.getElementById('pan2-reserve-btn');
    
    if (isReserved) {
        reserveBtn.textContent = `¡Entradas reservadas!`;
        reserveBtn.classList.remove('bg-cyan-600', 'shadow-cyan-500/50', 'hover:bg-cyan-700');
        reserveBtn.classList.add('bg-green-600', 'shadow-green-500/50', 'hover:bg-green-700');
    } else {
        reserveBtn.textContent = `Reservar ahora (${priceText})`;
        reserveBtn.classList.add('bg-cyan-600', 'shadow-cyan-500/50', 'hover:bg-cyan-700');
        reserveBtn.classList.remove('bg-green-600', 'shadow-green-500/50', 'hover:bg-green-700');
    }

    // 5. Actualizar el icono de favorito
    updateFavoriteIcon(eventId, isFavorite);
    
    // 6. Volver a renderizar los iconos de Lucide (necesario para el contenido inyectado dinámicamente)
    lucide.createIcons();
}

/**
 * Función auxiliar para actualizar el icono de favorito en PAN2.
 * Muestra un corazón relleno (rojo) si es favorito, o solo el contorno si no lo es.
 *
 * @param {number} eventId - El ID del evento.
 * @param {boolean} isFavorite - Si el evento está marcado como favorito.
 */
function updateFavoriteIcon(eventId, isFavorite) {
    const iconElement = document.getElementById('pan2-favorite-icon');
    if (!iconElement) return;

    if (isFavorite) {
        // Favorito: Corazón relleno y color rojo
        iconElement.setAttribute('data-lucide', 'heart');
        iconElement.classList.add('fill-red-500', 'text-red-500');
        iconElement.classList.remove('text-gray-800');
    } else {
        // No Favorito: Contorno de corazón y color gris
        iconElement.setAttribute('data-lucide', 'heart'); 
        iconElement.classList.remove('fill-red-500', 'text-red-500');
        iconElement.classList.add('text-gray-800');
    }
    // Recrear iconos para aplicar los cambios SVG
    lucide.createIcons();
}

// #################################################################
// LÓGICA DE DATOS Y FILTRADO (PANEL 1)
// #################################################################

// Filtra y ordena los eventos según la pestaña activa y la búsqueda
function applyFiltersAndRender(resetPage = true) {
    if (resetPage) {
        currentPage = 0;
    }
    
    const query = document.getElementById('search-input').value.toLowerCase();
    const listTitle = document.getElementById('list-title');

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

// Carga inicial de datos desde la API
async function loadEvents() {
    const spinner = document.getElementById('loading-spinner');
    spinner.classList.remove('hidden');
    document.getElementById('events-list').innerHTML = ''; // Limpia por si acaso

    // SIMULACIÓN DE DATOS (Necesario para que el prototipo funcione sin la URL real)
    try {
        const response = await fetch(GAS_WEB_APP_URL);
        const result = await response.json();

        if (result.status === 'success' && result.data) {
            eventsData = result.data;
        } else {
                // Si falla, usa los datos mock
            throw new Error(result.error || 'Respuesta inesperada de la API.');
        }
    } catch (error) {
        console.warn("Fallo al conectar con la API o respuesta inválida. Usando datos simulados. Reemplace 'GAS_WEB_APP_URL' con la URL real.", error);
        
        // URLs de ejemplo con el formato drive.google.com/thumbnail
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
    }

    applyFiltersAndRender(true);
    spinner.classList.add('hidden');
    updateCartCounter();
}

// #################################################################
// ACTUALIZACIÓN DE ESTADO (POST/PATCH SIMULADO)
// #################################################################

// Función para actualizar el estado FAVORITO
async function toggleFavorite(eventId) {
    if (!eventId) return;
    const event = eventsData.find(e => e.ID_EVENTO === eventId);
    if (!event) return showMessage('Error: Evento no encontrado para actualizar.', 'error');

    const newFavoriteStatus = event.FAVORITO === 1 ? 0 : 1;
    
    // Simulación de la petición POST/PATCH a GAS
    try {
        // await fetch(GAS_WEB_APP_URL, { ... cuerpo de la petición ... });
        
        // Actualizar el estado localmente
        event.FAVORITO = newFavoriteStatus;
        updateFavoriteButton(newFavoriteStatus);
        showMessage(newFavoriteStatus === 1 ? '¡Evento añadido a Favoritos!' : 'Evento eliminado de Favoritos.', 'success');
        
    } catch (error) {
        console.error("Error al actualizar favorito:", error);
        showMessage('Fallo en la conexión al servidor. Inténtelo de nuevo.', 'error');
    }
}

// Función para simular la reserva de una entrada (sólo se permite 1)
async function makeReservation(eventId, currentReserved) {
    if (currentReserved > 0) {
        // Mostrar un mensaje más informativo para el usuario
        return showMessage('Ya tienes una reserva para este evento. Consulta "Mi Agenda".', 'error');
    }
    
    const event = eventsData.find(e => e.ID_EVENTO === eventId);
    if (!event) return showMessage('Error: Evento no encontrado para reservar.', 'error');

    const newReserved = 1; // Reservamos 1 entrada

    // Simulación de la petición POST/PATCH a GAS
    try {
        // await fetch(GAS_WEB_APP_URL, { ... cuerpo de la petición ... });
        
        // Actualizar el estado localmente y recargar la vista de detalle
        event.RESERVADO = newReserved;
        renderEventDetail(eventId); // Recargar PAN2 para actualizar el botón
        updateCartCounter();
        showMessage('¡Reserva confirmada! 1 entrada añadida a tu Agenda.', 'success');
        
    } catch (error) {
        console.error("Error al reservar:", error);
        showMessage('Fallo en la conexión al servidor. Inténtelo de nuevo.', 'error');
    }
}

// Actualiza el contador del carrito (RF 1.07)
function updateCartCounter() {
    const totalReservados = eventsData.reduce((sum, event) => sum + (event.RESERVADO || 0), 0);
    document.getElementById('cart-counter').textContent = totalReservados;
}


// #################################################################
// NAVEGACIÓN Y ESTADO DE LA UI
// #################################################################

// Muestra u oculta los contenedores principales y headers
function setView(pan) {
    currentView = pan;
    const pan1Main = document.getElementById('pan1-main-content');
    const pan2Detail = document.getElementById('pan2-detail');
    const pan1Header = document.getElementById('pan1-header');
    const pan2Header = document.getElementById('pan2-header');
    const navBar = document.getElementById('main-navbar');
    
    // Gestiona el padding del body (quitamos el espacio del navbar en PAN2)
    document.body.classList.remove('body-pan2');

    if (pan === 'PAN1') {
        pan1Main.classList.remove('hidden');
        pan1Header.classList.remove('hidden');
        navBar.classList.remove('hidden');
        pan2Detail.classList.add('hidden');
        pan2Header.classList.add('hidden');
        currentEvent = null; // Limpiar evento actual
        applyFiltersAndRender(false); // Refrescar la lista sin resetear la paginación/filtros
    } else if (pan === 'PAN2') {
        pan1Main.classList.add('hidden');
        pan1Header.classList.add('hidden');
        navBar.classList.add('hidden');
        pan2Detail.classList.remove('hidden');
        pan2Header.classList.remove('hidden');
        document.body.classList.add('body-pan2');
    }
    // Las vistas PAN3 y PAN4 se implementarán después
}


// Manejo de la navegación entre pantallas (RF 1.04, 1.09, 1.12)
function handleNavigation(pan, eventId = null) {
    if (pan === 'PAN2' && eventId) {
        // Navegación a Detalle
        renderEventDetail(eventId);
        setView('PAN2');
        window.scrollTo(0, 0); // Ir al inicio de la página
    } else if (pan === 'PAN1') {
        // Volver al Home
        setView('PAN1');
    } else if (pan === 'PAN3') {
        // RF 1.09: Navegación a filtros
        showMessage('Simulación: Navegando a Pantalla 3 (Filtros Avanzados)', 'error');
    } else if (pan === 'PAN_CARRITO' || pan === 'perfil') {
        // RF 1.12: Navegación a Perfil/Agenda
        showMessage('Simulación: Navegando a Pantalla 4 (Mi Agenda/Perfil - Reservas)', 'error');
    } else {
        showMessage(`Acción o vista no implementada: ${pan}`, 'error');
    }
}

// Cambia la pestaña activa (RF 1.10, 1.11, 1.13)
function setActiveTab(tabName) {
    if (currentView !== 'PAN1') return; // Solo funciona en la vista principal

    if (tabName === 'perfil') {
        handleNavigation('perfil'); // RF 1.12
        return;
    }
    
    if (activeTab === tabName) return; // No hacer nada si ya está activa

    activeTab = tabName;

    // RF 1.13: Actualizar estilos visuales
    const tabs = ['cercanos', 'valorados', 'perfil'];
    tabs.forEach(tab => {
        const button = document.getElementById(`tab-${tab}`);
        const icon = button.querySelector('i');
        const span = button.querySelector('span');

        if (tab === activeTab) {
            // Estilo Activo (RF 1.13)
            button.classList.add('scale-110', 'shadow-lg', 'bg-cyan-50', 'text-cyan-600');
            button.classList.remove('hover:scale-105');
            icon.classList.add('text-cyan-600', 'fill-cyan-400');
            icon.classList.remove('text-gray-400');
            span.classList.add('font-bold', 'text-cyan-600');
            span.classList.remove('text-gray-500', 'font-medium');
        } else {
            // Estilo Inactivo
            button.classList.remove('scale-110', 'shadow-lg', 'bg-cyan-50', 'text-cyan-600');
            button.classList.add('hover:scale-105');
            icon.classList.remove('text-cyan-600', 'fill-cyan-400');
            icon.classList.add('text-gray-400');
            span.classList.remove('font-bold', 'text-cyan-600');
            span.classList.add('text-gray-500', 'font-medium');
        }
    });
    
    // Re-renderizar con el nuevo filtro (RF 1.10, 1.11)
    applyFiltersAndRender();
}