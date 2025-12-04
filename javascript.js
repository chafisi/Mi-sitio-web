// --- JAVASCRIPT: INDICADOR DE ANCHO DE PANTALLA ---

const widthDisplay = document.getElementById('screen-width-display');

/**
 * Actualiza el ancho de la pantalla y el color de fondo del indicador.
 * Depende de las variables CSS definidas en style.css.
 */
function updateScreenWidth() {
    const width = window.innerWidth;
    if (widthDisplay) {
        widthDisplay.innerText = `Ancho: ${width}px`;

        // Para obtener el color correcto de la variable CSS usamos getComputedStyle del body
        const computedStyle = getComputedStyle(document.body);
        const colorPill = computedStyle.getPropertyValue('--color-pill').trim();

        widthDisplay.style.backgroundColor = colorPill;
    }
}

// Inicializa y escucha el redimensionamiento
window.addEventListener('resize', updateScreenWidth);


// --- JAVASCRIPT: MODO OSCURO ---
const toggleButton = document.getElementById('dark-mode-toggle');
const body = document.body;
// Verificar si el botón existe antes de intentar obtener el ícono
const icon = toggleButton ? toggleButton.querySelector('i') : null;

/**
 * Alterna la clase 'dark-mode' en el body y ajusta el icono y el color del botón.
 * Depende de las variables CSS definidas en style.css.
 */
function toggleDarkMode() {
    if (!body) return; // Salir si el body no se encuentra por alguna razón

    const isDarkMode = body.classList.toggle('dark-mode');
    
    // Re-evaluamos los estilos para obtener el color correcto después del cambio
    const computedStyle = getComputedStyle(document.body);

    // Cambiar el icono
    if (icon) {
        if (isDarkMode) {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        } else {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    }
    
    // Actualizar el color del botón (usa las variables CSS de nuevo)
    if (toggleButton) {
        const colorPrimary = computedStyle.getPropertyValue('--color-primary').trim();
        const colorSecondary = computedStyle.getPropertyValue('--color-secondary').trim();

        toggleButton.style.backgroundColor = isDarkMode ? colorSecondary : colorPrimary;
    }

    // Asegurar que el indicador de ancho también se actualice con el color de píldora correcto
    updateScreenWidth(); 
}

// Inicialización de Event Listeners y estado inicial
if (toggleButton) {
    toggleButton.addEventListener('click', toggleDarkMode);
}

// Lógica que se ejecuta al cargar la página (para inicializar estados)
window.onload = function() {
    // Inicializar el color del botón según el modo inicial (que es claro por defecto)
    if (toggleButton) {
        toggleButton.style.backgroundColor = getComputedStyle(document.body).getPropertyValue('--color-primary').trim();
    }
    // Inicializar el estado de la píldora al cargar
    updateScreenWidth(); 
};
