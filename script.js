let listaProductos = [
    { id: 1001, nombre: "Lemon Pie", categoria: "Pies", precio: 5000, stock: 7, rutaImagen: "lemon-pie.png" },
    { id: 1002, nombre: "Strawberry Pie", categoria: "Pies", precio: 6000, stock: 6, rutaImagen: "Strawberry-Pie.png" },
    { id: 2001, nombre: "Sacher Cake", categoria: "Cakes", precio: 9000, stock: 9, rutaImagen: "Sacher-Cake.png" },
    { id: 2002, nombre: "Apple Cake", categoria: "Cakes", precio: 8000, stock: 5, rutaImagen: "Apple-Cake.png" },
    { id: 2003, nombre: "Chees Cake", categoria: "Cakes", precio: 7500, stock: 8, rutaImagen: "Chees-Cake.png" },
    { id: 3001, nombre: "Macarons", categoria: "Macarons", precio: 500, stock: 45, rutaImagen: "Macarons.png" },
    { id: 2004, nombre: "Birtday Cake", categoria: "Cakes", precio: 7000, stock: 11, rutaImagen: "birthday-cake.png" },
    { id: 2005, nombre: "Oreo Cake", categoria: "Cakes", precio: 10000, stock: 4, rutaImagen: "oreo-cake.png" },
    { id: 1003, nombre: "Walnut Pie", categoria: "Pies", precio: 4500, stock: 10, rutaImagen: "walnut-pie.png" }
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
    localStorage.removeItem("carrito");
    renderizarCarrito([]);
    alert("GRACIAS POR SU COMPRA");
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
            <button id="add-${producto.id}" ${producto.stock === 0 ? 'disabled' : ''}>Añadir al carrito</button>
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
    } else {
        alert("No hay suficiente stock disponible");
    }
}

function renderizarCarrito(carrito) {
    let contenedorCarrito = document.getElementById("contenedorCarrito");
    contenedorCarrito.innerHTML = `
        <div class="headerCarrito">
            <span>Producto</span>
            <span>Precio</span>
            <span>Cantidad</span>
            <span>Subtotal</span>
        </div>
    `;

    let total = 0;
    carrito.forEach(producto => {
        total += producto.subtotal;
        contenedorCarrito.innerHTML += `
            <div class="tarjetaCarrito">
                <span>${producto.nombre}</span>
                <span>${producto.precioUnitario}</span>
                <span>${producto.unidades}</span>
                <span>${producto.subtotal}</span>
            </div>
        `;
    });

    contenedorCarrito.innerHTML += `
        <div class="totalCarrito">
            <span>Total:</span>
            <span>${total}</span>
        </div>
    `;
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