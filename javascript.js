import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, setPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, query, where, getDocs, writeBatch, setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// -----------------------------------------------------------------------------
// VARIABLES GLOBALES (Configuración del entorno Canvas)
// -----------------------------------------------------------------------------
// El ID de la aplicación para aislar los datos en Firestore
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-ocioplus-app-id';
// Configuración de Firebase
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
// Token de autenticación inicial
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

let app, db, auth;
let currentUserId = 'N/A';
let isAuthenticated = false;
let currentView = 'all'; // 'all' o 'agenda'
let allEventsCache = [];
let userAgendaCache = {}; // { eventId: true/false }

// -----------------------------------------------------------------------------
// DATOS DE EJEMPLO PARA INICIALIZAR LA BBDD
// -----------------------------------------------------------------------------
const MOCK_EVENTS = [
    {
        name: "Concierto Rock 'La Última Ronda'",
        date: "2025-05-18",
        time: "21:00",
        city: "Madrid",
        description: "Un tributo épico a las leyendas del rock español de los 80 y 90.",
        image: "https://placehold.co/400x200/4f46e5/ffffff?text=CONCIERTO+ROCK",
        price: 25.00
    },
    {
        name: "Festival de Tapas y Cerveza Artesana",
        date: "2025-06-01",
        time: "12:00",
        city: "Alicante",
        description: "Prueba las mejores tapas gourmet maridadas con cervezas locales.",
        image: "https://placehold.co/400x200/10b981/ffffff?text=FESTIVAL+TAPAS",
        price: 10.00
    },
    {
        name: "Taller de Robótica para Niños",
        date: "2025-05-25",
        time: "17:30",
        city: "Ibi",
        description: "Aprende a construir y programar tu propio robot en un ambiente divertido.",
        image: "https://placehold.co/400x200/f59e0b/ffffff?text=ROBOTICA",
        price: 45.00
    },
    {
        name: "Exposición de Arte Moderno 'Contrastes'",
        date: "2025-07-10",
        time: "10:00",
        city: "Elche",
        description: "Una colección que explora la dualidad de la vida contemporánea a través del color.",
        image: "https://placehold.co/400x200/ef4444/ffffff?text=ARTE+MODERNO",
        price: 8.50
    },
    {
        name: "Clase Abierta de Yoga al Amanecer",
        date: "2025-05-19",
        time: "07:00",
        city: "Madrid",
        description: "Comienza el día con energía y paz en este retiro urbano de yoga.",
        image: "https://placehold.co/400x200/6366f1/ffffff?text=YOGA+MADRID",
        price: 15.00
    }
];

// -----------------------------------------------------------------------------
// REFERENCIAS Y UTILIDADES DEL DOM
// -----------------------------------------------------------------------------
const dom = {
    authStatusBtn: document.getElementById('auth-status-btn'),
    userIdDisplay: document.getElementById('user-id-display'),
    firestoreStatus: document.getElementById('firestore-status'),
    eventsGrid: document.getElementById('events-grid'),
    loadingMessage: document.getElementById('loading-message'),
    seedDataBtn: document.getElementById('seed-data-btn'),
    viewAllBtn: document.getElementById('view-all-btn'),
    viewAgendaBtn: document.getElementById('view-agenda-btn'),
    cityFilter: document.getElementById('city-filter'),
    darkModeToggle: document.getElementById('dark-mode-toggle'),
    screenWidthDisplay: document.getElementById('screen-width-display'),
    modalContainer: document.getElementById('modal-container'),
    modalTitle: document.getElementById('modal-title'),
    modalBody: document.getElementById('modal-body'),
    modalCloseBtn: document.getElementById('modal-close-btn')
};

/**
 * Muestra un modal de mensaje al usuario (sustituto de alert()).
 * @param {string} title Título del mensaje.
 * @param {string} body Contenido del mensaje.
 * @param {boolean} isError Si es true, el modal se muestra con un estilo de error.
 */
