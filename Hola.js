var carrito = [];
var NUMERO_WHATSAPP = "+584121656611";
var categoriaActiva = "todos";

// Cargar carrito desde localStorage al iniciar
function cargarCarrito() {
    try {
        var guardado = localStorage.getItem("carrito");
        if (guardado) {
            carrito = JSON.parse(guardado);
            if (!Array.isArray(carrito)) {
                carrito = [];
            }
        }
    } catch (e) {
        console.warn("localStorage no disponible:", e);
        carrito = [];
    }
}

// Guardar carrito en localStorage
function guardarCarrito() {
    try {
        localStorage.setItem("carrito", JSON.stringify(carrito));
    } catch (e) {
        console.warn("No se pudo guardar en localStorage:", e);
    }
}

// 1. AÑADIR AL CARRITO (Sin abrir el panel automáticamente)
function agregarAlCarrito(nombre, precio) {
    precio = parseFloat(precio);
    if (isNaN(precio)) {
        alert("Error: precio inválido");
        return;
    }

    // Verificar si el producto ya existe en el carrito
    var existe = false;
    for (var i = 0; i < carrito.length; i++) {
        if (carrito[i].nombre === nombre) {
            existe = true;
            break;
        }
    }

    if (existe) {
        mostrarToast("El producto '" + nombre + "' ya está en el carrito.", "warning");
        return;
    }

    carrito.push({ nombre: nombre, precio: precio });
    guardarCarrito();
    actualizarCarritoUI();
    mostrarToast("'" + nombre + "' agregado al carrito.", "success");
}

// 2. ELIMINAR UN ARTÍCULO ESPECÍFICO DEL CARRITO
function eliminarDelCarrito(indice) {
    carrito.splice(indice, 1);
    guardarCarrito();
    actualizarCarritoUI();
}

// 3. VACIAR CARRITO COMPLETO
function vaciarCarrito() {
    if (carrito.length === 0) {
        mostrarToast("El carrito ya está vacío.", "info");
        return;
    }
    if (confirm("¿Estás seguro de que deseas vaciar el carrito?")) {
        carrito = [];
        guardarCarrito();
        actualizarCarritoUI();
        mostrarToast("Carrito vaciado correctamente.", "info");
    }
}

// 4. ACTUALIZAR INTERFAZ DEL CARRITO
function actualizarCarritoUI() {
    var countElem = document.getElementById("cart-count");
    if (countElem) {
        countElem.textContent = carrito.length;
    }

    var cartItemsList = document.getElementById("cart-items");
    if (cartItemsList) {
        cartItemsList.innerHTML = "";
        var total = 0;

        if (carrito.length === 0) {
            cartItemsList.innerHTML = '<li style="text-align: center; color: #94a3b8; border: none; padding: 20px 0;">El carrito está vacío.</li>';
        } else {
            for (var i = 0; i < carrito.length; i++) {
                var producto = carrito[i];
                total += producto.precio;

                var li = document.createElement("li");
                li.innerHTML =
                    '<div style="display: flex; flex-direction: column; gap: 2px;">' +
                        '<span style="font-weight: 600;"></span>' +
                        '<span style="color: #22c55e; font-weight: 700;">$' + producto.precio.toFixed(2) + '</span>' +
                    '</div>' +
                    '<button onclick="eliminarDelCarrito(' + i + ')" title="Eliminar artículo" style="background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid #ef4444; padding: 4px 8px; border-radius: 8px; cursor: pointer; font-size: 0.8em; transition: all 0.2s;">✕ Eliminar</button>';

                // Insertar nombre de forma segura para evitar XSS
                li.querySelector("span").textContent = producto.nombre;

                cartItemsList.appendChild(li);
            }
        }

        var totalElem = document.getElementById("cart-total");
        if (totalElem) {
            totalElem.textContent = total.toFixed(2);
        }
    }
}

