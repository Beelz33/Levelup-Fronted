import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
// Importamos el contexto para saber QUIÉN compra (necesitamos su ID para la BD)
import { useAuth } from '../context/AuthContext';
// Importamos la función real que habla con el Backend
import { createOrder } from '../services/api';

function Checkout() {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth(); // Obtenemos el usuario real
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    correo: '',
    calle: '',
    departamento: '',
    region: 'Región Metropolitana de Santiago',
    comuna: 'Cerrillos'
  });

  const [isProcessing, setIsProcessing] = useState(false);

  // Rellenar datos automáticamente si el usuario está logueado
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        nombre: user.nombre || '',
        apellidos: user.apellido || '', 
        correo: user.email || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevData => ({ ...prevData, [id]: value }));
  };

  const totalGeneral = cartItems.reduce((sum, item) => sum + (item.precio * item.qty), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Validación: MySQL necesita un ID de usuario obligatoriamente
      const usuarioId = user ? user.id : null; 

      if (!usuarioId) {
        alert("Debes iniciar sesión para completar la compra.");
        setIsProcessing(false);
        navigate('/logueo'); // O la ruta que uses para login
        return;
      }

      // Preparamos el paquete de datos para Spring Boot
      const ordenData = {
        usuario: { id: usuarioId }, // Referencia al usuario
        total: totalGeneral,
        estado: "Pagado", // Estado inicial
        calle: formData.calle,
        departamento: formData.departamento,
        region: formData.region,
        comuna: formData.comuna,
        // Transformamos los items del carrito al formato de Java
        items: cartItems.map(item => ({
          producto: { id: item.id },
          cantidad: item.qty,
          precioUnitario: item.precio
        }))
      };

      console.log("Enviando orden...", ordenData);

      // ¡AQUÍ OCURRE EL GUARDADO EN BD! 💾
      await createOrder(ordenData);

      // Si todo sale bien:
      clearCart();
      navigate('/compra-exitosa');

    } catch (error) {
      console.error("Error al guardar orden:", error);
      alert("Hubo un error al procesar tu compra. Intenta nuevamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mt-5" style={{maxWidth: '800px', color: '#fff'}}>
      <h1 className="text-center mb-4">Finalizar Compra</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="card perfil-card p-4">
          <h4 style={{color: 'var(--color-azul-oscuro, #39FF14)'}}>Información del cliente</h4>
          
          {!user && (
            <div className="alert alert-warning">
              ⚠️ Debes iniciar sesión para que la compra quede registrada a tu nombre.
            </div>
          )}

          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="nombre" className="form-label">Nombre</label>
              <input type="text" className="form-control perfil-input" id="nombre" value={formData.nombre} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label htmlFor="apellidos" className="form-label">Apellidos</label>
              <input type="text" className="form-control perfil-input" id="apellidos" value={formData.apellidos} onChange={handleChange} required />
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="correo" className="form-label">Correo electrónico</label>
            <input type="email" className="form-control perfil-input" id="correo" value={formData.correo} onChange={handleChange} required />
          </div>

          <h4 className="mt-4" style={{color: 'var(--color-azul-oscuro, #39FF14)'}}>Dirección de entrega</h4>
          <div className="mb-3">
            <label htmlFor="calle" className="form-label">Calle</label>
            <input type="text" className="form-control perfil-input" id="calle" value={formData.calle} onChange={handleChange} required />
          </div>
          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="departamento" className="form-label">Departamento (opcional)</label>
              <input type="text" className="form-control perfil-input" id="departamento" value={formData.departamento} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label htmlFor="region" className="form-label">Región</label>
              <select className="form-select perfil-input" id="region" value={formData.region} onChange={handleChange}>
                <option>Región Metropolitana de Santiago</option>
              </select>
            </div>
          </div>
           <div className="mb-3">
              <label htmlFor="comuna" className="form-label">Comuna</label>
              <select className="form-select perfil-input" id="comuna" value={formData.comuna} onChange={handleChange}>
                <option>Cerrillos</option>
                <option>Maipú</option>
                <option>Pudahuel</option>
              </select>
            </div>
        </div>

        <div className="text-center bg-dark p-3 my-4 d-flex justify-content-between align-items-center rounded">
          <h3 className="mb-0">Total a pagar: ${totalGeneral.toLocaleString('es-CL')}</h3>
          <button type="submit" className="btn btn-success btn-lg" disabled={isProcessing}>
            {isProcessing ? 'Procesando...' : 'Pagar ahora'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Checkout;