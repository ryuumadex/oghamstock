// Variables
const productoInput = document.getElementById('producto');
const cantidadInput = document.getElementById('cantidad');
const categoriaInput = document.getElementById('categoria');
const agregarBtn = document.getElementById('agregar-btn');
const inventarioList = document.getElementById('inventario-list');
const pedidoList = document.getElementById('pedido-list');
const enviarPedidoBtn = document.getElementById('enviar-pedido-btn');
const capturaContainer = document.getElementById('captura-container');
const contenidoGenerado = document.getElementById('contenido-generado');

// Datos de inventario y pedido
let inventario = [];
let pedido = [];

// Event Listeners
agregarBtn.addEventListener('click', agregarProducto);
enviarPedidoBtn.addEventListener('click', () => {
  enviarPedido();
  generarArchivoTexto();
  capturarPantalla();
});

// Función para agregar un producto al inventario
function agregarProducto() {
  // Obtener los valores de los inputs
  const producto = productoInput.value.trim();
  const cantidad = parseInt(cantidadInput.value);
  const categoria = categoriaInput.value.trim();

  // Validar que los campos no estén vacíos
  if (producto === '' || isNaN(cantidad) || categoria === '') {
    return;
  }

  // Crear un objeto nuevo producto
  const nuevoProducto = {
    nombre: producto,
    cantidad: cantidad,
    categoria: categoria,
    total: cantidad
  };

  // Agregar el nuevo producto al inventario
  inventario.push(nuevoProducto);

  // Ordenar y agrupar los productos por categoría
  agruparPorCategoria();

  // Mostrar el inventario actualizado
  mostrarInventario();

  // Limpiar los campos del formulario
  limpiarCampos();
}

// Función para mostrar el inventario
function mostrarInventario() {
  inventarioList.innerHTML = '';

  let categoriaActual = '';

  inventario.forEach((producto, index) => {
    if (producto.categoria !== categoriaActual) {
      categoriaActual = producto.categoria;

      const categoriaTitle = document.createElement('div');
      categoriaTitle.classList.add('categoria-title');
      categoriaTitle.textContent = categoriaActual;
      inventarioList.appendChild(categoriaTitle);
    }

    const listItem = document.createElement('li');
    listItem.classList.add('producto', producto.categoria);

    const nombre = document.createElement('div');
    nombre.classList.add('nombre');
    nombre.textContent = producto.nombre;
    listItem.appendChild(nombre);

    const cantidad = document.createElement('div');
    cantidad.classList.add('cantidad');
    cantidad.textContent = producto.cantidad + ' en stock';

    if (producto.cantidad < producto.total * 0.25) {
      cantidad.classList.add('bajo-stock');
      cantidad.innerHTML += '<span class="exclamacion">!</span>';
    }

    listItem.appendChild(cantidad);

    const acciones = document.createElement('div');
    acciones.classList.add('acciones');

    const restarInput = document.createElement('input');
    restarInput.type = 'number';
    restarInput.classList.add('restar-input');
    restarInput.min = 0;
    restarInput.max = producto.cantidad;
    restarInput.value = 0;
    acciones.appendChild(restarInput);

    const restarBtn = document.createElement('button');
    restarBtn.classList.add('restar-btn');
    restarBtn.textContent = '-';
    restarBtn.addEventListener('click', () => restarCantidad(index, parseInt(restarInput.value)));
    acciones.appendChild(restarBtn);

    const eliminarBtn = document.createElement('button');
    eliminarBtn.classList.add('eliminar-btn');
    eliminarBtn.textContent = 'Eliminar';
    eliminarBtn.addEventListener('click', () => eliminarProducto(index));
    acciones.appendChild(eliminarBtn);

    listItem.appendChild(acciones);

    inventarioList.appendChild(listItem);
  });
}

// Función para agrupar los productos por categoría
function agruparPorCategoria() {
  inventario.sort((a, b) => a.categoria.localeCompare(b.categoria));
}

// Función para limpiar los campos del formulario
function limpiarCampos() {
  productoInput.value = '';
  cantidadInput.value = '';
  categoriaInput.value = '';
}

// Función para restar la cantidad de un producto
function restarCantidad(index, cantidad) {
  if (cantidad <= 0) {
    return;
  }

  inventario[index].cantidad -= cantidad;
  mostrarInventario();
}

// Función para eliminar un producto del inventario
function eliminarProducto(index) {
  inventario.splice(index, 1);
  mostrarInventario();
}

// Función para enviar el pedido
function enviarPedido() {
  if (pedido.length === 0) {
    return;
  }

  // Generar y descargar el archivo de texto
  generarArchivoTexto();

  // Capturar la pantalla y generar la imagen
  capturarPantalla();

  pedido = [];
  pedidoList.innerHTML = '';
}

// Función para generar y descargar un archivo de texto con el contenido del pedido
function generarArchivoTexto() {
  // Crear un objeto para almacenar los productos agrupados por categoría
  const productosPorCategoria = {};

  inventario.forEach((producto) => {
    // Obtener la categoría del producto
    const categoria = producto.categoria;

    // Si la categoría no existe en el objeto, crear un nuevo arreglo para almacenar los productos
    if (!productosPorCategoria.hasOwnProperty(categoria)) {
      productosPorCategoria[categoria] = [];
    }

    // Agregar el producto al arreglo correspondiente a su categoría
    productosPorCategoria[categoria].push(producto);
  });

  // Generar el contenido del archivo de texto
  let contenidoPedido = 'Pedido:\n\n';

  // Recorrer las categorías y los productos dentro de cada categoría
  for (const categoria in productosPorCategoria) {
    if (productosPorCategoria.hasOwnProperty(categoria)) {
      contenidoPedido += `${categoria}:\n`;

      productosPorCategoria[categoria].forEach((producto) => {
        contenidoPedido += `- ${producto.nombre} - ${producto.cantidad}\n`;
      });

      contenidoPedido += '\n';
    }
  }

  // Generar y descargar el archivo de texto
  const blob = new Blob([contenidoPedido], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'pedido.txt';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Liberar el objeto URL
  URL.revokeObjectURL(url);
}

// Función para capturar la pantalla y generar la imagen
function capturarPantalla() {
  // Obtener el contenedor de la captura
  const capturaContainer = document.getElementById('captura-container');

  // Crear un elemento "canvas" del tamaño del contenedor
  const canvas = document.createElement('canvas');
  canvas.width = capturaContainer.offsetWidth;
  canvas.height = capturaContainer.offsetHeight;

  // Obtener el contexto del canvas
  const context = canvas.getContext('2d');

  // Dibujar el contenido del contenedor en el canvas
  context.drawWindow(window, 0, 0, canvas.width, canvas.height, 'rgb(255, 255, 255)');

  // Obtener la imagen codificada en Base64
  const imageData = canvas.toDataURL();

  // Crear un elemento de imagen y establecer la fuente como la imagen codificada
  const image = document.createElement('img');
  image.src = imageData;

  // Limpiar el contenedor de la captura
  capturaContainer.innerHTML = '';

  // Agregar la imagen al contenedor
  capturaContainer.appendChild(image);
}