function showModal(title, body, isError = false) {
    dom.modalTitle.textContent = title;
    dom.modalBody.textContent = body;
    
    // Aplicar estilos de error si es necesario
    if (isError) {
        dom.modalTitle.classList.remove('text-indigo-600');
        dom.modalTitle.classList.add('text-red-600');
        dom.modalCloseBtn.classList.remove('bg-indigo-600', 'hover:bg-indigo-700');
        dom.modalCloseBtn.classList.add('bg-red-600', 'hover:bg-red-700');
    } else {
        dom.modalTitle.classList.remove('text-red-600');
        dom.modalTitle.classList.add('text-indigo-600');
        dom.modalCloseBtn.classList.remove('bg-red-600', 'hover:bg-red-700');
        dom.modalCloseBtn.classList.add('bg-indigo-600', 'hover:bg-indigo-700');
    }

    dom.modalContainer.classList.remove('hidden');
    dom.modalContainer.classList.add('flex');
}

// Oculta el modal al hacer clic en el botón de cerrar
dom.modalCloseBtn.addEventListener('click', () => {
    dom.modalContainer.classList.remove('flex');
    dom.modalContainer.classList.add('hidden');
});

// -----------------------------------------------------------------------------
// FUNCIONES DE FIREBASE Y AUTHENTICATION
// -----------------------------------------------------------------------------

/**
 * Inicializa Firebase y configura la autenticación del usuario.
 */
async function initializeFirebase() {
    try {
        // Establecer el nivel de log a Debug (útil para el desarrollo en canvas)
        setLogLevel('Debug');

        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        
        // Usar persistencia de sesión para mantener el estado de autenticación
        await setPersistence(auth, browserSessionPersistence);

        // Actualizar el estado de la conexión a Firestore en la UI
        dom.firestoreStatus.innerHTML = '<i class="fas fa-database mr-1"></i> Estado: Conectado';

        // Intentar iniciar sesión con el token personalizado o anónimamente
        await authenticateUser();

        // Configurar el listener de autenticación
        onAuthStateChanged(auth, (user) => {
            if (user) {
                currentUserId = user.uid;
                isAuthenticated = true;
                updateAuthUI();
                
                // Una vez autenticado, comenzamos a escuchar los datos
                startFirestoreListeners();

            } else {
                currentUserId = 'N/A';
                isAuthenticated = false;
                updateAuthUI();
                // Limpiar la interfaz si no hay usuario
                dom.eventsGrid.innerHTML = '';
                dom.loadingMessage.textContent = 'Inicia sesión para ver tu agenda.';
                dom.loadingMessage.classList.remove('hidden');
            }
            dom.loadingMessage.classList.add('hidden');
        });

    } catch (error) {
        console.error("Error al inicializar Firebase:", error);
        dom.firestoreStatus.innerHTML = '<i class="fas fa-exclamation-triangle mr-1"></i> Error de Conexión';
        showModal("Error de Inicialización", "No se pudo conectar a Firebase. Revisa la consola para más detalles.", true);
    }
}

/**
 * Maneja el proceso de autenticación.
 */
async function authenticateUser() {
    try {
        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
            console.log("Autenticación exitosa con token personalizado.");
        } else {
            // Si no hay token personalizado, usa el inicio de sesión anónimo
            await signInAnonymously(auth);
            console.log("Autenticación exitosa anónima.");
        }
    } catch (error) {
        console.error("Error en la autenticación:", error);
        showModal("Error de Autenticación", `No se pudo iniciar sesión: ${error.message}`, true);
    }
}

/**
 * Actualiza la información de autenticación en la interfaz de usuario.
 */
function updateAuthUI() {
    dom.userIdDisplay.textContent = currentUserId;
    if (isAuthenticated) {
        dom.authStatusBtn.textContent = 'Sesión Activa';
        dom.authStatusBtn.classList.remove('bg-indigo-600', 'hover:bg-indigo-700');
        dom.authStatusBtn.classList.add('bg-emerald-600', 'hover:bg-emerald-700');
    } else {
        dom.authStatusBtn.textContent = 'Sin Sesión';
        dom.authStatusBtn.classList.remove('bg-emerald-600', 'hover:bg-emerald-700');
        dom.authStatusBtn.classList.add('bg-indigo-600', 'hover:bg-indigo-700');
    }
}

