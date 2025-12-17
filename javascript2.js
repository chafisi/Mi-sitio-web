/*<!-- ---------------------------------------------------- -->
    <!-- LÓGICA DE NAVEGACIÓN (JAVASCRIPT) -->
    <!-- ---------------------------------------------------- -->*/
    
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
