/*<!-- ---------------------------------------------------- -->
    <!-- LÓGICA DE NAVEGACIÓN (JAVASCRIPT) -->
    <!-- ---------------------------------------------------- -->*/
    
//alert("v13.3");
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
    
    // --- NUEVO: Si la pantalla es la 4, cargamos la agenda antes de mostrar ---
    if (pantallaId === 'pantalla4') {
        if (typeof cargarAgenda === "function") {
            cargarAgenda(); 
        }
    }

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

    window.scrollTo(0, 0);

    // --- Lógica de la TabBar ---
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('nav-item-active', 'text-cyan-500', 'transform', 'scale-110', '-translate-y-2');
        item.classList.add('text-gray-500', 'hover:text-indigo-600', 'group');
    });

    let activeItemId = null;
    if (pantallaId === 'pantalla1' || pantallaId === 'pantalla2' || pantallaId === 'pantalla3') {
        activeItemId = 'nav-valorados';
    } else if (pantallaId === 'pantalla4') {
        activeItemId = 'nav-perfil';
    }

    if (activeItemId) {
        const activeItem = document.getElementById(activeItemId);
        if (activeItem) {
            activeItem.classList.remove('text-gray-500', 'hover:text-indigo-600', 'group');
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
    cargarAgenda(); // Cargamos los datos frescos del array
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


// Inicializar en PAN1 al cargar la página y configurar el TabBar
window.onload = () => {
// Asegura que se muestre PAN1 y se configure el TabBar inicial
mostrarPantalla('pantalla1');
// Asegura que la pestaña inicial de PAN4 sea 'comprados'
selectTab('comprados');
};

//*****************FUNCIONES PARA CARGAR LOS DATOS DESDE GOOGLE SHEETS Y SI NO FUNCIONA LO HACEMOS MANUALMENTE****************
//************************************************************************************************************************** */

//No se ha implementado porque en la primera revisión no se enlazaba. Se posee el código pero
//daba problemas por la autenticación de google
let GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwlFtiPHwIAImM1uDQLudy8geqqR00LEWU2VOT_XFZLqIXlipmsDMy2V6l2Xgvw88H7/exec';

// Carga inicial de datos desde la API
async function cargarEventos() {
        
    // URLs de ejemplo con el formato drive.google.com/thumbnailasd
    eventsData = [
        { ID_EVENTO: 101, TITULO: "El Rey León, El Musical", CATEGORIA: "Musicales", RATING_ESTRELLAS: 5, NUM_RESEÑAS: 542, UBICACION_CIUDAD: "Madrid", PRECIO_MIN: 35, FECHA_EVENTO: "2026-01-25 20:00", URL_IMAGEN: "https://drive.google.com/thumbnail?id=1wL1MID8BLWZL0PvzkLqNh61jb4i4S1ey&sz=w500", DESCRIPCION: "Una experiencia teatral inolvidable que transporta al espectador a la sabana africana. Con impresionantes vestuarios y música icónica.", VISTO: 1, CONTACTO: "reyleon@gmail.com", ENLACE_DE_RESERVA: "https://example.com/rey-leon", RESERVADO: 1, FAVORITO: 0 },
        { ID_EVENTO: 102, TITULO: "Monólogo de Raúl Antón2", CATEGORIA: "Monólogos", RATING_ESTRELLAS: 3, NUM_RESEÑAS: 187, UBICACION_CIUDAD: "Ibi", PRECIO_MIN: 28, FECHA_EVENTO: "2026-01-24 21:30", URL_IMAGEN: "https://drive.google.com/thumbnail?id=1pC3oHgZ6WPcXGjxbrJdZzbbBiSlqvbmA&sz=w500", DESCRIPCION: "Noche de risas garantizadas con el humor irreverente y cercano de Raúl Antón. ¡No pararás de reír!", VISTO: 1, CONTACTO: "raulanton12@gmail.com", ENLACE_DE_RESERVA: "https://example.com/raul-anton", RESERVADO: 0, FAVORITO: 1 },
        { ID_EVENTO: 103, TITULO: "Concierto de Nathy Peluso", CATEGORIA: "Musicales", RATING_ESTRELLAS: 5, NUM_RESEÑAS: 310, UBICACION_CIUDAD: "Alicante", PRECIO_MIN: 45, FECHA_EVENTO: "2026-01-31 22:00", URL_IMAGEN: "https://drive.google.com/thumbnail?id=1GxPncAi_Gmh6ZJJSVpY8UvF-b7EFlw2o&sz=w500", DESCRIPCION: "La artista argentina Nathy Peluso en vivo, presentando sus éxitos y nuevos temas con su inconfundible estilo.", VISTO: 0, CONTACTO: "eventime23@gmail.com", ENLACE_DE_RESERVA: "https://example.com/nathy-peluso", RESERVADO: 0, FAVORITO: 1 },
        { ID_EVENTO: 104, TITULO: "Festival de Jazz de Madrid", CATEGORIA: "Festivales", RATING_ESTRELLAS: 5, NUM_RESEÑAS: 250, UBICACION_CIUDAD: "Elche", PRECIO_MIN: 25, FECHA_EVENTO: "2026-01-15 19:00", URL_IMAGEN: "https://drive.google.com/thumbnail?id=1swDqkti9GTl9tUlE3lvYJa_YaZTOkJkH&sz=w500", DESCRIPCION: "Una selección de los mejores talentos del jazz nacional e internacional en diferentes escenarios de la ciudad.", VISTO: 0, CONTACTO: "jazzmadrid@gmail.com", ENLACE_DE_RESERVA: "https://example.com/jazz-madrid", RESERVADO: 1, FAVORITO: 0 },
        { ID_EVENTO: 106, TITULO: "Formula 1 Madrid Grand Prix", CATEGORIA: "Motor", RATING_ESTRELLAS: 5, NUM_RESEÑAS: 789, UBICACION_CIUDAD: "Madrid", PRECIO_MIN: 150, FECHA_EVENTO: "2026-01-19 15:00", URL_IMAGEN: "https://drive.google.com/thumbnail?id=1PHrEk1X9SppVzf2Jnl1EAdOcTO7BYLFN&sz=w500", DESCRIPCION: "La emoción de la Fórmula 1 llega a Madrid con una carrera urbana espectacular. Vive la velocidad y la adrenalina en primera persona.", VISTO: 1, CONTACTO: "f1best@gmail.com", ENLACE_DE_RESERVA: "https://example.com/f1", RESERVADO: 0, FAVORITO: 0 },
        { ID_EVENTO: 107, TITULO: "Exposición Maestros del Renacimiento", CATEGORIA: "Arte", RATING_ESTRELLAS: 4, NUM_RESEÑAS: 120, UBICACION_CIUDAD: "Valencia", PRECIO_MIN: 15, FECHA_EVENTO: "2026-01-30 11:00", URL_IMAGEN: "https://drive.google.com/thumbnail?id=1Fn1KKqiCYKu1iudHCE0W8_JEGPHDw8xN&sz=w500", DESCRIPCION: "Un viaje a través de las obras cumbre de los grandes artistas del Renacimiento europeo.", VISTO: 1, CONTACTO: "topeventos@gmail.com", ENLACE_DE_RESERVA: "https://example.com/renacimiento", RESERVADO: 0, FAVORITO: 0 },
        { ID_EVENTO: 108, TITULO: "Festival de Comedia Indie", CATEGORIA: "Comedia", RATING_ESTRELLAS: 4, NUM_RESEÑAS: 65, UBICACION_CIUDAD: "Barcelona", PRECIO_MIN: 18, FECHA_EVENTO: "2026-01-17 21:00", URL_IMAGEN: "https://drive.google.com/thumbnail?id=16YwfLSk9E_N9hxr2VS24bedOBiHvgbTg&sz=w500", DESCRIPCION: "Descubre nuevas voces del stand-up y monólogos emergentes en este festival innovador.", VISTO: 0, CONTACTO: "topeventos@gmail.com", ENLACE_DE_RESERVA: "https://example.com/comedia-indie", RESERVADO: 0, FAVORITO: 0 },
        { ID_EVENTO: 109, TITULO: "Ópera: Carmen en el Real", CATEGORIA: "Ópera", RATING_ESTRELLAS: 4, NUM_RESEÑAS: 450, UBICACION_CIUDAD: "Madrid", PRECIO_MIN: 70, FECHA_EVENTO: "2026-01-20 20:30", URL_IMAGEN: "https://drive.google.com/thumbnail?id=1Dn2qJt1KykWpFRJKwYxsNoHIhlLVY8lK&sz=w500", DESCRIPCION: "La icónica ópera de Bizet, Carmen, interpretada por un elenco de talla mundial en el Teatro Real.", VISTO: 0, CONTACTO: "topeventos@gmail.com", ENLACE_DE_RESERVA: "https://example.com/opera-carmen", RESERVADO: 0, FAVORITO: 0 },
        { ID_EVENTO: 110, TITULO: "Maratón de Madrid 2024", CATEGORIA: "Deportes", RATING_ESTRELLAS: 4, NUM_RESEÑAS: 980, UBICACION_CIUDAD: "Valencia", PRECIO_MIN: 50, FECHA_EVENTO: "2026-01-28 08:00", URL_IMAGEN: "https://drive.google.com/thumbnail?id=158sxGzMliFIAze4ZAsiQ8TL56Yvtp7WN&sz=w500", DESCRIPCION: "Corre por las calles de Madrid en uno de los maratones más emblemáticos de España.", VISTO: 0, CONTACTO: "topeventos@gmail.com", ENLACE_DE_RESERVA: "https://example.com/maraton", RESERVADO: 1, FAVORITO: 0 },
        { ID_EVENTO: 111, TITULO: "Conferencia 'El Futuro de la IA'", CATEGORIA: "Conferencias", RATING_ESTRELLAS: 4, NUM_RESEÑAS: 75, UBICACION_CIUDAD: "Elche", PRECIO_MIN: 25, FECHA_EVENTO: "2026-01-15 10:00", URL_IMAGEN: "https://drive.google.com/thumbnail?id=1ioMt06JSFH0JPlwbGC6xStRVheWpRFr7&sz=w500", DESCRIPCION: "Expertos en inteligencia artificial debaten sobre los avances y el impacto de la IA en nuestra sociedad.", VISTO: 0, CONTACTO: "topeventos@gmail.com", ENLACE_DE_RESERVA: "https://example.com/ia-conferencia", RESERVADO: 0, FAVORITO: 0 }
    ];

    // 2. Inicializamos filteredEvents con una copia de todos los eventos
    filteredEvents = [...eventsData];

    //V5 para pasar a la V6 establecemos la nueva tab dejo comentado
    cargarTarjetas();
    // En lugar de llamar a cargarTarjetas() directamente, usamos nuestra nueva lógica:
    setActiveTab('valorados');
}
/*************/
/** PANTALLA 1  */
/*************/

/********FUNCIONES PARA LA PANTALLA 1******** */
function cargarTarjetas(datosAMostrar = filteredEvents) {
    const container = document.getElementById('events-list');
    if (!container) return;

    container.innerHTML = ''; 

    //V13 mostrar si no hay resultados
    if (datosAMostrar.length === 0) {
        container.innerHTML = `
            <div class="col-span-full py-12 text-center">
                <p class="text-gray-400">No se han encontrado eventos con esos filtros.</p>
            </div>`;
        return;
    }

    // Calculamos cuántos eventos mostrar: (0 hasta página_actual + 1 * eventos_por_página)
    const maxEventos = (currentPage + 1) * eventsPerPage;
    const limite = datosAMostrar.slice(0, maxEventos);

    limite.forEach(evento => {
    // ... (Aquí va todo tu código anterior de generación de la tarjeta y estrellas) ...
    // (Asegúrate de mantener el bloque de estrellasHTML y card.innerHTML que ya tenemos)
    
    // --- AQUÍ PONEMOS LA TARJETA QUE YA CREAMOS EN PROTOTIPO 1 ---
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

/*************/
/** RF1.10  */
/*DISTANCIA A CIUDADES PARA MOSTRAR LAS TARJETAS MÁS PRÓXIMAS A LA UBICACIÓN*/
/*************/
const COORDENADAS_CIUDADES = {
    "Alicante": { lat: 38.3452, lon: -0.4810 },
    "Ibi": { lat: 38.6264, lon: -0.5735 },
    "Elche": { lat: 38.2622, lon: -0.7011 },
    "Madrid": { lat: 40.4168, lon: -3.7038 },
    "Valencia": { lat: 39.4699, lon: -0.3763 },
    "Barcelona": { lat: 41.3851, lon: 2.1734 }
};

// Función auxiliar para calcular distancia lineal simple
function calcularDistancia(ciudadDestino) {
    const origen = COORDENADAS_CIUDADES["Alicante"];
    const destino = COORDENADAS_CIUDADES[ciudadDestino] || { lat: 40, lon: -3 }; // Madrid por defecto si no está
    
    // Fórmula de distancia euclidiana simple (suficiente para este prototipo)
    return Math.sqrt(Math.pow(destino.lat - origen.lat, 2) + Math.pow(destino.lon - origen.lon, 2));
}

function setActiveTab(tab) {
    activeTab = tab; // Actualizamos la variable global
    currentPage = 0; // Reset de paginación al cambiar de filtro

    // 1. Gestión visual de los botones (opcional, para feedback)
    document.querySelectorAll('.nav-item').forEach(el => el.classList.replace('text-indigo-600', 'text-gray-500'));
    const activeEl = document.getElementById(`nav-${tab}`);
    if (activeEl) activeEl.classList.replace('text-gray-500', 'text-indigo-600');

    // 2. Lógica de ordenación
    if (tab === 'valorados') {
        // RF 1.11: Ordenar por RATING_ESTRELLAS (Mayor a menor)
        filteredEvents = [...eventsData].sort((a, b) => b.RATING_ESTRELLAS - a.RATING_ESTRELLAS);
    } 
    else if (tab === 'cercanos') {
        // RF 1.10: Ordenar por distancia desde Alicante (Menor a mayor)
        filteredEvents = [...eventsData].sort((a, b) => {
            return calcularDistancia(a.UBICACION_CIUDAD) - calcularDistancia(b.UBICACION_CIUDAD);
        });
    }

    // 3. Renderizar con la nueva lista ordenada
    cargarTarjetas(filteredEvents);
}

/*************/
/** RF1.106 V14  */
/*MENU HAMBURGUESA*/
/*************/
function mostrarMenuHamburguesa() {
    const menu = document.getElementById('side-menu');
    const overlay = document.getElementById('menu-overlay');

    // Mostramos el overlay con fade-in
    overlay.classList.remove('hidden');
    setTimeout(() => overlay.classList.add('opacity-100'), 10);

    // Deslizamos el menú
    menu.classList.remove('-translate-x-full');
    
    // Bloqueamos el scroll del body para que no se mueva el fondo
    document.body.style.overflow = 'hidden';
}

function cerrarMenuHamburguesa() {
    const menu = document.getElementById('side-menu');
    const overlay = document.getElementById('menu-overlay');

    // Ocultamos el overlay
    overlay.classList.remove('opacity-100');
    setTimeout(() => overlay.classList.add('hidden'), 300);

    // Escondemos el menú
    menu.classList.add('-translate-x-full');
    
    // Restauramos el scroll
    document.body.style.overflow = 'auto';
}

// Función auxiliar para navegar y cerrar el menú al mismo tiempo
function navegarDesdeMenu(pantallaId) {
    cerrarMenuHamburguesa();
    
    // Usamos las funciones que ya tienes creadas
    if (pantallaId === 'pantalla1') mostrarPantalla1();
    else if (pantallaId === 'pantalla2') mostrarPantalla2();
    else if (pantallaId === 'pantalla3') mostrarPantalla('pantalla3');
    else if (pantallaId === 'pantalla4') mostrarPantalla4();
}

/*************/
/** RF2 PANTALLA DOS  */
/*SECUENCIAR LOS DATOS EN LA PÁGINA
/*************/
function mostrarPantalla2(idEvento) {
    // 1. Buscamos el objeto del evento dentro de nuestro array global
    const evento = eventsData.find(ev => ev.ID_EVENTO === idEvento);
    
    if (!evento) {
        console.error("Evento no encontrado");
        return;
    }

    // 2. Formateamos el precio
    const precioTexto = evento.PRECIO_MIN === 0 ? "Gratis" : `${evento.PRECIO_MIN.toFixed(2)} €`;

    // 3. Formateamos la fecha (Separamos fecha y hora)
    // Suponiendo formato: "2024-11-14 20:00"
    const [fecha, hora] = evento.FECHA_EVENTO.split(' ');

    // 4. Inyectamos los datos en el HTML
    document.getElementById('p2-imagen').src = evento.URL_IMAGEN;
    document.getElementById('p2-titulo').textContent = evento.TITULO;
    document.getElementById('p2-fecha').textContent = fecha;
    document.getElementById('p2-hora').textContent = `${hora} h`;
    document.getElementById('p2-ubicacion').textContent = evento.UBICACION_CIUDAD;
    document.getElementById('p2-descripcion').textContent = evento.DESCRIPCION;
    document.getElementById('p2-precio-caja').textContent = precioTexto;
    
    // Texto del botón del footer
    document.getElementById('p2-btn-reserva').textContent = `Reservar ahora (${precioTexto})`;

    // 5. Gestionar estado de Favorito (Icono relleno o vacío)
    // --- NUEVO: Asignamos la función de toggle al botón ---
    const btnFavo = document.getElementById('p2-btn-favorito');
    btnFavo.onclick = () => toggleFavorito(idEvento);

    // Renderizado inicial del icono según el estado actual
    if (evento.FAVORITO === 1) {
        btnFavo.innerHTML = '<i data-lucide="bookmark" class="h-6 w-6 text-red-500 fill-red-500"></i>';
    } else {
        btnFavo.innerHTML = '<i data-lucide="bookmark" class="h-6 w-6 text-gray-800"></i>';
    }

    mostrarPantalla('pantalla2');

    actualizarFooterDetalle(evento);

    // 7. Refrescamos Lucide para que los nuevos iconos se dibujen
    if (window.lucide) lucide.createIcons();
}

/*************/
/** RF2.06 PANTALLA DOS  */
/*Vamos a conmutar el botón de guardardo */
/*Lo llamaremos al pulsar en el icono*/
/*************/
function toggleFavorito(idEvento) {
    // 1. Buscamos el evento en el array original
    const evento = eventsData.find(ev => ev.ID_EVENTO === idEvento);
    
    if (!evento) return;

    // 2. Cambiamos el valor (Si es 1 pasa a 0, si es 0 pasa a 1)
    evento.FAVORITO = evento.FAVORITO === 1 ? 0 : 1;

    // 3. Actualizamos el icono en la Pantalla 2
    const btnFavo = document.getElementById('p2-btn-favorito');
    
    if (evento.FAVORITO === 1) {
        btnFavo.innerHTML = '<i data-lucide="bookmark" class="h-6 w-6 text-red-500 fill-red-500"></i>';
        console.log(`Evento ${idEvento} añadido a favoritos`);
    } else {
        btnFavo.innerHTML = '<i data-lucide="bookmark" class="h-6 w-6 text-gray-800"></i>';
        console.log(`Evento ${idEvento} eliminado de favoritos`);
    }

    // 4. Refrescamos Lucide para que renderice el nuevo icono
    if (window.lucide) lucide.createIcons();
    
    // 5. Opcional: Si queremos que al volver a la PAN1 se vea actualizado, 
    // podrías llamar a cargarTarjetas(), pero no es obligatorio hasta que el usuario vuelva.
}


/*************/
/** RF2.08 A 2.14 logica de la compra y tarjeta*/
/*Lo llamaremos al pulsar en el icono*/
/*************/
let currentPanelEventId = null;
let currentQuantity = 1;

// RF 2.10: Abrir Panel
function openPurchasePanel(idEvento) {
    const evento = eventsData.find(e => e.ID_EVENTO === idEvento);
    if (!evento) return;

    currentPanelEventId = idEvento;
    currentQuantity = 1; // Por defecto siempre 1 al abrir
    
    // Rellenar datos básicos (RF 2.11)
    document.getElementById('panel-event-name').innerText = evento.TITULO;
    updatePanelUI(evento.PRECIO_MIN);

    // Animación de apertura
    const overlay = document.getElementById('purchase-panel-overlay');
    const panel = document.getElementById('purchase-panel');
    
    overlay.classList.remove('hidden');
    setTimeout(() => {
        overlay.classList.replace('opacity-0', 'opacity-100');
        panel.classList.replace('translate-x-full', 'translate-x-0');
    }, 10);

    // Configurar botón final
    document.getElementById('btn-confirmar-compra').onclick = () => confirmPurchase(idEvento);
    
    if (window.lucide) lucide.createIcons();
}

// RF 2.10: Cerrar Panel
function closePurchasePanel() {
    const overlay = document.getElementById('purchase-panel-overlay');
    const panel = document.getElementById('purchase-panel');

    overlay.classList.replace('opacity-100', 'opacity-0');
    panel.classList.replace('translate-x-0', 'translate-x-full');

    setTimeout(() => {
        overlay.classList.add('hidden');
    }, 300);
}

// RF 2.12 & 2.13: Control de cantidad y Cálculos
function updatePanelQuantity(change) {
    const evento = eventsData.find(e => e.ID_EVENTO === currentPanelEventId);
    
    // Mínimo 1 entrada
    if (currentQuantity + change < 1) return;
    
    currentQuantity += change;
    updatePanelUI(evento.PRECIO_MIN);
}

function updatePanelUI(precioUnitario) {
    const subtotal = precioUnitario * currentQuantity;
    const taxes = subtotal * 0.10; // 10% gestión
    const total = subtotal + taxes;

    document.getElementById('panel-quantity').innerText = currentQuantity;
    document.getElementById('panel-subtotal').innerText = `${subtotal.toFixed(2)} €`;
    document.getElementById('panel-taxes').innerText = `${taxes.toFixed(2)} €`;
    document.getElementById('panel-total').innerText = `${total.toFixed(2)} €`;
}

// RF 2.14: Finalización de Reserva
function confirmPurchase(idEvento) {
    const evento = eventsData.find(e => e.ID_EVENTO === idEvento);
    
    // Sumamos la cantidad al valor actual de RESERVADO (RF 2.14.1)
    evento.RESERVADO += currentQuantity;

    // Feedback visual y cierre
    alert(`¡Reserva confirmada! Has adquirido ${currentQuantity} entradas para ${evento.TITULO}.`);
    
    closePurchasePanel();
    
    // Actualizamos la interfaz de la Pantalla 2 para reflejar el cambio (RF 2.14.2)
    actualizarFooterDetalle(evento);
}

// Actualizar el botón del footer de la Pantalla 2 (RF 2.07)
function actualizarFooterDetalle(evento) {
    const btnReserva = document.getElementById('p2-btn-reserva');
    const precioTexto = evento.PRECIO_MIN === 0 ? "Gratis" : `${evento.PRECIO_MIN.toFixed(2)} €`;

    if (evento.RESERVADO === 0) {
        btnReserva.innerHTML = `Reservar ahora (${precioTexto})`;
        btnReserva.classList.replace('bg-green-600', 'bg-indigo-600');
    } else {
        btnReserva.innerHTML = `Reservadas ${evento.RESERVADO} entradas. Añadir más`;
        btnReserva.classList.replace('bg-indigo-600', 'bg-green-600');
    }
    
    // Aseguramos que el botón abra el panel de compra
    btnReserva.onclick = () => openPurchasePanel(evento.ID_EVENTO);
}

/*************/
/** PANTALLA 4  */
/*************/


/******V12 RF4.06 a 4.13 EL 4.13 es simulado*******/
// RF4 Función principal para cambiar entre pestañas (Tabs)
function selectTab(tipo) {
    const tabComprados = document.getElementById('tab-comprados');
    const tabGuardados = document.getElementById('tab-guardados');
    const contentComprados = document.getElementById('content-comprados');
    const contentGuardados = document.getElementById('content-guardados');

    if (tipo === 'comprados') {
        // Estilos Tab
        tabComprados.classList.add('border-indigo-600', 'text-indigo-600');
        tabGuardados.classList.remove('border-indigo-600', 'text-indigo-600');
        tabGuardados.classList.add('border-transparent', 'text-gray-500');
        // Visibilidad contenido
        contentComprados.classList.remove('hidden');
        contentGuardados.classList.add('hidden');
    } else {
        // Estilos Tab
        tabGuardados.classList.add('border-indigo-600', 'text-indigo-600');
        tabComprados.classList.remove('border-indigo-600', 'text-indigo-600');
        tabComprados.classList.add('border-transparent', 'text-gray-500');
        // Visibilidad contenido
        contentGuardados.classList.remove('hidden');
        contentComprados.classList.add('hidden');
    }
}

// Función para abrir y cerrar el QR (RF 4.08)
function showQrModal(codigo = "#XP-3209R") {
    document.getElementById('qr-modal').classList.remove('hidden');
}
// Lógica del Modal QR
function showQrModal() {
    document.getElementById('qr-modal').classList.remove('hidden');
}
function closeQrModal() {
    document.getElementById('qr-modal').classList.add('hidden');
}


// --- NÚCLEO: CARGAR AGENDA (RF 4.05 a 4.13) ---
function cargarAgenda() {
    const listaComprados = document.getElementById('lista-comprados');
    const listaGuardados = document.getElementById('lista-guardados');
    
    // 1. Filtrar y Ordenar Comprados (RF 4.06 y 4.10)
    const comprados = eventsData
        .filter(ev => ev.RESERVADO > 0)
        .sort((a, b) => new Date(a.FECHA_EVENTO) - new Date(b.FECHA_EVENTO));

    // 2. Filtrar Guardados (RF 4.11)
    const guardados = eventsData.filter(ev => ev.FAVORITO === 1);

    // 3. Actualizar Recuento de Items (RF 4.05)
    document.getElementById('tab-comprados').innerText = `Comprados (${comprados.length})`;
    document.getElementById('tab-guardados').innerText = `Guardados (${guardados.length})`;

    // 4. Renderizar Comprados (RF 4.07)
    listaComprados.innerHTML = comprados.length === 0 
        ? '<div class="col-span-full py-20 text-center"><p class="text-gray-400">No tienes entradas aún.</p></div>' 
            : comprados.map(ev => `
            <div class="relative bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col md:flex-row overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 mb-6">
                
                <div class="absolute left-[-10px] top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-50 rounded-full border-r border-gray-200 hidden md:block"></div>
                <div class="absolute right-[-10px] top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-50 rounded-full border-l border-gray-200 hidden md:block"></div>

                <div class="flex-grow p-6">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex flex-col">
                            <span class="text-[10px] font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-tighter w-fit mb-2">
                                Ticket Confirmado • #${ev.ID_EVENTO}
                            </span>
                            <h3 class="text-2xl font-black text-slate-900 leading-tight">${ev.TITULO}</h3>
                        </div>
                        <button class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                            <i data-lucide="share-2" class="h-5 w-5"></i>
                        </button>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                        <div class="flex items-center text-slate-600">
                            <div class="p-2 bg-slate-50 rounded-lg mr-3">
                                <i data-lucide="calendar" class="h-4 w-4 text-indigo-500"></i>
                            </div>
                            <span class="text-sm font-bold">${ev.FECHA_EVENTO}</span>
                        </div>
                        <div class="flex items-center text-slate-600">
                            <div class="p-2 bg-slate-50 rounded-lg mr-3">
                                <i data-lucide="map-pin" class="h-4 w-4 text-indigo-500"></i>
                            </div>
                            <span class="text-sm font-bold truncate">${ev.UBICACION_CIUDAD}</span>
                        </div>
                    </div>
                    
                    <p class="mt-4 text-xs font-medium text-slate-400 italic">
                        * Presenta el código QR en el acceso al recinto.
                    </p>
                </div>

                <div class="hidden md:flex flex-col justify-between py-4">
                    <div class="w-[2px] h-full border-l-2 border-dashed border-slate-200 ml-[-1px]"></div>
                </div>

                <div class="bg-slate-900 p-6 flex flex-col items-center justify-center md:min-w-[220px] text-white">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">${ev.RESERVADO} ENTRADA(S)</span>
                    
                    <div class="flex items-end gap-[2px] h-10 mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
                        ${Array(20).fill(0).map((_, i) => `
                            <div class="bg-white w-[${i % 3 === 0 ? '3px' : '1px'}] h-${(i % 2 === 0 ? 'full' : '3/4')}"></div>
                        `).join('')}
                    </div>

                    <button onclick="showQrModal()" class="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black py-3 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 transform active:scale-95">
                        <i data-lucide="qr-code" class="h-5 w-5"></i>
                        <span>ACCEDER</span>
                    </button>
                </div>
            </div>
        `).join('');

    // 5. Renderizar Guardados (RF 4.12)
    listaGuardados.innerHTML = guardados.length === 0 
        ? '<p class="text-gray-400 text-center py-10 col-span-full">Tu lista está vacía.</p>' 
        : guardados.map(ev => `
            <div class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 flex flex-col">
                <div class="relative h-28">
                    <img src="${ev.URL_IMAGEN}" class="w-full h-full object-cover">
                    <span class="absolute top-2 left-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">${ev.CATEGORIA}</span>
                </div>
                <div class="p-4 flex-grow flex flex-col justify-between">
                    <div>
                        <h3 class="font-bold text-gray-900 mb-1 truncate">${ev.TITULO}</h3>
                        <p class="text-xs text-gray-500 flex items-center mb-2">
                            <i data-lucide="map-pin" class="h-3 w-3 mr-1"></i>${ev.UBICACION_CIUDAD}
                        </p>
                    </div>
                    <div class="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                        <button onclick="mostrarPantalla2(${ev.ID_EVENTO})" class="text-indigo-600 hover:text-indigo-800 font-bold text-xs">
                            Ver Detalles
                        </button>
                        <button onclick="toggleFavoritoAgenda(${ev.ID_EVENTO})" class="text-red-400 hover:text-red-600 transition">
                            <i data-lucide="trash-2" class="h-4 w-4"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

    // Reiniciar iconos de Lucide
    if (window.lucide) lucide.createIcons();
}

// Función especial para eliminar de favoritos desde la agenda y refrescarla
function toggleFavoritoAgenda(id) {
    const evento = eventsData.find(e => e.ID_EVENTO === id);
    if(evento) {
        evento.FAVORITO = 0;
        cargarAgenda(); // Refresca la vista inmediatamente
    }
}

/**************************/
/** PANTALLA 3 - FILTROS  */
/*************************/
/****RF 3.05 a 3.09 FILTRADO Y APLICAR A PANTALLA 1****/
function aplicarFiltros() {
    // 1. Recoger valores de los inputs de la Pantalla 3
    const categoriasSeleccionadas = Array.from(document.querySelectorAll('input[name="f-categoria"]:checked'))
                                         .map(cb => cb.value);
    
    const precioMaximo = parseFloat(document.getElementById('f-precio-range').value);
    const distanciaMaxima = parseFloat(document.getElementById('f-distancia').value);
    const fechaFiltro = document.getElementById('f-fecha').value;

    // --- CÁLCULO DINÁMICO DE HOY ---
    const ahora = new Date(); 
    // Normalizamos 'hoy' a las 00:00:00 para comparar solo fechas
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

    // 2. Filtrar el array maestro eventsData
    const eventosFiltrados = eventsData.filter(evento => {
        
        // Filtro Categoría: Si no hay nada marcado, pasan todos. Si hay, debe coincidir.
        const cumpleCategoria = categoriasSeleccionadas.length === 0 || 
                                categoriasSeleccionadas.includes(evento.CATEGORIA);

        // Filtro Precio: El precio mínimo del evento debe ser menor o igual al elegido
        const cumplePrecio = evento.PRECIO_MIN <= precioMaximo;

        // Filtro Distancia: Comprobamos contra la columna DISTANCIA_KM (asegúrate que existe en tus datos)
        const cumpleDistancia = (evento.DISTANCIA_KM || 0) <= distanciaMaxima;

        // Filtro Fecha (Simulación simple por ahora)
        let cumpleFecha = true;

        if (fechaFiltro !== 'todas') {
            // Convertimos la fecha del evento a objeto Date
            const fechaEventoObj = new Date(evento.FECHA_EVENTO.replace(" ", "T"));
            // Normalizamos la fecha del evento para comparar solo el día
            const fechaEventoSoloDia = new Date(fechaEventoObj.getFullYear(), fechaEventoObj.getMonth(), fechaEventoObj.getDate());

            if (fechaFiltro === 'hoy') {
                cumpleFecha = fechaEventoSoloDia.getTime() === hoy.getTime();
            } 
            else if (fechaFiltro === 'semana') {
                const limiteSemana = new Date(hoy);
                limiteSemana.setDate(hoy.getDate() + 7);
                // Incluye desde hoy hasta dentro de 7 días
                cumpleFecha = fechaEventoSoloDia >= hoy && fechaEventoSoloDia <= limiteSemana;
            } 
            else if (fechaFiltro === 'finsemana') {
                // Calculamos el sábado y domingo de la semana actual
                const diaSemanaActual = hoy.getDay(); // 0: Dom, 1: Lun, ..., 6: Sab
                
                const diasHastaSabado = (6 - diaSemanaActual + 7) % 7;
                const sabado = new Date(hoy);
                sabado.setDate(hoy.getDate() + diasHastaSabado);
                
                const domingo = new Date(sabado);
                domingo.setDate(sabado.getDate() + 1);

                cumpleFecha = fechaEventoSoloDia.getTime() === sabado.getTime() || 
                              fechaEventoSoloDia.getTime() === domingo.getTime();
            } 
            else if (fechaFiltro === 'mes') {
                // Comprobamos que el mes y el año coincidan con los actuales
                cumpleFecha = fechaEventoObj.getMonth() === hoy.getMonth() && 
                              fechaEventoObj.getFullYear() === hoy.getFullYear();
            }
        }

        return cumpleCategoria && cumplePrecio && cumpleDistancia && cumpleFecha;
    });

    // 3. Ejecutar el cambio visual
    // Llamamos a tu función de carga con los nuevos datos
    cargarTarjetas(eventosFiltrados);

    // 4. Volver a la pantalla principal
    mostrarPantalla('pantalla1');
    
    // Feedback opcional en consola
    console.log(`Filtros aplicados. Mostrando ${eventosFiltrados.length} eventos.`);
}
/****RF 3.04 LIMPIAR FILTROS****/
function limpiarFiltros() {
    // Resetear checkboxes
    document.querySelectorAll('input[name="f-categoria"]').forEach(cb => cb.checked = false);
    
    // Resetear Selects e Inputs
    document.getElementById('f-distancia').value = "9999";
    document.getElementById('f-precio-range').value = "50";
    document.getElementById('f-precio-valor').innerText = "50 €";
    document.getElementById('f-fecha').value = "todas";

    // Mostramos todos los eventos de nuevo
    cargarTarjetas(eventsData);
    mostrarPantalla('pantalla1');
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


