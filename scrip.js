
// Mostrar registro

function mostrarRegistro() {
    document.getElementById("login").style.display = "none";
    document.getElementById("registro").style.display = "block";
}

// Mostrar login
function mostrarLogin() {
    document.getElementById("login").style.display = "block";
    document.getElementById("registro").style.display = "none";
}

// REGISTRAR USUARIO
async function registrar() {
    // 1. Obtener los valores de los inputs (asegúrate de que los IDs coincidan con tu HTML)
   const nombre = document.getElementById("nombre").value;
    const apellido = document.getElementById("apellido").value;
    const correo = document.getElementById("correo").value;
    const direccion = document.getElementById("direccion").value;
    const telefono = document.getElementById("numero").value;
    const contraseña = document.getElementById("contraseña").value; // En tu HTML el id es "numero"
    // 2. Validación básica
    if (!nombre || !apellido || !correo ||!contraseña) {
        alert("Por favor, completa los campos obligatorios (Nombre, Apellido , Correo y contraseña)");
        return;
    }

    try {
        // 3. Enviar la petición POST al servidor
        const response = await fetch('http://localhost:3000/usuarios', { // Ajusta la URL si es necesario
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre,
                apellido,
                correo,
                direccion,
                telefono,
                contraseña
            })
        });

        const data = await response.json();

        // 4. Manejar la respuesta
        if (response.ok) {
            alert("Cuenta creada con éxito 🎉");
            window.location.href = "login.html";
            
            //C:/Users/Jaens/OneDrive/Documentos/cosmeticos/cosmeticos.html
        } else {
            // Si el backend devuelve un error (ej. correo duplicado si tienes esa lógica)
            alert("Error al registrar: " + (data.error || "Error desconocido"));
        }

    } catch (error) {
        console.error("Error de red:", error);
        alert("No se pudo conectar con el servidor ❌");
    }
}
// LOGIN
async function iniciarSesion() {
    const usuario = document.getElementById("loginUser").value;
    const clave = document.getElementById("loginPass").value;

    if (!usuario || !clave) {
        alert("Por favor, llena todos los campos");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ 
                nombre: usuario, 
                contraseña: clave  // Enviamos con ñ
            })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("usuarioActivo", usuario);
            alert("¡Bienvenido/a!");
            window.location.href = "cosmeticos.html";
        } else {
            // Esto mostrará "Nombre o contraseña incorrectos" si falla
            alert(data.error || "Error al iniciar sesión");
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        alert("El servidor no responde. Revisa la consola.");
    }
}


// BOTÓN IR A TIENDA
function cerrarSesion() {
    window.location.href = "index.html";
}