// -----------------------------------------------------------------------------
// FIREBASE FIRESTORE LISTENERS
// -----------------------------------------------------------------------------

/**
 * Inicia los listeners de Firestore para Eventos Públicos y la Agenda Privada del Usuario.
 */
function startFirestoreListeners() {
    if (!isAuthenticated) return;

    // 1. Listener para todos los eventos públicos
    const eventsCollectionRef = collection(db, `artifacts/${appId}/public/data/events`);
    onSnapshot(eventsCollectionRef, (snapshot) => {
        allEventsCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Si no hay eventos, mostrar el botón de seed data
        if (allEventsCache.length === 0) {
            dom.seedDataBtn.classList.remove('hidden');
            dom.loadingMessage.textContent = 'No hay eventos disponibles. Por favor, inicializa los datos.';
        } else {
            dom.seedDataBtn.classList.add('hidden');
            dom.loadingMessage.classList.add('hidden');
        }

        renderEvents();
    }, (error) => {
        console.error("Error al escuchar eventos públicos:", error);
        showModal("Error de Datos", "No se pudieron cargar los eventos públicos. Revisa los permisos.", true);
    });

    // 2. Listener para la agenda privada del usuario
    // La agenda se almacena en una colección privada bajo el ID del usuario:
    // /artifacts/{appId}/users/{userId}/agenda
    const agendaCollectionRef = collection(db, `artifacts/${appId}/users/${currentUserId}/agenda`);
    onSnapshot(agendaCollectionRef, (snapshot) => {
        userAgendaCache = {};
        snapshot.docs.forEach(doc => {
            // Solo necesitamos el ID del documento (que es el ID del evento)
            userAgendaCache[doc.id] = true; 
        });

        console.log("Agenda actualizada:", Object.keys(userAgendaCache).length, "eventos.");
        renderEvents(); // Re-renderizar para actualizar el estado de los botones
    }, (error) => {
        console.error("Error al escuchar la agenda del usuario:", error);
        // Si el usuario no tiene permisos para su propia agenda, esto fallará.
        showModal("Error de Agenda", "No se pudo cargar tu agenda privada. Revisa los permisos de Firestore.", true);
    });
}

// -----------------------------------------------------------------------------
// GESTIÓN DE LA AGENDA (Añadir/Eliminar Eventos)
// -----------------------------------------------------------------------------

/**
 * Añade o elimina un evento de la agenda privada del usuario.
 * @param {string} eventId ID del evento a modificar.
 * @param {boolean} isAdding True para añadir, false para eliminar.
 */
async function toggleAgenda(eventId, isAdding) {
    if (!isAuthenticated) {
        showModal("Acceso Denegado", "Debes estar autenticado para añadir eventos a tu agenda.", false);
        return;
    }

    const agendaDocRef = doc(db, `artifacts/${appId}/users/${currentUserId}/agenda`, eventId);

    try {
        if (isAdding) {
            // Añadir el evento a la agenda. Usamos setDoc con el ID del evento para que sea fácil
            // de buscar y eliminar. El contenido del documento puede estar vacío o replicar los datos esenciales.
            await setDoc(agendaDocRef, { addedAt: new Date(), eventId: eventId });
            showModal("¡Agregado!", "El evento se ha añadido a tu agenda de OcioPlus.", false);
        } else {
            // Eliminar el evento de la agenda
            await deleteDoc(agendaDocRef);
            showModal("Eliminado", "El evento se ha eliminado de tu agenda.", false);
            
            // Si estábamos en la vista 'agenda', forzar un re-render
            if (currentView === 'agenda') {
                 renderEvents();
            }
        }
    } catch (error) {
        console.error("Error al modificar la agenda:", error);
        showModal("Error", `No se pudo ${isAdding ? 'añadir' : 'eliminar'} el evento de la agenda: ${error.message}`, true);
    }
}

