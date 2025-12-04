import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
    getAuth, 
    signInAnonymously, 
    signInWithCustomToken, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    doc, 
    onSnapshot, 
    query, 
    where, 
    writeBatch
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- 1. CONFIGURACIÓN E INICIALIZACIÓN DE FIREBASE ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

let app;
let db;
let auth;
let userId = null;
let isAuthReady = false;

// Elementos del DOM
const eventsGrid = document.getElementById('events-grid');
const loadingMessage = document.getElementById('loading-message');
const authStatusBtn = document.getElementById('auth-status-btn');
const userIdDisplay = document.getElementById('user-id-display');
const firestoreStatusDisplay = document.getElementById('firestore-status');
const seedDataBtn = document.getElementById('seed-data-btn');
const cityFilter = document.getElementById('city-filter');

/**
 * Renderiza la estrella de rating basada en la puntuación.
 * @param {number} rating - Puntuación de 0 a 5.
 * @returns {string} HTML del icono.
 */
function renderRatingIcon(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    let starsHtml = '';

    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="fas fa-star mr-0.5"></i>';
    }
    if (halfStar) {
        starsHtml += '<i class="fas fa-star-half-alt mr-0.5"></i>';
    }
    // Rellena con estrellas vacías hasta 5 para consistencia visual
    for (let i = 0; i < 5 - Math.ceil(rating); i++) {
        starsHtml += '<i class="far fa-star mr-0.5"></i>';
    }

    return starsHtml;
}

/**
 * Genera el HTML de una tarjeta de evento.
 * @param {Object} event - Objeto del evento de Firestore.
 * @returns {string} HTML de la tarjeta.
 */
function createEventCard(event) {
    // Aseguramos que la fecha sea un objeto Date para formatear
    let date;
    try {
        // Intenta parsear la fecha de tu formato YYYY-MM-DD
        date = new Date(event.date);
    } catch (e) {
        // Fallback si la fecha no es válida
        date = new Date();
    }
    
    const formattedDate = date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });

    // Usa una imagen de placeholder si la URL es null o no válida
    const safeImageUrl = event.imageUrl && event.imageUrl.startsWith('http') 
        ? event.imageUrl 
        : `https://placehold.co/600x400/4c51bf/ffffff?text=${encodeURIComponent(event.title)}`;

    const priceText = event.minPrice > 0 ? `${event.minPrice}€` : 'Gratis';
    const ratingHtml = renderRatingIcon(event.rating);

    return `
        <div class="card-container" data-id="${event.id}">
            <!-- Usamos onerror para manejar las imágenes de Google Drive que a veces fallan al cargar directamente -->
            <img src="${safeImageUrl}" alt="Imagen del evento: ${event.title}" class="card-image" onerror="this.onerror=null; this.src='https://placehold.co/600x400/4c51bf/ffffff?text=Imagen+No+Disponible'">
            <div class="card-content p-4">
                <!-- Título y Categoría -->
                <h4 class="text-lg font-bold mb-1">${event.title}</h4>
                <p class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2">${event.category}</p>
                <!-- Descripción -->
                <p class="text-gray-500 dark:text-gray-400 text-sm mb-3 line-clamp-2" title="${event.description}">
                    ${event.description}
                </p>
                <!-- Valoración | Precio | Ciudad -->
                <div class="flex justify-between items-center text-xs pt-2 border-t border-gray-100 dark:border-gray-700">
                    <!-- Rating -->
                    <span class="flex items-center text-green-600 dark:text-green-400 font-bold" title="${event.reviews} reseñas">
                        ${ratingHtml} ${event.rating.toFixed(1)}
                    </span>
                    <!-- Precio -->
                    <span class="font-bold text-indigo-600 dark:text-indigo-400">
                        ${priceText}
                    </span>
                    <!-- Ciudad -->
                    <span class="text-gray-500 dark:text-gray-400">
                        <i class="fas fa-city mr-1"></i> ${event.city}
                    </span>
                </div>
                <!-- Fecha -->
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <i class="fas fa-calendar-alt mr-1"></i> ${formattedDate}
                </p>
            </div>
        </div>
    `;
}

/**
 * Renderiza la lista de eventos en el grid.
 * @param {Array<Object>} events - Array de documentos de eventos.
 */
function renderEvents(events) {
    if (loadingMessage) loadingMessage.style.display = 'none';

    if (events.length === 0) {
        eventsGrid.innerHTML = `
            <p class="col-span-full text-center text-gray-500 dark:text-gray-400 p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <i class="fas fa-box-open mr-2"></i> No se encontraron eventos en esta ciudad.
            </p>`;
        
        // Muestra el botón de inicializar si no hay datos *y* no se está filtrando
        if (seedDataBtn && cityFilter.value === "") seedDataBtn.style.display = 'block';
        else if (seedDataBtn) seedDataBtn.style.display = 'none';

        return;
    }

    // Oculta el botón de inicializar si hay datos
    if (seedDataBtn) seedDataBtn.style.display = 'none';

    // Ordenar los eventos por fecha (más cercanos primero) antes de renderizar (en memoria)
    const sortedEvents = events.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    eventsGrid.innerHTML = sortedEvents.map(createEventCard).join('');
}


// --- 2. LÓGICA DE FIREBASE Y DATA FETCHING ---

/**
 * Inicializa Firebase y configura la autenticación.
 */
async function initializeFirebaseAndAuth() {
    try {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);

        // Intenta iniciar sesión con el token personalizado o de forma anónima
        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
        } else {
            await signInAnonymously(auth);
        }

        // Listener de estado de autenticación
        onAuthStateChanged(auth, (user) => {
            if (user) {
                userId = user.uid;
                isAuthReady = true;
                if (authStatusBtn) {
                    authStatusBtn.innerHTML = `<i class="fas fa-user-check mr-2"></i> Sesión Activa`;
                    authStatusBtn.classList.remove('bg-indigo-600', 'hover:bg-indigo-700');
                    authStatusBtn.classList.add('bg-green-600', 'hover:bg-green-700');
                }
                if (userIdDisplay) userIdDisplay.textContent = userId;
                
                // Una vez autenticado, comenzamos a escuchar los datos
                setupFirestoreListener();
            } else {
                userId = 'ANONYMOUS';
                isAuthReady = true;
                if (authStatusBtn) {
                    authStatusBtn.innerHTML = `<i class="fas fa-sign-in-alt mr-2"></i> Iniciar Sesión`;
                    authStatusBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
                    authStatusBtn.classList.add('bg-indigo-600', 'hover:bg-indigo-700');
                }
                if (userIdDisplay) userIdDisplay.textContent = 'Anonimo';
                
                // Si la autenticación falla, mostramos mensaje
                if (loadingMessage) loadingMessage.textContent = 'Error de autenticación. Intentando recargar datos...';
            }
        });

    } catch (error) {
        console.error("Error al inicializar Firebase o autenticar:", error);
        if (loadingMessage) loadingMessage.textContent = `Error crítico al cargar: ${error.message}`;
    }
}

/**
 * Configura el listener de Firestore para la colección de eventos.
 */
function setupFirestoreListener() {
    if (!db || !isAuthReady) return;

    // Ruta de la colección: /artifacts/{appId}/public/data/events
    const eventsCollectionPath = `artifacts/${appId}/public/data/events`;
    const eventsColRef = collection(db, eventsCollectionPath);

    // Configuración de la consulta: sin orderBy para evitar errores de índice
    let eventsQuery = eventsColRef;
    
    // Si se selecciona un filtro de ciudad, añadimos la condición
    const selectedCity = cityFilter.value;
    if (selectedCity && selectedCity !== "") {
        eventsQuery = query(eventsQuery, where("city", "==", selectedCity));
        if (firestoreStatusDisplay) firestoreStatusDisplay.textContent = `Filtrando por ${selectedCity}`;
    } else {
        if (firestoreStatusDisplay) firestoreStatusDisplay.textContent = `Cargando todos los eventos`;
    }

    // Inicia la escucha en tiempo real (onSnapshot)
    onSnapshot(eventsQuery, (snapshot) => {
        const events = [];
        snapshot.forEach((doc) => {
            // Mapeo de datos: todos tus campos de la hoja de cálculo
            const data = doc.data();
            events.push({ 
                id: doc.id,
                title: data.title,
                category: data.category,
                rating: data.rating,
                reviews: data.reviews,
                city: data.city,
                minPrice: data.minPrice,
                date: data.date,
                imageUrl: data.imageUrl,
                description: data.description
                // No usamos 'visto', 'contacto' o 'enlace_de_reserva' en la tarjeta, pero están disponibles en el objeto 'data' si se necesitan.
            });
        });
        
        renderEvents(events);
    }, (error) => {
        console.error("Error al escuchar los eventos de Firestore:", error);
        if (loadingMessage) loadingMessage.textContent = `Error al cargar eventos: ${error.message}`;
    });
}


// --- 3. LÓGICA DE INICIALIZACIÓN DE DATOS (SEED) ---

// Los datos de tu Google Sheet mapeados a formato de documento de Firestore
const initialEventsData = [
    {
        id: 101, title: "El Rey León, El Musical", category: "Musicales", rating: 5.0, reviews: 542, city: "Madrid", minPrice: 35, date: "2024-11-14",
        imageUrl: "https://drive.google.com/thumbnail?id=1wL1MID8BLWZL0PvzkLqNh61jb4i4S1ey&sz=w500",
        description: "Una experiencia teatral inolvidable que transporta al espectador a la sabana africana. Con impresionantes vestuarios y música icónica.",
        isFeatured: true, contactEmail: "reyleon@gmail.com", bookingUrl: "https://www.google.com"
    },
    {
        id: 102, title: "Monólogo de Raúl Anton", category: "Monólogos", rating: 3.0, reviews: 187, city: "Ibi", minPrice: 28, date: "2024-02-25",
        imageUrl: "https://drive.google.com/thumbnail?id=1w43qfC5BSEQvxPLpwZ24nXDBmX_sd0BW&sz=w500",
        description: "Noche de risas garantizadas con el humor irreverente y cercano de Raúl Antón. ¡No pararás de reír!",
        isFeatured: true, contactEmail: "Raulanton12@gmail.com", bookingUrl: "https://www.google.com"
    },
    {
        id: 103, title: "Concierto de Nathy Peluso", category: "Musicales", rating: 5.0, reviews: 310, city: "Alicante", minPrice: 45, date: "2024-02-26",
        imageUrl: "https://drive.google.com/thumbnail?id=1NsV7R-anmsnsL8Q7TfNmUZOm60ATtowt&sz=w500",
        description: "La artista argentina Nathy Peluso en vivo, presentando sus éxitos y nuevos temas con su inconfundible estilo.",
        isFeatured: false, contactEmail: "eventime23@gmail.com", bookingUrl: "https://www.google.com"
    },
    {
        id: 104, title: "Festival de Jazz de Madrid", category: "Festivales", rating: 5.0, reviews: 250, city: "Elche", minPrice: 25, date: "2024-03-10",
        imageUrl: "https://drive.google.com/thumbnail?id=1yQVGoj7W18fnilejiJH0oaUMXhpVbcM_&sz=w500",
        description: "Una selección de los mejores talentos del jazz nacional e internacional en diferentes escenarios de la ciudad.",
        isFeatured: false, contactEmail: "jazzmadrid@gmail.com", bookingUrl: "https://www.google.com"
    },
    {
        id: 106, title: "Formula 1 Madrid Grand Prix", category: "Motor", rating: 5.0, reviews: 789, city: "Madrid", minPrice: 150, date: "2025-05-18",
        imageUrl: "https://drive.google.com/thumbnail?id=1PHrEk1X9SppVzf2Jnl1EAdOcTO7BYLFN&sz=w500",
        description: "La emoción de la Fórmula 1 llega a Madrid con una carrera urbana espectacular. Vive la velocidad y la adrenalina en primera persona.",
        isFeatured: true, contactEmail: "f1best@gmail.com", bookingUrl: "https://www.google.com"
    },
    {
        id: 107, title: "Exposición Maestros del Renacimiento", category: "Arte", rating: 4.0, reviews: 120, city: "Madrid", minPrice: 15, date: "2024-03-20",
        imageUrl: "https://drive.google.com/thumbnail?id=1Fn1KKqiCYKu1iudHCE0W8_JEGPHDw8xN&sz=w500",
        description: "Un viaje a través de las obras cumbre de los grandes artistas del Renacimiento europeo.",
        isFeatured: true, contactEmail: "topeventos@gmail.com", bookingUrl: "https://www.google.com"
    },
    {
        id: 108, title: "Festival de Comedia Indie", category: "Comedia", rating: 4.0, reviews: 65, city: "Madrid", minPrice: 18, date: "2024-04-05",
        imageUrl: "https://drive.google.com/thumbnail?id=16YwfLSk9E_N9hxr2VS24bedOBiHvgbTg&sz=w500",
        description: "Descubre nuevas voces del stand-up y monólogos emergentes en este festival innovador.",
        isFeatured: false, contactEmail: "topeventos@gmail.com", bookingUrl: "https://www.google.com"
    },
    {
        id: 109, title: "Ópera: Carmen en el Real", category: "Ópera", rating: 4.0, reviews: 50, city: "Madrid", minPrice: 70, date: "2024-05-10",
        imageUrl: "https://drive.google.com/thumbnail?id=1Dn2qJt1KykWpFRJKwYxsNoHIhlLVY8lK&sz=w500",
        description: "La icónica ópera de Bizet, Carmen, interpretada por un elenco de talla mundial en el Teatro Real.",
        isFeatured: false, contactEmail: "topeventos@gmail.com", bookingUrl: "https://www.google.com"
    },
    {
        id: 110, title: "Maratón de Madrid 2024", category: "Deportes", rating: 4.0, reviews: 80, city: "Madrid", minPrice: 50, date: "2024-04-28",
        imageUrl: "https://drive.google.com/thumbnail?id=158sxGzMliFIAze4ZAsiQ8TL56Yvtp7WN&sz=w500",
        description: "Corre por las calles de Madrid en uno de los maratones más emblemáticos de España.",
        isFeatured: false, contactEmail: "topeventos@gmail.com", bookingUrl: "https://www.google.com"
    },
    {
        id: 111, title: "Conferencia El Futuro de la IA", category: "Conferencias", rating: 4.0, reviews: 75, city: "Madrid", minPrice: 25, date: "2024-06-15",
        imageUrl: "https://drive.google.com/thumbnail?id=1ioMt06JSFH0JPlwbGC6xStRVheWpRFr7&sz=w500",
        description: "Expertos en inteligencia artificial debaten sobre los avances y el impacto de la IA en nuestra sociedad.",
        isFeatured: false, contactEmail: "topeventos@gmail.com", bookingUrl: "https://www.google.com"
    },
];