// 5. ABRIR / CERRAR CARRITO
function toggleCarrito() {
    var sidebar = document.getElementById("cart-sidebar");
    var overlay = document.getElementById("overlay");
    if (sidebar && overlay) {
        sidebar.classList.toggle("open");
        overlay.classList.toggle("active");
    }
}

// 6. FILTRAR POR CATEGORÍAS
function filtrarCategoria(categoria, elementoBoton) {
    categoriaActiva = categoria;
    var productos = document.querySelectorAll(".product-card");
    var botones = document.querySelectorAll(".category-btn");

    for (var j = 0; j < botones.length; j++) {
        botones[j].classList.remove("active");
    }

    if (elementoBoton) {
        elementoBoton.classList.add("active");
    }

    for (var i = 0; i < productos.length; i++) {
        var card = productos[i];
        var cat = card.getAttribute("data-category");

        if (categoria === "todos" || cat === categoria) {
            card.classList.remove("hidden");
        } else {
            card.classList.add("hidden");
        }
    }
}

// 7. BUSCADOR EN TIEMPO REAL (respeta el filtro de categoría activo)
function buscarProducto() {
    var input = document.getElementById("search-input").value.toLowerCase();
    var productos = document.querySelectorAll(".product-card");

    for (var i = 0; i < productos.length; i++) {
        var card = productos[i];
        var titulo = card.querySelector("h3").textContent.toLowerCase();
        var cat = card.getAttribute("data-category");

        var coincideCategoria = (categoriaActiva === "todos" || cat === categoriaActiva);
        var coincideBusqueda = (titulo.indexOf(input) !== -1);

        if (coincideCategoria && coincideBusqueda) {
            card.classList.remove("hidden");
        } else {
            card.classList.add("hidden");
        }
    }
}

// 8. ENVIAR ORDEN A WHATSAPP
function enviarWhatsApp() {
    if (carrito.length === 0) {
        alert("El carrito está vacío. Agrega algún producto antes de enviar tu orden.");
        return;
    }

    var mensaje = "Hola, me gustaría consultar la disponibilidad de los siguientes productos:\n\n";
    var total = 0;

    for (var i = 0; i < carrito.length; i++) {
        mensaje += (i + 1) + ". " + carrito[i].nombre + " - $" + carrito[i].precio.toFixed(2) + "\n";
        total += carrito[i].precio;
    }

    mensaje += "\nMonto Total Estimado: $" + total.toFixed(2) + "\n\n¿Tienen disponibilidad de estos artículos?";

    var url = "https://wa.me/" + NUMERO_WHATSAPP + "?text=" + encodeURIComponent(mensaje);
    window.open(url, "_blank");
}

// 9. MOSTRAR NOTIFICACIONES TOAST
function mostrarToast(mensaje, tipo) {
    // Crear contenedor de toasts si no existe
    var container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.style.cssText = "position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;";
        document.body.appendChild(container);
    }

    // Colores según tipo
    var colores = {
        success: { bg: "#22c55e", border: "#16a34a" },
        warning: { bg: "#f59e0b", border: "#d97706" },
        info: { bg: "#3b82f6", border: "#2563eb" }
    };
    var color = colores[tipo] || colores.info;

    // Crear toast
    var toast = document.createElement("div");
    toast.style.cssText = "background: " + color.bg + "; color: white; padding: 12px 20px; border-radius: 10px; border-left: 4px solid " + color.border + "; font-weight: 600; font-size: 0.9em; box-shadow: 0 4px 12px rgba(0,0,0,0.3); animation: slideIn 0.3s ease; max-width: 300px;";
    toast.textContent = mensaje;

    container.appendChild(toast);

    // Remover después de 3 segundos
    setTimeout(function() {
        toast.style.animation = "slideOut 0.3s ease";
        setTimeout(function() {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Agregar animaciones CSS para los toasts
var style = document.createElement("style");
style.textContent = "@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }";
document.head.appendChild(style);

// Inicializar carrito al cargar la página
cargarCarrito();
actualizarCarritoUI();
