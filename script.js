
async function consultarBD() {
    try {
        const response = await fetch("./info.json")
        const productos = await response.json()
        principal(productos)
    } catch (error) {
        Toastify({
            text: "Algo salió mal: " + error.message,
            duration: 3000,
            newWindow: true,
            close: true,
            gravity: "bottom",
            position: "right",
            stopOnFocus: true,
            style: {
                background: "linear-gradient(to right, #ff5f6d, #ffc371)",
            },
        }).showToast();
    }
}

consultarBD()

function principal(productos) {
    crearTarjetasProductos(productos);
    crearFiltrosPorCategoria(productos);

    let carrito = obtenerCarrito();
    renderizarCarrito(carrito, productos);

    let input = document.getElementById("buscador");
    let botonBuscar = document.getElementById("buscar");

    botonBuscar.addEventListener("click", () => filtrarPorNombre(productos, input.value));
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            filtrarPorNombre(productos, input.value);
        }
    });

    let botonVerCarrito = document.getElementById("verCarrito");
    botonVerCarrito.addEventListener("click", verOcultar);

    let botonComprar = document.getElementById("comprar");
    botonComprar.addEventListener("click", finalizarCompra);
}

function finalizarCompra() {
    let carrito = obtenerCarrito();

    if (carrito.length === 0) {
        Swal.fire({
            icon: "error",
            title: "Su carrito está vacío",
            text: "Agregue productos para comprar",
            footer: ''
        });
    } else {
        Swal.fire({
            title: "¡Gracias por su compra!",
            text: "Recibirá un e-mail para proseguir con el pago",
            imageUrl: "./images/baner.jpg",
            imageWidth: 400,
            imageHeight: 200,
            imageAlt: "Custom image"
        });
        localStorage.removeItem("carrito");
        renderizarCarrito([]);
    }
}

function verOcultar(e) {
    let contenedorProductos = document.getElementById("paginaProductos");
    let contenedorCarrito = document.getElementById("paginaCarrito");

    contenedorCarrito.classList.toggle("oculto");
    contenedorProductos.classList.toggle("oculto");
}

function obtenerCarrito() {
    let carrito = [];
    if (localStorage.getItem("carrito")) {
        carrito = JSON.parse(localStorage.getItem("carrito"));
    }
    return carrito;
}

function setearCarrito(carrito) {
    let carritoJSON = JSON.stringify(carrito);
    localStorage.setItem("carrito", carritoJSON);
}

function filtrarPorNombre(productos, valorBusqueda) {
    let valorBusquedaLowerCase = valorBusqueda.toLowerCase();
    let productosFiltrados = productos.filter(producto => producto.nombre.toLowerCase().includes(valorBusquedaLowerCase));
    crearTarjetasProductos(productosFiltrados);
}

function crearTarjetasProductos(productos) {
    let contenedorProductos = document.getElementById("productos");
    contenedorProductos.innerHTML = "";
    productos.forEach(producto => {
        let tarjetaProducto = document.createElement("div");
        let claseProducto = "producto";

        tarjetaProducto.className = claseProducto;
        tarjetaProducto.innerHTML = `
            <h3>${producto.nombre}</h3>
            <p>$${producto.precio}</p>
            <p>Quedan ${producto.stock} unidades</p>
            <img src=./images/${producto.rutaImagen}>
            <button id="add-${producto.id}" class="${producto.stock === 0 ? 'sinStock' : ''}" ${producto.stock === 0 ? 'disabled' : ''}>Añadir al carrito</button>
        `;
        contenedorProductos.appendChild(tarjetaProducto);

        if (producto.stock > 0) {
            let botonAgregarAlCarrito = document.getElementById(`add-${producto.id}`);
            botonAgregarAlCarrito.addEventListener("click", (e) => agregarAlCarrito(e, productos));
        }
    });
}

function agregarAlCarrito(e, productos) {
    let carrito = obtenerCarrito();
    let idProducto = Number(e.target.id.split('-')[1]);
    let productoBuscado = productos.find(producto => producto.id === idProducto);
    let indiceProdCarrito = carrito.findIndex(producto => producto.id === idProducto);

    if (productoBuscado.stock > 0) {
        if (indiceProdCarrito != -1) {
            carrito[indiceProdCarrito].unidades++;
            carrito[indiceProdCarrito].subtotal = carrito[indiceProdCarrito].precioUnitario * carrito[indiceProdCarrito].unidades;
        } else {
            carrito.push({
                id: productoBuscado.id,
                nombre: productoBuscado.nombre,
                precioUnitario: productoBuscado.precio,
                unidades: 1,
                subtotal: productoBuscado.precio,
                rutaImagen: productoBuscado.rutaImagen
            });
        }
        productoBuscado.stock--;
        setearCarrito(carrito);
        renderizarCarrito(carrito, productos);
        crearTarjetasProductos(productos);
    }

    Toastify({
        text: productoBuscado.nombre + " se agregó al carrito",
        duration: 2000,
        newWindow: true,
        close: false,
        gravity: "bottom",
        position: "right",
        stopOnFocus: true,
        style: {
            background: "linear-gradient(to right, #c7eff0, #fdc4ec)",
        },
        className: "tostada-personalizada",
    }).showToast();
}

