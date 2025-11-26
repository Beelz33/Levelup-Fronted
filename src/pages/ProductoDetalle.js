import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById } from '../services/api';
import { useCart } from '../context/CartContext';

/**
 * Formatea un número como moneda chilena (CLP).
 * @param {number | string} value - El valor numérico a formatear.
 * @returns {string} El valor formateado como string (ej: "$5.000").
 */
const formatCurrency = (value) => {
  const number = Number(value);
  if (isNaN(number)) {
    return '$0';
  }
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(number);
};

function ProductoDetalle() {
  
  const { id } = useParams(); 
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true); // Empezamos en 'true'
  const [activeTab, setActiveTab] = useState('descripcion'); // Estado para las pestañas

  // Hooks para navegación y carrito
  const { addToCart, checkoutSingleItem, restoreCart } = useCart();
  const navigate = useNavigate();


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true); // Ponemos 'loading' en true al empezar a buscar
        const data = await getProductById(id);
        setProducto(data);
      } catch (error) {
        console.error("Error al cargar el producto:", error);
        setProducto(null); 
      } finally {
        setLoading(false); // Quitamos 'loading' al terminar (con éxito o error)
      }
    };

    fetchProduct();
  }, [id]); 

  // GUARDIA 1: Estado de Carga
  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <h2 className="text-light">Cargando producto...</h2>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // GUARDIA 2: Estado de Producto No Encontrado
  if (!producto) {
    return (
      <div className="container mt-5 text-center alert alert-danger">
        <h2>Producto no encontrado</h2>
        <p>El producto que buscas no existe o no se pudo cargar.</p>
        <Link to="/catalogo" className="btn btn-primary">Volver al Catálogo</Link>
      </div>
    );
  }

  // --- Handlers para los botones ---
  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(producto);
    alert('¡Producto agregado al carrito!');
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    checkoutSingleItem(producto);
    navigate('/checkout');
  };

  // Al volver al catálogo, restauramos el carrito por si veníamos de un "Comprar Ahora"
  const handleContinueShopping = () => {
    restoreCart();
    navigate('/catalogo');
  };

  // Preparamos los datos del producto para mostrarlos
  const { nombre, img, descripcion, fabricante, procedencia, distribuidor, garantia, autenticidad, stock } = producto;
  const precioFormateado = formatCurrency(producto.precio);

  return (
    <div className="container mt-4" id="productoDetalle">
      <div className="row">
        {/* Columna de la Imagen */}
        <div className="col-md-6">
          <img src={img} className="img-fluid rounded shadow-lg" alt={nombre} />
        </div>

        {/* Columna de la Información */}
        <div className="col-md-6 text-light">
          <div className="p-4 rounded bg-dark">
            {/* Título y Precio */}
            <h2>{nombre}</h2> 
            <p className="text-success fs-3 fw-bold">{precioFormateado}</p>
            <p><strong>Stock disponible:</strong> {stock}</p>
            <hr />

            {/* Botones de Acción */}
            <div className="d-flex gap-2 mb-4">
              <button onClick={handleBuyNow} className="btn btn-success flex-grow-1">
                <i className="bi bi-bag-check-fill me-2"></i>Comprar Ahora
              </button>
              <button onClick={handleAddToCart} className="btn btn-outline-success">
                <i className="bi bi-cart-plus"></i>
              </button>
            </div>
            <button onClick={handleContinueShopping} className="btn btn-outline-light w-100">
              <i className="bi bi-arrow-left me-2"></i>Seguir comprando
            </button>
          </div>
        </div>
      </div>
      
      {/* Pestañas con Información Adicional */}
      <div className="mt-5 text-light">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'descripcion' ? 'active bg-dark text-light' : 'text-secondary'}`} onClick={() => setActiveTab('descripcion')}>
              Descripción
            </button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'detalles' ? 'active bg-dark text-light' : 'text-secondary'}`} onClick={() => setActiveTab('detalles')}>
              Detalles y Garantía
            </button>
          </li>
        </ul>

        <div className="tab-content p-4 bg-dark rounded-bottom">
          {/* Contenido de la pestaña Descripción */}
          {activeTab === 'descripcion' && (
            <div id="descripcion">
              <p>{descripcion}</p>
            </div>
          )}

          {/* Contenido de la pestaña Detalles */}
          {activeTab === 'detalles' && (
            <div id="detalles">
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Fabricante:</strong> {fabricante}</p>
                  <p><strong>Procedencia:</strong> {procedencia}</p>
                  <p><strong>Distribuidor:</strong> {distribuidor}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Garantía:</strong> {garantia}</p>
                  <p><strong>Autenticidad:</strong> {autenticidad}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductoDetalle;