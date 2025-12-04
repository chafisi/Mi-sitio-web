// Variables globales para la gestión de estado de la paginación
let contentPage = 1;
const totalPages = 3; 

// Referencias a los elementos del DOM
const hamburgerBtn = document.getElementById('hamburger-btn');
const mobileOverlay = document.getElementById('mobile-menu-overlay');
const sidebar = document.getElementById('sidebar');
const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
const loadMoreBtn = document.getElementById('load-more-btn');
const contentItems = document.getElementById('content-items');
const loadStatus = document.getElementById('load-status');
const searchInput = document.getElementById('search-input');
const searchSuggestions = document.getElementById('search-suggestions');
const searchSuggestionItems = searchSuggestions.querySelectorAll('[data-value]');


// --- TÉCNICA 6: Menú Hamburguesa & TÉCNICA 4: Navegación Lateral Colapsable (Móvil) ---

/**
 * Alterna la visibilidad de los menús laterales y el overlay en móvil.
 */
function toggleMobileMenu() {
    // Comprueba si la sidebar está oculta (tiene la clase -translate-x-full)
    const isSidebarHidden = sidebar.classList.contains('-translate-x-full');
    
    if (isSidebarHidden) {
        // Mostrar Sidebar
        sidebar.classList.remove('-translate-x-full');
        sidebar.classList.add('translate-x-0');
        mobileOverlay.classList.remove('hidden');
    } else {
        // Ocultar Sidebar
        sidebar.classList.add('-translate-x-full');
        sidebar.classList.remove('translate-x-0');
        mobileOverlay.classList.add('hidden');
    }
}

// Event Listeners para el toggle
hamburgerBtn.addEventListener('click', toggleMobileMenu);
toggleSidebarBtn.addEventListener('click', toggleMobileMenu);
mobileOverlay.addEventListener('click', toggleMobileMenu);


// --- TÉCNICA 5: Paginación / Scroll Infinito (Load More) ---

/**
 * Simula la carga de más contenido al hacer clic en el botón.
 */
loadMoreBtn.addEventListener('click', () => {
    if (contentPage >= totalPages) {
        // Si ya estamos en la última página, no hacemos nada
        loadStatus.textContent = "Has llegado al final del contenido (Paginación Completa).";
        loadMoreBtn.disabled = true;
        loadMoreBtn.classList.replace('bg-green-600', 'bg-gray-400');
        loadMoreBtn.classList.remove('hover:bg-green-700');
        loadMoreBtn.textContent = "No hay más contenido";
        return;
    }

    // Simulación de nuevos datos
    contentPage++;
    const newContent = document.createElement('article');
    newContent.className = 'bg-yellow-50 p-6 rounded-xl shadow-md border-l-4 border-yellow-500';
    newContent.innerHTML = `
        <h2 class="text-2xl font-semibold mb-3">Nuevo Contenido Cargado (Página ${contentPage})</h2>
        <p class="text-gray-700 leading-relaxed">
            Esta sección se cargó dinámicamente, simulando la técnica 'Load More' (carga continua) de la navegación. Este patrón se utiliza a menudo junto a un <span class="contextual-link">Menú Fijo</span> para mantener la orientación.
        </p>
    `;
    contentItems.appendChild(newContent);
    
    loadStatus.textContent = `Página ${contentPage} de ${totalPages} cargada.`;

    if (contentPage >= totalPages) {
        loadStatus.textContent = "Has llegado al final del contenido (Paginación Completa).";
        loadMoreBtn.disabled = true;
        loadMoreBtn.classList.replace('bg-green-600', 'bg-gray-400');
        loadMoreBtn.classList.remove('hover:bg-green-700');
        loadMoreBtn.textContent = "No hay más contenido";
    }
});


// --- TÉCNICA 7: BÚSQUEDA INTERNA (Autocompletado simulado) ---

/**
 * Muestra las sugerencias de búsqueda al teclear.
 */
searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    
    // Si se escribe algo, mostramos las sugerencias (simulación)
    if (query.length > 0) { 
        searchSuggestions.classList.remove('hidden');
    } else {
        searchSuggestions.classList.add('hidden');
    }
});

/**
 * Maneja el clic en una sugerencia para rellenar el campo de búsqueda.
 */
searchSuggestionItems.forEach(item => {
    item.addEventListener('click', () => {
        searchInput.value = item.getAttribute('data-value');
        searchSuggestions.classList.add('hidden');
    });
});


/**
 * Oculta las sugerencias al hacer clic fuera del campo de búsqueda o las sugerencias.
 */
document.addEventListener('click', (event) => {
    // Comprueba si el objetivo del clic no es el input ni el contenedor de sugerencias
    if (!searchInput.contains(event.target) && !searchSuggestions.contains(event.target)) {
        searchSuggestions.classList.add('hidden');
    }
});