// -----------------------------------------------------------------------------
// RENDERIZADO Y FILTRADO DE EVENTOS
// -----------------------------------------------------------------------------

/**
 * Renderiza todos los eventos en la cuadrícula, aplicando filtros y la vista actual.
 */
function renderEvents() {
    dom.eventsGrid.innerHTML = '';
    dom.loadingMessage.classList.add('hidden');

    const selectedCity = dom.cityFilter.value;
    
    // Filtrar por la vista actual ('all' o 'agenda')
    let filteredEvents = allEventsCache.filter(event => {
        const isAgendaMatch = currentView === 'all' || userAgendaCache[event.id];
        const isCityMatch = !selectedCity || event.city === selectedCity;
        return isAgendaMatch && isCityMatch;
    });

    if (filteredEvents.length === 0) {
        let message = 'No se encontraron eventos.';
        if (currentView === 'agenda') {
            message = 'Aún no tienes eventos en tu agenda.';
        } else if (selectedCity) {
            message = `No hay eventos en ${selectedCity}.`;
        }
        dom.eventsGrid.innerHTML = `<div class="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            <i class="fas fa-search-minus text-5xl mb-3"></i>
            <p class="text-xl font-semibold">${message}</p>
        </div>`;
        return;
    }

    // Generar el HTML de las tarjetas
    filteredEvents.forEach(event => {
        const isAdded = !!userAgendaCache[event.id];
        dom.eventsGrid.appendChild(createEventCard(event, isAdded));
    });
}

/**
 * Crea el elemento HTML de una tarjeta de evento.
 * @param {object} event Objeto del evento.
 * @param {boolean} isAdded Si el evento está en la agenda del usuario.
 * @returns {HTMLElement} El elemento div de la tarjeta.
 */
function createEventCard(event, isAdded) {
    const card = document.createElement('div');
    card.className = 'card-container transition duration-300';
    card.dataset.id = event.id;

    const formattedDate = new Date(event.date).toLocaleDateString('es-ES', { 
        year: 'numeric', month: 'short', day: 'numeric' 
    });
    
    // Determinar estilo y texto del botón
    const btnIcon = isAdded ? 'fas fa-check' : 'fas fa-calendar-plus';
    const btnText = isAdded ? 'En Agenda' : 'Añadir a Agenda';
    const btnClass = isAdded ? 'btn-agenda-added' : 'bg-indigo-600 hover:bg-indigo-700';

    card.innerHTML = `
        <!-- Imagen del Evento -->
        <img src="${event.image}" onerror="this.onerror=null; this.src='https://placehold.co/400x200/cccccc/333333?text=NO+IMAGE';" class="card-image" alt="Imagen de ${event.name}">
        
        <div class="p-4 flex flex-col justify-between flex-grow">
            <!-- Título y Descripción -->
            <div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">${event.name}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">${event.description}</p>
            </div>

            <!-- Detalles -->
            <div class="mt-4 space-y-2 text-sm">
                <p class="flex items-center text-indigo-600 dark:text-indigo-400 font-semibold">
                    <i class="fas fa-calendar-alt w-5 mr-2"></i> ${formattedDate} (${event.time})
                </p>
                <p class="flex items-center text-gray-600 dark:text-gray-300">
                    <i class="fas fa-map-marker-alt w-5 mr-2"></i> ${event.city}
                </p>
                <p class="flex items-center text-emerald-600 dark:text-emerald-400 font-bold">
                    <i class="fas fa-ticket-alt w-5 mr-2"></i> ${event.price === 0 ? 'Gratis' : `${event.price.toFixed(2)} €`}
                </p>
            </div>

            <!-- Botón de Acción -->
            <button data-event-id="${event.id}" data-is-added="${isAdded}" 
                    class="mt-4 w-full px-4 py-2 text-white font-semibold rounded-lg shadow-md transition duration-150 ease-in-out ${btnClass}">
                <i class="${btnIcon} mr-2"></i> ${btnText}
            </button>
        </div>
    `;

    // Añadir el listener al botón de acción
    const actionButton = card.querySelector('button');
    actionButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Evitar que el click se propague a la tarjeta si tuviera otro listener
        const eventId = actionButton.dataset.eventId;
        const currentlyAdded = actionButton.dataset.isAdded === 'true';
        toggleAgenda(eventId, !currentlyAdded); // Invertir el estado
    });

    return card;
}

