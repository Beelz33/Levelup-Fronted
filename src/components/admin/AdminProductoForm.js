import React, { useState, useEffect } from 'react';
import { getCategories } from '../../services/api'; 

function AdminProductoForm({ initialData = {}, onSubmit, isEditing = false }) {
  
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    categoria: '',
    stock: '',
    img: '',
    descripcion: '',
    fabricante: '',
    procedencia: '',
    distribuidor: '',
    garantia: '',
    autenticidad: '',
    ...initialData
  });
  
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // --- AQUÍ ESTÁ LA CORRECCIÓN ---
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Preparamos los datos convirtiendo los números explícitamente
    const dataToSend = {
        ...formData,
        // ParseInt convierte "5000" a 5000 (número real)
        precio: parseInt(formData.precio, 10), 
        stock: parseInt(formData.stock, 10)
    };

    onSubmit(dataToSend); 
  };
  // -------------------------------

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        {/* Columna 1 */}
        <div className="col-md-6">
          <div className="mb-3">
            <label htmlFor="nombre" className="form-label">Nombre</label>
            <input type="text" className="form-control" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label htmlFor="precio" className="form-label">Precio (CLP)</label>
            <input type="number" className="form-control" id="precio" name="precio" value={formData.precio} onChange={handleChange} required step="10" />
          </div>
          <div className="mb-3">
            <label htmlFor="categoria" className="form-label">Categoría</label>
            <select className="form-select" id="categoria" name="categoria" value={formData.categoria} onChange={handleChange} required disabled={loadingCategories}>
              <option value="">{loadingCategories ? 'Cargando...' : 'Selecciona categoría'}</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="stock" className="form-label">Stock</label>
            <input type="number" className="form-control" id="stock" name="stock" value={formData.stock} onChange={handleChange} required min="0" />
          </div>
          <div className="mb-3">
            <label htmlFor="img" className="form-label">URL de la Imagen</label>
            <input type="url" className="form-control" id="img" name="img" value={formData.img} onChange={handleChange} required />
            {formData.img && <img src={formData.img} alt="Preview" style={{maxWidth: '100px', marginTop: '10px'}} />}
          </div>
          <div className="mb-3">
            <label htmlFor="descripcion" className="form-label">Descripción</label>
            <textarea className="form-control" id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleChange} rows="3" required></textarea>
          </div>
        </div>
        {/* Columna 2 */}
        <div className="col-md-6">
          <div className="mb-3">
            <label htmlFor="fabricante" className="form-label">Fabricante</label>
            <input type="text" className="form-control" id="fabricante" name="fabricante" value={formData.fabricante} onChange={handleChange} />
          </div>
          <div className="mb-3">
            <label htmlFor="procedencia" className="form-label">Procedencia</label>
            <input type="text" className="form-control" id="procedencia" name="procedencia" value={formData.procedencia} onChange={handleChange} />
          </div>
          <div className="mb-3">
            <label htmlFor="distribuidor" className="form-label">Distribuidor</label>
            <input type="text" className="form-control" id="distribuidor" name="distribuidor" value={formData.distribuidor} onChange={handleChange} />
          </div>
          <div className="mb-3">
            <label htmlFor="garantia" className="form-label">Garantía</label>
            <input type="text" className="form-control" id="garantia" name="garantia" value={formData.garantia} onChange={handleChange} />
          </div>
          <div className="mb-3">
            <label htmlFor="autenticidad" className="form-label">Autenticidad</label>
            <input type="text" className="form-control" id="autenticidad" name="autenticidad" value={formData.autenticidad} onChange={handleChange} />
          </div>
        </div>
      </div>
      
      <button type="submit" className="btn btn-primary">
        {isEditing ? 'Guardar Cambios' : 'Crear Producto'}
      </button>
    </form>
  );
}

export default AdminProductoForm;