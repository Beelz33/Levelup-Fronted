import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Para los botones y la navegación
import { getProducts } from '../services/api'; // Importamos nuestra función de la API
import { useCart } from '../context/CartContext'; // Importamos el hook del carrito


/**
 * Formatea un número como moneda chilena (CLP).
 * @param {number | string} value - El valor numérico a formatear.
 * @returns {string} El valor formateado como string (ej: "$5.000").
 */
const formatCurrency = (value) => {
  const number = Number(value);

  // Si el valor no es un número válido, devuelve un precio por defecto.
  if (isNaN(number)) {
    return '$0';
  }

  // Usamos Intl.NumberFormat para un formato de moneda robusto y localizado.
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0, // No queremos decimales para CLP
  }).format(number);
};
/**
 * Componente de Tarjeta de Producto.
 * Muestra una tarjeta individual.
 */
function ProductoCard({ producto }) {
  // Hooks para la funcionalidad de compra y carrito
  const { addToCart, checkoutSingleItem } = useCart();
  const navigate = useNavigate();

  // Guardia: Si por alguna razón el producto es inválido, no renderiza nada.
  if (!producto) return null;

  // Prepara datos con valores por defecto por si faltan en la API/db.js
  const nombreProducto = producto.nombre || 'Producto sin nombre';
  const imagenProducto = producto.img || 'https://via.placeholder.com/300x200.png?text=No+Image';
  const precioProducto = formatCurrency(producto.precio);
  const descripcionCorta = producto.descripcion ? `${producto.descripcion.substring(0, 50)}...` : '';
  const categoriaNombre = producto.categoria ? producto.categoria : 'Sin categoría';

  // --- Handlers para los botones ---

  // Maneja el clic en "Agregar al carrito"
  const handleAddToCart = (e) => {
    e.stopPropagation(); // Evita que otros clics se activen
    addToCart(producto);
    alert(`"${nombreProducto}" ha sido agregado al carrito.`); // Feedback para el usuario
  };

  // Maneja el clic en "Comprar"
  const handleBuyNow = (e) => {
    e.stopPropagation();
    checkoutSingleItem(producto); // Prepara el carrito solo con este item
    navigate('/checkout');        // Y redirige inmediatamente al checkout
  };

  return (
    <div className="col-md-4 mb-4 product-card" data-category={producto.categoria}>
      <div className="card h-100 text-white">
        <span className="badge bg-info category-badge">{categoriaNombre}</span>
        <img src={imagenProducto} className="card-img-top product-image" alt={nombreProducto} />
        <div className="card-body">
          <h5>{nombreProducto}</h5>
          <p className="text-success">{precioProducto}</p>
          <p className="small product-description">{descripcionCorta}</p>

          {/* Contenedor de botones para alinearlos */}
          <div className="d-flex justify-content-start gap-2 mt-auto">
            {/* Enlace a detalles */}
            <Link to={`/productos/${producto.id}`} className="btn btn-primary btn-sm">
              Ver detalles
            </Link>
            {/* Botón para agregar al carrito */}
            <button onClick={handleAddToCart} className="btn btn-outline-success btn-sm">
              <i className="bi bi-cart-plus"></i> Agregar
            </button>
            {/* Botón de compra directa */}
            <button onClick={handleBuyNow} className="btn btn-success btn-sm">
              Comprar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


/**
 * Componente principal de la página Catálogo.
 * Carga y muestra la lista de productos.
 */
function Catalogo() {
  const [productos, setProductos] = useState([]); // Estado para guardar los productos
  const [loading, setLoading] = useState(true);  // Estado para indicar la carga
  const [error, setError] = useState('');      // Estado para guardar mensajes de error

  // useEffect se ejecuta una vez al montar el componente para cargar datos
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true); // Indica que la carga ha comenzado
        setError('');     // Limpia errores previos
        const data = await getProducts(); // Llama a la API para obtener productos

        // **Validación Clave**: Asegura que la respuesta sea un array
        if (Array.isArray(data)) {
          setProductos(data); // Guarda los productos en el estado si es un array
        } else {
          // Si la API no devuelve un array, maneja el caso inesperado
          console.error("Error: La API no devolvió un array de productos", data);
          setProductos([]); // Establece un array vacío para evitar errores de .map()
          setError('Error al cargar los productos: formato de datos incorrecto.');
        }
      } catch (err) {
        // Maneja errores de la llamada a la API
        console.error("Error al cargar productos:", err);
        setError('No se pudieron cargar los productos. Inténtalo de nuevo más tarde.');
        setProductos([]); // Asegura que productos sea un array vacío en caso de error
      } finally {
        setLoading(false); // Indica que la carga ha terminado (con éxito o error)
      }
    };

    fetchProducts(); // Ejecuta la función de carga
  }, []); // El array vacío [] asegura que se ejecute solo una vez al montar

  // --- Renderizado Condicional ---

  // Muestra indicador de carga mientras 'loading' es true
  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <h2 className="text-light">Cargando productos...</h2>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Muestra mensaje de error si 'error' tiene contenido
  if (error) {
     return <div className="container mt-5 alert alert-danger">{error}</div>;
  }

  // Si no está cargando y no hay error, muestra el catálogo
  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4 text-light">Catálogo de Productos</h1>

      <div className="row" id="productsContainer">
        {/* Muestra mensaje si el array 'productos' está vacío después de cargar */}
        {productos.length === 0 && (
           <div className="col-12">
            <p className="text-center text-light">No hay productos disponibles en este momento.</p>
          </div>
        )}

        {/* **Mapeo Seguro**: Ahora es seguro llamar a .map() porque 'productos' siempre es un array */}
        {productos.map((producto) => (
          // Renderiza una tarjeta por cada producto válido en el array
          <ProductoCard key={producto.id} producto={producto} />
        ))}
      </div>
    </div>
  );
}

export default Catalogo;