// -----------------------------------------------------------------------------
// INICIALIZACIÓN DE DATOS DE EJEMPLO
// -----------------------------------------------------------------------------

/**
 * Inserta datos de ejemplo en la colección pública de eventos.
 */
async function seedInitialData() {
    if (!isAuthenticated) {
        showModal("Error", "Debes estar autenticado para inicializar la base de datos.", true);
        return;
    }

    dom.seedDataBtn.disabled = true;
    dom.seedDataBtn.textContent = 'Insertando datos...';
    
    const batch = writeBatch(db);
    const eventsCollectionRef = collection(db, `artifacts/${appId}/public/data/events`);

    try {
        MOCK_EVENTS.forEach(event => {
            const newDocRef = doc(eventsCollectionRef); // Firestore genera un ID automáticamente
            batch.set(newDocRef, event);
        });

        await batch.commit();
        showModal("Éxito", "¡Datos de ejemplo inicializados correctamente en Firestore!", false);
        dom.seedDataBtn.classList.add('hidden'); // Ocultar después de la inserción
    } catch (error) {
        console.error("Error al inicializar datos:", error);
        showModal("Error", `Falló la inserción de datos: ${error.message}`, true);
    } finally {
        dom.seedDataBtn.disabled = false;
        dom.seedDataBtn.textContent = 'Inicializar Datos de Ejemplo (Solo la primera vez)';
    }
}

// -----------------------------------------------------------------------------
// MANEJO DE EVENTOS DEL DOM
// -----------------------------------------------------------------------------

/**
 * Cambia la vista de eventos entre 'all' y 'agenda'.
 * @param {string} view 'all' o 'agenda'.
 */
function changeView(view) {
    if (currentView === view) return;
    currentView = view;
    
    // Actualizar estilos de los botones
    dom.viewAllBtn.classList.remove('agenda-active');
    dom.viewAgendaBtn.classList.remove('agenda-active');

    if (view === 'all') {
        dom.viewAllBtn.classList.add('agenda-active');
    } else {
        dom.viewAgendaBtn.classList.add('agenda-active');
    }

    renderEvents();
}

/**
 * Alterna el modo oscuro.
 */
function toggleDarkMode() {
    document.body.classList.toggle('dark:bg-gray-900');
    document.body.classList.toggle('dark:text-gray-100');
    document.documentElement.classList.toggle('dark');
    
    const isDark = document.documentElement.classList.contains('dark');
    const icon = dom.darkModeToggle.querySelector('i');
    
    if (isDark) {
        icon.classList.remove('fa-sun', 'text-gray-800');
        icon.classList.add('fa-moon', 'text-gray-200');
    } else {
        icon.classList.remove('fa-moon', 'text-gray-200');
        icon.classList.add('fa-sun', 'text-gray-800');
    }
}

// Escuchadores de eventos
dom.seedDataBtn.addEventListener('click', seedInitialData);
dom.viewAllBtn.addEventListener('click', () => changeView('all'));
dom.viewAgendaBtn.addEventListener('click', () => changeView('agenda'));
dom.cityFilter.addEventListener('change', renderEvents);
dom.darkModeToggle.addEventListener('click', toggleDarkMode);

// Función para mostrar el ancho de la pantalla (Ayuda con el responsive)
function updateScreenWidth() {
    dom.screenWidthDisplay.textContent = `Ancho: ${window.innerWidth}px`;
}
window.addEventListener('resize', updateScreenWidth);

// -----------------------------------------------------------------------------
// INICIO DE LA APLICACIÓN
// -----------------------------------------------------------------------------
window.onload = () => {
    updateScreenWidth();
    initializeFirebase();
};
