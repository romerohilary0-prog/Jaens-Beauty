// --- 1. GESTIÓN DE DATOS (ESTADO GLOBAL) ---
const API_URL = "http://localhost:3000"; 
let usuarioActivo = localStorage.getItem("usuarioActivo");
let carritos = JSON.parse(localStorage.getItem("carritos")) || {};


// --- 2. INICIALIZACIÓN ---
document.addEventListener("DOMContentLoaded", () => {
    console.log("Tienda iniciada para:", usuarioActivo || "Invitado");
    
    if (document.getElementById("contenedor-productos")) {
        cargarProductos();
    }
    
    actualizarCarrito();
    
    const userTxt = document.getElementById("usuarioTexto");
    if (usuarioActivo && userTxt) {
        userTxt.textContent = "Hola, " + usuarioActivo;
    }
});

// --- 3. FUNCIONES DE PRODUCTOS ---
async function cargarProductos() {
    const contenedor = document.getElementById("contenedor-productos");
    if (!contenedor) return;

    try {
        const response = await fetch(`${API_URL}/productos`);
        if (!response.ok) throw new Error("No se pudo conectar con el servidor");
        
        const productos = await response.json();
        contenedor.innerHTML = ""; 

        productos.forEach(prod => {
            const divProducto = document.createElement("div");
            divProducto.className = "producto";
            const imgUrl = prod.imagen || "https://via.placeholder.com/150";

            divProducto.innerHTML = `
                <img src="${imgUrl}" alt="${prod.marca}">
                <h3>${prod.marca}</h3>
                <p>${prod.detalle}</p>
                <p><strong>$${prod.precio}</strong></p>
                <button onclick="agregarCarrito('${prod.marca.replace(/'/g, "\\'")}', ${prod.precio}, '${imgUrl}')">
                    Agregar
                </button>
            `;
            contenedor.appendChild(divProducto);
        });
    } catch (error) {
        console.error("Error:", error);
        contenedor.innerHTML = "<p>Error al cargar el catálogo ❌. Revisa el backend.</p>";
    }
}

// --- 4. GESTIÓN DEL CARRITO ---
function obtenerCarrito() {
    if (!usuarioActivo) {
        alert("Debes iniciar sesión para comprar");
        window.location.href = "login.html";
        return null;
    }
    if (!carritos[usuarioActivo]) {
        carritos[usuarioActivo] = [];
    }
    return carritos[usuarioActivo];
}

function agregarCarrito(nombre, precio, imagen) {
    let carrito = obtenerCarrito();
    if (!carrito) return;

    let producto = carrito.find(p => p.nombre === nombre);

    if (producto) {
        producto.cantidad++;
    } else {
        carrito.push({ nombre, precio, imagen, cantidad: 1 });
    }

    guardarCarrito(carrito);
    actualizarCarrito();
    abrirPanel(); 
    mostrarMensaje(`${nombre} añadido ✅`);
}

function guardarCarrito(carrito) {
    carritos[usuarioActivo] = carrito;
    localStorage.setItem("carritos", JSON.stringify(carritos));
}

function actualizarCarrito() {
    let carrito = (usuarioActivo && carritos[usuarioActivo]) ? carritos[usuarioActivo] : [];
    
    let listaModal = document.getElementById("listaCarrito"); 
    let listaPanel = document.getElementById("listaCarritoDetalle"); 
    let contador = document.getElementById("contador");
    let totalSpan = document.getElementById("total");
    let totalVenta = document.getElementById("totalVenta");

    if (listaModal) listaModal.innerHTML = "";
    if (listaPanel) listaPanel.innerHTML = "";

    let totalAcumulado = 0;
    let totalItems = 0;

    carrito.forEach((producto, index) => {
        let subtotal = producto.precio * producto.cantidad;
        totalAcumulado += subtotal;
        totalItems += producto.cantidad;

        let li = document.createElement("li");
        li.style.display = "flex";
        li.style.alignItems = "center";
        li.style.gap = "10px";
        li.style.marginBottom = "10px";
        
        li.innerHTML = `
            <img src="${producto.imagen}" width="40" height="40" style="object-fit: cover;">
            <div style="flex-grow: 1;">
                <span>${producto.nombre}</span><br>
                <small>$${producto.precio} x ${producto.cantidad}</small>
            </div>
            <div>
                <button onclick="cambiarCantidad(${index}, 1)">➕</button>
                <button onclick="cambiarCantidad(${index}, -1)">➖</button>
            </div>
        `;

        if (listaModal) listaModal.appendChild(li.cloneNode(true));
        if (listaPanel) listaPanel.appendChild(li);
    });

    if (contador) contador.textContent = totalItems;
    if (totalSpan) totalSpan.textContent = totalAcumulado.toFixed(2);
    if (totalVenta) totalVenta.textContent = totalAcumulado.toFixed(2);
}


function mostrarCarrito() {
    const panel = document.getElementById("panelCarrito");
    if (panel) {
        panel.classList.add("abierto");
    } else {
        console.error("No se encontró el elemento panelCarrito");
    }
}

function abrirPanel() {
    const panel = document.getElementById("panelCarrito");
    if (panel) panel.classList.add("abierto");
}

function cerrarPanel() {
    const panel = document.getElementById("panelCarrito");
    if (panel) panel.classList.remove("abierto");
}


// --- 6. CONEXIÓN AL BACKEND ---
async function procesarFactura() {
    const usuario = localStorage.getItem("usuarioActivo");
    const carritos = JSON.parse(localStorage.getItem("carritos")) || {};
    const miCarrito = carritos[usuario] || [];

    if (miCarrito.length === 0) {
        alert("No hay productos para guardar.");
        return;
    }

    const totalElement = document.getElementById("totalFactura");
    const totalTexto = totalElement ? totalElement.textContent.replace(/[^\d.]/g, '') : "0";

    const datosEnvio = {
        usuario: usuario,
        productos: miCarrito,
        total: parseFloat(totalTexto)
    };

    try {
        const response = await fetch(`${API_URL}/compras/facturar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosEnvio)
        });

        if (response.ok) {
            alert("✅ Compra guardada exitosamente en la base de datos.");
            // Limpiamos carrito
            carritos[usuario] = [];
            localStorage.setItem("carritos", JSON.stringify(carritos));
            window.location.href = 'cosmeticos.html';
        } else {
            const errorData = await response.json();
            alert("❌ Error: " + errorData.error);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("No se pudo conectar con el servidor.");
    }
}
// --- 7. UTILIDADES ---
function cambiarCantidad(index, cambio) {
    let carrito = obtenerCarrito();
    if (!carrito) return;
    
    carrito[index].cantidad += cambio;
    if (carrito[index].cantidad <= 0) carrito.splice(index, 1);
    
    guardarCarrito(carrito);
    actualizarCarrito();
}

function mostrarMensaje(texto) {
    let mensaje = document.createElement("div");
    mensaje.textContent = texto;
    mensaje.setAttribute("style", `
        position: fixed; bottom: 20px; right: 20px; background: #ff69b4; color: white; 
        padding: 10px 20px; border-radius: 5px; z-index: 2000; box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    `);
    document.body.appendChild(mensaje);
    setTimeout(() => mensaje.remove(), 2000);
}

