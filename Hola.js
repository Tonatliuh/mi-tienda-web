var carrito = [];
var NUMERO_WHATSAPP = "+584121656611";
var swipeInitialized = false;

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

// 1. AÑADIR AL CARRITO
function agregarAlCarrito(nombre, precio) {
    precio = parseFloat(precio);
    if (isNaN(precio)) {
        alert("Error: precio inválido");
        return;
    }

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

    var floatingCountElem = document.getElementById("floating-cart-count");
    if (floatingCountElem) {
        floatingCountElem.textContent = carrito.length;
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

                li.querySelector("span").textContent = producto.nombre;
                cartItemsList.appendChild(li);
            }
        }

        var totalElem = document.getElementById("cart-total");
        if (totalElem) {
            totalElem.textContent = total.toFixed(2);
        }
    }
    actualizarConversion();
}

// 4.5. ACTUALIZAR CONVERSIÓN A BOLÍVARES
function actualizarConversion() {
    var totalElem = document.getElementById("cart-total");
    var totalBsElem = document.getElementById("total-bs");
    var tasaElem = document.getElementById("tasa-cambio");

    var tasaElem = document.getElementById("tasa-cambio");

    if (totalElem && totalBsElem && tasaElem) {
        var totalUSD = parseFloat(totalElem.textContent) || 0;
        var tasa = parseFloat(tasaElem.value) || 973.93;
        var tasa = parseFloat(tasaElem.value) || 0;
        var totalBs = totalUSD * tasa;
        totalBsElem.textContent = totalBs.toFixed(2);
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

// 6. BUSCADOR EN TIEMPO REAL
function buscarProducto() {
    var input = document.getElementById("search-input").value.toLowerCase();
    var productos = document.querySelectorAll(".product-card");

    for (var i = 0; i < productos.length; i++) {
        var card = productos[i];
        var titulo = card.querySelector("h3").textContent.toLowerCase();

        if (titulo.indexOf(input) !== -1) {
            card.classList.remove("hidden");
        } else {
            card.classList.add("hidden");
        }
    }
}

// 7. SCROLL CARRUSEL
function scrollCarousel(boton, direccion) {
    var container = boton.parentElement;
    var track = container.querySelector(".carousel-track");
    if (track) {
        var card = track.querySelector(".product-card");
        var cardWidth = card ? card.offsetWidth + 15 : 215;
        track.scrollBy({ left: direccion * cardWidth * 2, behavior: "smooth" });
    }
}

// 8. MENÚ HAMBURGUESA
function toggleMenu() {
    var menu = document.getElementById("side-menu");
    var overlay = document.getElementById("menu-overlay");
    var hamburger = document.querySelector(".hamburger-btn");

    if (menu && overlay) {
        menu.classList.toggle("open");
        overlay.classList.toggle("active");
        if (hamburger) {
            hamburger.classList.toggle("active");
        }
    }
}

// 9. SCROLL A SECCIÓN
function scrollToSection(id) {
    var section = document.getElementById(id);
    if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

// 10. CERRAR MENÚ AL HACER SCROLL
function initScrollClose() {
    var lastScrollY = window.scrollY;
    var menu = document.getElementById("side-menu");
    var cartSidebar = document.getElementById("cart-sidebar");

    window.addEventListener("scroll", function() {
        var currentScrollY = window.scrollY;

        // Cerrar menú si se hace scroll hacia abajo
        if (currentScrollY > lastScrollY && menu && menu.classList.contains("open")) {
            toggleMenu();
        }

        // Cerrar carrito si se hace scroll hacia abajo
        if (currentScrollY > lastScrollY && cartSidebar && cartSidebar.classList.contains("open")) {
            toggleCarrito();
        }

        lastScrollY = currentScrollY;
    }, { passive: true });
}

// 11. SWIPE GESTURES PARA CARRUSELES
function initSwipeGestures() {
    var tracks = document.querySelectorAll(".carousel-track");

    tracks.forEach(function(track) {
        var isDown = false;
        var startX = 0;
        var startScrollLeft = 0;
        var velocity = 0;
        var lastX = 0;
        var lastTime = 0;

        // Mouse events (desktop)
        track.addEventListener("mousedown", function(e) {
            isDown = true;
            track.classList.add("dragging");
            startX = e.pageX;
            startScrollLeft = track.scrollLeft;
            lastX = e.pageX;
            lastTime = Date.now();
            velocity = 0;
        });

        track.addEventListener("mousemove", function(e) {
            if (!isDown) return;
            e.preventDefault();
            var x = e.pageX;
            var walk = (x - startX) * 2;
            track.scrollLeft = startScrollLeft - walk;

            var now = Date.now();
            var dt = now - lastTime;
            if (dt > 0) {
                velocity = (x - lastX) / dt;
                lastX = x;
                lastTime = now;
            }
        });

        track.addEventListener("mouseup", function() {
            if (!isDown) return;
            isDown = false;
            track.classList.remove("dragging");

            if (Math.abs(velocity) > 0.5) {
                var momentum = velocity * 200;
                track.scrollBy({ left: -momentum, behavior: "smooth" });
            }
        });

        track.addEventListener("mouseleave", function() {
            if (isDown) {
                isDown = false;
                track.classList.remove("dragging");
            }
        });

        // Touch events (móvil)
        track.addEventListener("touchstart", function(e) {
            isDown = true;
            track.classList.add("dragging");
            startX = e.touches[0].pageX;
            startScrollLeft = track.scrollLeft;
            lastX = e.touches[0].pageX;
            lastTime = Date.now();
            velocity = 0;
        }, { passive: true });

        track.addEventListener("touchmove", function(e) {
            if (!isDown) return;
            var x = e.touches[0].pageX;
            var walk = (x - startX) * 1.5;
            track.scrollLeft = startScrollLeft - walk;

            var now = Date.now();
            var dt = now - lastTime;
            if (dt > 0) {
                velocity = (x - lastX) / dt;
                lastX = x;
                lastTime = now;
            }
        }, { passive: true });

        track.addEventListener("touchend", function() {
            if (!isDown) return;
            isDown = false;
            track.classList.remove("dragging");

            if (Math.abs(velocity) > 0.3) {
                var momentum = velocity * 150;
                track.scrollBy({ left: -momentum, behavior: "smooth" });
            }
        });
    });

    swipeInitialized = true;
}

// 12. REINICIAR SWIPE GESTURES (para contenido dinámico)
function reinitSwipeGestures() {
    if (swipeInitialized) {
        initSwipeGestures();
    }
}

// 13. ENVIAR ORDEN A WHATSAPP
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

    var tasa = parseFloat(document.getElementById("tasa-cambio").value) || 973.93;
    var totalBs = total * tasa;

    mensaje += "\nMonto Total Estimado: $" + total.toFixed(2) + " USD";
    mensaje += "\nMonto Total Estimado: Bs. " + totalBs.toFixed(2) + " (tasa del día)";
    mensaje += "\n\n¿Tienen disponibilidad de estos artículos?";

    var url = "https://wa.me/" + NUMERO_WHATSAPP + "?text=" + encodeURIComponent(mensaje);
    window.open(url, "_blank");
}

// 14. MOSTRAR NOTIFICACIONES TOAST
function mostrarToast(mensaje, tipo) {
    var container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.style.cssText = "position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;";
        document.body.appendChild(container);
    }

    var colores = {
        success: { bg: "#22c55e", border: "#16a34a" },
        warning: { bg: "#f59e0b", border: "#d97706" },
        info: { bg: "#3b82f6", border: "#2563eb" }
    };
    var color = colores[tipo] || colores.info;

    var toast = document.createElement("div");
    toast.style.cssText = "background: " + color.bg + "; color: white; padding: 12px 20px; border-radius: 10px; border-left: 4px solid " + color.border + "; font-weight: 600; font-size: 0.9em; box-shadow: 0 4px 12px rgba(0,0,0,0.3); animation: slideIn 0.3s ease; max-width: 300px;";
    toast.textContent = mensaje;

    container.appendChild(toast);

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

// Inicializar
cargarCarrito();
actualizarCarritoUI();
initSwipeGestures();
initScrollClose();
