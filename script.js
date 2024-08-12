let listaProductos = [
    { id: 1001, nombre: "Lemon Pie", categoria: "Pies", precio: 5000, stock: 7, rutaImagen: "lemon-pie.png" },
    { id: 1002, nombre: "Strawberry Pie", categoria: "Pies", precio: 6000, stock: 6, rutaImagen: "Strawberry-Pie.png" },
    { id: 2001, nombre: "Sacher Cake", categoria: "Cakes", precio: 9000, stock: 9, rutaImagen: "Sacher-Cake.png" },
    { id: 2002, nombre: "Apple Cake", categoria: "Cakes", precio: 8000, stock: 5, rutaImagen: "Apple-Cake.png" },
    { id: 2003, nombre: "Chees Cake", categoria: "Cakes", precio: 7500, stock: 8, rutaImagen: "Chees-Cake.png" },
    { id: 3001, nombre: "Macarons", categoria: "Macarons", precio: 500, stock: 45, rutaImagen: "Macarons.png" },
    { id: 2004, nombre: "Birtday Cake", categoria: "Cakes", precio: 7000, stock: 11, rutaImagen: "birthday-cake.png" },
    { id: 2005, nombre: "Oreo Cake", categoria: "Cakes", precio: 10000, stock: 4, rutaImagen: "oreo-cake.png" },
    { id: 1003, nombre: "Walnut Pie", categoria: "Pies", precio: 4500, stock: 10, rutaImagen: "walnut-pie.png" },
    { id: 4001, nombre: "Lingote Limon", categoria: "Lingotes", precio: 900, stock: 30, rutaImagen: "lingote-limon.png" },
    { id: 4002, nombre: "Lingote Frambuesa", categoria: "Lingotes", precio: 900, stock: 40, rutaImagen: "lingote-frambuesa.png" },
    { id: 4003, nombre: "Lingote Brownie", categoria: "Lingotes", precio: 900, stock: 25, rutaImagen: "lingote-brownie.png" },
]

function principal(productos) {
    crearTarjetasProductos(productos);
    crearFiltrosPorCategoria(productos);

    let carrito = obtenerCarrito();
    renderizarCarrito(carrito);

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

principal(listaProductos);

function finalizarCompra() {
    // Obtener el carrito usando la función obtenerCarrito
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
        // Limpiar el carrito después de la compra
        localStorage.removeItem("carrito");
        renderizarCarrito([]);  // Refrescar la visualización del carrito vacío
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
                subtotal: productoBuscado.precio
            });
        }
        productoBuscado.stock--; // Disminuye el stock
        setearCarrito(carrito);
        renderizarCarrito(carrito);
        crearTarjetasProductos(productos); // Actualiza la visualización de productos
    }

    Toastify({
        text: productoBuscado.nombre + " se agregó al carrito",
        duration: 2000,
        newWindow: true,
        close: false,
        gravity: "bottom", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            background: "linear-gradient(to right, #c7eff0, #fdc4ec)",
        },
        className: "tostada-personalizada",
    }).showToast();
}


function renderizarCarrito(carrito) {
    let contenedorCarrito = document.getElementById("contenedorCarrito");
    contenedorCarrito.innerHTML = `
        <div class="headerCarrito">
            <span>Producto</span>
            <span>Precio</span>
            <span>Cantidad</span>
            <span>Subtotal</span>
            <span>Acciones</span>
        </div>
    `;

    let total = 0;
    carrito.forEach(producto => {
        total += producto.subtotal;
        let tarjetaCarrito = document.createElement("div");
        tarjetaCarrito.className = "tarjetaCarrito";

        tarjetaCarrito.innerHTML = `
            <span>${producto.nombre}</span>
            <span>$${producto.precioUnitario}</span>
            <span>${producto.unidades}</span>
            <span>$${producto.subtotal}</span>
            <span>
                <button class="disminuirUnidad" data-id="${producto.id}">
                    <img src="./images/menos.png" alt="disminuir" style="width: 20px; height: 20px;">
                </button>
                <button class="incrementarUnidad" data-id="${producto.id}">
                    <img src="./images/aumentar.png" alt="aumentar" style="width: 20px; height: 20px;">
                </button>
                <button id="be${producto.id}" class="eliminarProducto">
                    <img src="./images/eliminar.png" alt="Eliminar" style="width: 20px; height: 20px;">
                </button>
            </span>
        `;
        contenedorCarrito.appendChild(tarjetaCarrito);
    });

    contenedorCarrito.innerHTML += `
        <div class="totalCarrito">
            <span>Total:</span>
            <span>$${total}</span>
        </div>
    `;

    // Agregar event listeners para los botones de disminuir, incrementar y eliminar
    document.querySelectorAll('.disminuirUnidad').forEach(boton => {
        boton.addEventListener('click', disminuirUnidad);
    });

    document.querySelectorAll('.incrementarUnidad').forEach(boton => {
        boton.addEventListener('click', incrementarUnidad);
    });

    document.querySelectorAll('.eliminarProducto').forEach(boton => {
        boton.addEventListener('click', eliminarProductoDelCarrito);
    });
}

function eliminarProductoDelCarrito(e) {
    let id = Number(e.target.id.substring(2)); // Extraer el ID del producto
    let carrito = obtenerCarrito();
    let productoEliminado = carrito.find(producto => producto.id === id);

    // Actualizar el stock del producto eliminado
    listaProductos.find(producto => producto.id === id).stock += productoEliminado.unidades;

    carrito = carrito.filter(producto => producto.id !== id);
    setearCarrito(carrito);
    renderizarCarrito(carrito);
    crearTarjetasProductos(listaProductos); // Actualizar la lista de productos después de eliminar
}

function disminuirUnidad(e) {
    let id = Number(e.target.dataset.id);
    let carrito = obtenerCarrito();
    let productoCarrito = carrito.find(producto => producto.id === id);

    if (productoCarrito.unidades > 1) {
        productoCarrito.unidades--;
        productoCarrito.subtotal = productoCarrito.unidades * productoCarrito.precioUnitario;
        listaProductos.find(producto => producto.id === id).stock++; // Aumentar el stock del producto en la lista original
        setearCarrito(carrito);
        renderizarCarrito(carrito);
        crearTarjetasProductos(listaProductos); // Actualiza la visualización de productos
    } else {
        eliminarProductoDelCarrito(e); // Eliminar el producto si la cantidad llega a 0
    }
}

function incrementarUnidad(e) {
    let id = Number(e.target.dataset.id);
    let carrito = obtenerCarrito();
    let productoCarrito = carrito.find(producto => producto.id === id);
    let productoOriginal = listaProductos.find(producto => producto.id === id);

    if (productoOriginal.stock > 0) {
        productoCarrito.unidades++;
        productoCarrito.subtotal = productoCarrito.unidades * productoCarrito.precioUnitario;
        productoOriginal.stock--; // Disminuir el stock del producto en la lista original
        setearCarrito(carrito);
        renderizarCarrito(carrito);
        crearTarjetasProductos(listaProductos); // Actualiza la visualización de productos
    } else {
        Toastify({
            text: "No hay más unidades disponibles",
            duration: 2000,
            newWindow: true,
            close: false,
            gravity: "bottom", 
            position: "right", 
            stopOnFocus: true, 
            style: {
                background: "linear-gradient(to right, #ff5f6d, #ffc371)",
            },
        }).showToast();
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