function renderizarCarrito(carrito, productos) {
    let contenedorCarrito = document.getElementById("contenedorCarrito");
    contenedorCarrito.innerHTML = "";
    let total = 0;
    carrito.forEach(({ nombre, precioUnitario, unidades, subtotal, id, rutaImagen }) => {
        total += subtotal;
        let tarjetaCarrito = document.createElement("div")
        tarjetaCarrito.className = "tarjetaCarrito"
        tarjetaCarrito.id = "tc" + id
        tarjetaCarrito.innerHTML += `
                <img class="imgCarrito" src="./images/${rutaImagen}">
                <p>${nombre}</p>
                <p>$ ${precioUnitario}</p>
                <p>${unidades} un.</p>
                <p>$ ${subtotal}</p>
                <div class="btnAccionCarrito">
                <button id=rs${id} class="btnResta">
                -
                </button>
                <button id=el${id} class="btnEliminar">
                Eliminar
                </button>
                <button id=sm${id} class="btnSuma">
                +
                </button></div>
        `;
        contenedorCarrito.appendChild(tarjetaCarrito)

        let btnEliminar = document.getElementById("el" + id)
        btnEliminar.addEventListener("click", (e) => eliminarProductoCarrito(e, productos))
        let btnSuma = document.getElementById("sm" + id);
        btnSuma.addEventListener("click", (e) => sumarUnidad(e, productos));
        let btnResta = document.getElementById("rs" + id)
        btnResta.addEventListener("click", (e) => restarUnidad(e, productos))
    });
    let divTotal = document.createElement("div")
    divTotal.innerHTML += `
        <div class="totalCarrito">
            <span>Total:</span>
            <span>$${total}</span>
        </div>
    `;
    contenedorCarrito.appendChild(divTotal)

}

function eliminarProductoCarrito(e, productos) {
    let id = Number(e.target.id.substring(2))
    let carrito = obtenerCarrito()
    let disponibilidad = carrito.find(producto => producto.id === id)
    let prodOriginal = productos.find(producto => producto.id === id)
    carrito = carrito.filter(producto => producto.id !== id)
    setearCarrito(carrito);
    let eliminarTarjeta = document.getElementById("tc" + id)
    eliminarTarjeta.remove()
    prodOriginal.stock += disponibilidad.unidades
    crearTarjetasProductos(productos);
}

function sumarUnidad(e, productos) {
    let id = Number(e.target.id.substring(2))
    let carrito = obtenerCarrito()
    let disponibilidad = carrito.find(producto => producto.id === id)
    let prodOriginal = productos.find(producto => producto.id === id)

    if (prodOriginal.stock > 0) {
        disponibilidad.unidades++;
        disponibilidad.subtotal = disponibilidad.unidades * disponibilidad.precioUnitario;
        prodOriginal.stock--;
        setearCarrito(carrito);
        renderizarCarrito(carrito, productos);
        crearTarjetasProductos(productos);
    }
}

function restarUnidad(e, productos) {
    let id = Number(e.target.id.substring(2));
    let carrito = obtenerCarrito();
    let disponibilidad = carrito.find(producto => producto.id === id);
    let prodOriginal = productos.find(producto => producto.id === id);

    if (disponibilidad.unidades > 1) {
        disponibilidad.unidades--;
        disponibilidad.subtotal = disponibilidad.unidades * disponibilidad.precioUnitario;
        prodOriginal.stock++;
        setearCarrito(carrito);
        renderizarCarrito(carrito, productos);
        crearTarjetasProductos(productos);
    }
}

function crearFiltrosPorCategoria(productos) {
    let categorias = [];
    let contenedorFiltros = document.getElementById("filtros");
    productos.forEach(producto => {
        if (!categorias.includes(producto.categoria)) {
            categorias.push(producto.categoria);

            let botonFiltro = document.createElement("button");
            botonFiltro.innerText = producto.categoria;
            botonFiltro.value = producto.categoria;

            botonFiltro.addEventListener("click", (e) => filtrarPorCategoria(e, productos));

            contenedorFiltros.appendChild(botonFiltro);
        }
    });

    let botonTodos = document.getElementById("todos");
    botonTodos.addEventListener("click", (e) => filtrarPorCategoria(e, productos));
}

function filtrarPorCategoria(e, productos) {
    let productosFiltrados = productos.filter(producto => producto.categoria.includes(e.target.value));
    crearTarjetasProductos(productosFiltrados);
}