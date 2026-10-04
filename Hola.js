'use strict';

const NUMERO_WHATSAPP = "+584121656611";
let carrito = [];
let swipeInitialized = false;

// Cargar carrito desde localStorage al iniciar
function cargarCarrito() {
    try {
        const guardado = localStorage.getItem("carrito");
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

    let existe = false;
    for (let i = 0; i < carrito.length; i++) {
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
    const countElem = document.getElementById("cart-count");
    if (countElem) {
        countElem.textContent = carrito.length;
    }

    const floatingCountElem = document.getElementById("floating-cart-count");
    if (floatingCountElem) {
        floatingCountElem.textContent = carrito.length;
    }

    const cartItemsList = document.getElementById("cart-items");
    if (cartItemsList) {
        cartItemsList.innerHTML = "";
        let total = 0;

        if (carrito.length === 0) {
            cartItemsList.innerHTML = '<li class="cart-item-empty">El carrito está vacío.</li>';
        } else {
            for (let i = 0; i < carrito.length; i++) {
                const producto = carrito[i];
                total += producto.precio;

                const li = document.createElement("li");

                // Creación segura de elementos DOM (previene XSS)
                const divInfo = document.createElement('div');
                divInfo.className = 'cart-item-info';

                const spanNombre = document.createElement('span');
                spanNombre.className = 'cart-item-name';
                spanNombre.textContent = producto.nombre;

                const spanPrecio = document.createElement('span');
                spanPrecio.className = 'cart-item-price';
                spanPrecio.textContent = "$" + producto.precio.toFixed(2);

                divInfo.appendChild(spanNombre);
                divInfo.appendChild(spanPrecio);
                li.appendChild(divInfo);

                const btnEliminar = document.createElement('button');
                btnEliminar.setAttribute('title', 'Eliminar artículo');
                btnEliminar.className = 'cart-item-delete';
                btnEliminar.textContent = "✕ Eliminar";
                btnEliminar.addEventListener('click', function() {
                    eliminarDelCarrito(i);
                });
                li.appendChild(btnEliminar);

                cartItemsList.appendChild(li);
            }
        }

        const totalElem = document.getElementById("cart-total");
        if (totalElem) {
            totalElem.textContent = total.toFixed(2);
        }
    }
    actualizarConversion();
}

// 4.5. ACTUALIZAR CONVERSIÓN A BOLÍVARES
function actualizarConversion() {
    const totalElem = document.getElementById("cart-total");
    const totalBsElem = document.getElementById("total-bs");
    const tasaElem = document.getElementById("tasa-cambio");

    if (totalElem && totalBsElem && tasaElem) {
        const totalUSD = parseFloat(totalElem.textContent) || 0;
        const tasa = Math.max(0, parseFloat(tasaElem.value)) || 973.93;
        const totalBs = totalUSD * tasa;
        totalBsElem.textContent = totalBs.toFixed(2);
    }
}

// 5. ABRIR / CERRAR CARRITO
function toggleCarrito() {
    const sidebar = document.getElementById("cart-sidebar");
    const overlay = document.getElementById("overlay");
    if (sidebar && overlay) {
        sidebar.classList.toggle("open");
        overlay.classList.toggle("active");
    }
}

// 6. BUSCADOR EN TIEMPO REAL
function normalizarTexto(texto) {
    return texto.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function buscarProducto() {
    const input = normalizarTexto(document.getElementById("search-input").value);
    const productos = document.querySelectorAll(".product-card");

    for (let i = 0; i < productos.length; i++) {
        const card = productos[i];
        const titulo = normalizarTexto(card.querySelector("h3").textContent);

        if (titulo.indexOf(input) !== -1) {
            card.classList.remove("hidden");
        } else {
            card.classList.add("hidden");
        }
    }
}

// 7. SCROLL CARRUSEL
function scrollCarousel(boton, direccion) {
    const container = boton.parentElement;
    const track = container.querySelector(".carousel-track");
    if (track) {
        const card = track.querySelector(".product-card");
        const cardWidth = card ? card.offsetWidth + 15 : 215;
        track.scrollBy({ left: direccion * cardWidth * 2, behavior: "smooth" });
    }
}

// 8. MENÚ HAMBURGUESA
function toggleMenu() {
    const menu = document.getElementById("side-menu");
    const overlay = document.getElementById("menu-overlay");
    const hamburger = document.querySelector(".hamburger-btn");

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
    const section = document.getElementById(id);
    if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

// 10. CERRAR MENÚ AL HACER SCROLL
function initScrollClose() {
    let lastScrollY = window.scrollY;
    let ticking = false;
    const menu = document.getElementById("side-menu");
    const cartSidebar = document.getElementById("cart-sidebar");

    window.addEventListener("scroll", function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                const currentScrollY = window.scrollY;

                if (currentScrollY > lastScrollY && menu && menu.classList.contains("open")) {
                    toggleMenu();
                }

                if (currentScrollY > lastScrollY && cartSidebar && cartSidebar.classList.contains("open")) {
                    toggleCarrito();
                }

                lastScrollY = currentScrollY;
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// 11. SWIPE GESTURES PARA CARRUSELES
function initSwipeGestures() {
    const tracks = document.querySelectorAll(".carousel-track");

    tracks.forEach(function(track) {
        let isDown = false;
        let startX = 0;
        let startScrollLeft = 0;
        let velocity = 0;
        let lastX = 0;
        let lastTime = 0;

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
            const x = e.pageX;
            const walk = (x - startX) * 2;
            track.scrollLeft = startScrollLeft - walk;

            const now = Date.now();
            const dt = now - lastTime;
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
                const momentum = velocity * 200;
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
            const x = e.touches[0].pageX;
            const walk = (x - startX) * 1.5;
            track.scrollLeft = startScrollLeft - walk;

            const now = Date.now();
            const dt = now - lastTime;
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
                const momentum = velocity * 150;
                track.scrollBy({ left: -momentum, behavior: "smooth" });
            }
        });
    });

    swipeInitialized = true;
}

// 12. REINICIAR SWIPE GESTURES (para contenido dinámico)
function reinitSwipeGestures() {
    if (swipeInitialized) {
        const tracks = document.querySelectorAll(".carousel-track");
        tracks.forEach(function(track) {
            const clone = track.cloneNode(true);
            track.parentNode.replaceChild(clone, track);
        });
        initSwipeGestures();
    }
}

// 13. ENVIAR ORDEN A WHATSAPP
function enviarWhatsApp() {
    if (carrito.length === 0) {
        alert("El carrito está vacío. Agrega algún producto antes de enviar tu orden.");
        return;
    }

    let mensaje = "Hola, me gustaría consultar la disponibilidad de los siguientes productos:\n\n";
    let total = 0;

    for (let i = 0; i < carrito.length; i++) {
        mensaje += (i + 1) + ". " + carrito[i].nombre + " - $" + carrito[i].precio.toFixed(2) + "\n";
        total += carrito[i].precio;
    }

    const tasa = parseFloat(document.getElementById("tasa-cambio").value) || 973.93;
    const totalBs = total * tasa;

    mensaje += "\nMonto Total Estimado: $" + total.toFixed(2) + " USD";
    mensaje += "\nMonto Total Estimado: Bs. " + totalBs.toFixed(2) + " (tasa del día)";
    mensaje += "\n\n¿Tienen disponibilidad de estos artículos?";

    const url = "https://wa.me/" + NUMERO_WHATSAPP + "?text=" + encodeURIComponent(mensaje);
    window.open(url, "_blank");
}

// 14. MOSTRAR NOTIFICACIONES TOAST
function mostrarToast(mensaje, tipo) {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = 'toast toast-' + tipo;
    toast.textContent = mensaje;

    container.appendChild(toast);

    setTimeout(function() {
        toast.classList.add('hiding');
        setTimeout(function() {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Inicializar cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar con manejo de errores
    try {
        cargarCarrito();
        actualizarCarritoUI();
        initSwipeGestures();
        initScrollClose();
    } catch (e) {
        console.error('[ERROR] Fallo en inicialización:', e);
    }

    // Inicializar eventos
    
    // Botón hamburguesa
    const hamburger = document.querySelector('.hamburger-btn');
    if (hamburger) hamburger.addEventListener('click', toggleMenu);

    // Botón carrito
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) cartBtn.addEventListener('click', toggleCarrito);

    // Botón cerrar menú
    const closeMenuBtn = document.querySelector('.close-menu-btn');
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', toggleMenu);

    // Overlay del menú
    const menuOverlay = document.getElementById('menu-overlay');
    if (menuOverlay) menuOverlay.addEventListener('click', toggleMenu);

    // Input de búsqueda
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.addEventListener('input', buscarProducto);

    // Botones de carrusel
    document.querySelectorAll('.carousel-btn.prev').forEach(btn => {
        btn.addEventListener('click', function() { scrollCarousel(this, -1); });
    });
    document.querySelectorAll('.carousel-btn.next').forEach(btn => {
        btn.addEventListener('click', function() { scrollCarousel(this, 1); });
    });

    // Botones de añadir al carrito - usar data atributos
    const productButtons = document.querySelectorAll('.product-info button');
    productButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const nombre = this.dataset.nombre;
            const precio = parseFloat(this.dataset.precio);
            agregarAlCarrito(nombre, precio);
        });
    });

    // Enlaces del menú lateral
    document.querySelectorAll('.menu-list a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
            toggleMenu();
        });
    });

    // Botón flotante de carrito
    const floatingCartBtn = document.querySelector('.floating-cart-btn');
    if (floatingCartBtn) floatingCartBtn.addEventListener('click', toggleCarrito);

    // Botón cerrar carrito
    const closeCartBtn = document.querySelector('.close-btn');
    if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCarrito);

    // Overlay del carrito
    const overlay = document.getElementById('overlay');
    if (overlay) overlay.addEventListener('click', toggleCarrito);

    // Input de tasa de cambio
    const tasaInput = document.getElementById('tasa-cambio');
    if (tasaInput) tasaInput.addEventListener('input', actualizarConversion);

    // Botón de WhatsApp
    const whatsappBtn = document.querySelector('.whatsapp-btn');
    if (whatsappBtn) whatsappBtn.addEventListener('click', enviarWhatsApp);
});