/**
 * Inicializa la base de datos de Firestore con los datos de ejemplo.
 * Solo debe ejecutarse si la colección está vacía.
 */
async function seedEvents() {
    if (!db) {
        console.error("Firestore no está inicializado.");
        return;
    }
    
    // Ruta de la colección: /artifacts/{appId}/public/data/events
    const eventsCollectionPath = `artifacts/${appId}/public/data/events`;
    const eventsColRef = collection(db, eventsCollectionPath);
    
    // Oculta el botón de inicialización y muestra el mensaje de carga
    if (seedDataBtn) seedDataBtn.style.display = 'none';
    if (loadingMessage) loadingMessage.textContent = 'Inicializando datos de ejemplo...';

    try {
        const batch = writeBatch(db);
        
        initialEventsData.forEach(eventData => {
            // Usamos el ID_EVENTO como ID del documento para facilitar la búsqueda
            const docRef = doc(eventsColRef, String(eventData.id)); 
            
            // Usamos un objeto con las claves en minúscula y más limpias
            const documentData = {
                title: eventData.title,
                category: eventData.category,
                rating: eventData.rating,
                reviews: eventData.reviews,
                city: eventData.city,
                minPrice: eventData.minPrice,
                date: eventData.date, // Formato YYYY-MM-DD
                imageUrl: eventData.imageUrl,
                description: eventData.description,
                isFeatured: eventData.isFeatured,
                contactEmail: eventData.contactEmail,
                bookingUrl: eventData.bookingUrl
            };

            batch.set(docRef, documentData);
        });

        await batch.commit();
        console.log("Datos de ejemplo inicializados exitosamente.");
        if (loadingMessage) loadingMessage.textContent = 'Datos cargados, actualizando eventos...';

    } catch (error) {
        console.error("Error al inicializar datos:", error);
        if (loadingMessage) loadingMessage.textContent = `Error al inicializar datos: ${error.message}`;
    }
}


// --- 4. LISTENERS DE UI Y STARTUP ---

// Lógica de UI simple (Modo Oscuro, Ancho de pantalla)
function setupUILogic() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) document.documentElement.classList.add('dark');
    
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            const newMode = document.documentElement.classList.contains('dark');
            localStorage.setItem('darkMode', newMode);
            darkModeToggle.querySelector('i').className = newMode ? 'fas fa-moon text-lg text-white' : 'fas fa-sun text-lg text-gray-800';
        });
        // Configuración inicial del icono
        darkModeToggle.querySelector('i').className = isDarkMode ? 'fas fa-moon text-lg text-white' : 'fas fa-sun text-lg text-gray-800';
    }

    const widthDisplay = document.getElementById('screen-width-display');
    const updateWidth = () => {
        if (widthDisplay) widthDisplay.textContent = `Ancho: ${window.innerWidth}px`;
    };
    window.addEventListener('resize', updateWidth);
    updateWidth(); // Llamada inicial

    // Listener para el filtro de ciudad
    if (cityFilter) {
        cityFilter.addEventListener('change', setupFirestoreListener);
    }
    
    // Listener para el botón de inicialización de datos
    if (seedDataBtn) {
        seedDataBtn.addEventListener('click', seedEvents);
    }
}

// Inicialización de la aplicación
window.onload = () => {
    setupUILogic();
    initializeFirebaseAndAuth();
};
