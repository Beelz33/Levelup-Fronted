// src/services/api.js
const API_URL = "http://localhost:8080/api";

const getAuthHeaders = () => {
    const token = localStorage.getItem('tokenLevelUp');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

// ==========================================
// 📦 PRODUCTOS
// ==========================================
export const getProducts = async () => {
  try {
    const response = await fetch(`${API_URL}/productos`);
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getProductById = async (id) => {
    const response = await fetch(`${API_URL}/productos/${id}`);
    if (!response.ok) throw new Error("Producto no encontrado");
    return await response.json();
};

export const createProduct = async (productData) => {
    const response = await fetch(`${API_URL}/productos`, {
        method: 'POST',
        headers: getAuthHeaders(), // <--- AQUÍ AGREGAMOS EL TOKEN
        body: JSON.stringify(productData)
    });
    if (!response.ok) throw new Error("Error al crear producto (403/401)");
    return await response.json();
};

export const updateProduct = async (id, productData) => {
    const response = await fetch(`${API_URL}/productos/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(), // <--- AQUÍ TAMBIÉN
        body: JSON.stringify(productData)
    });
    return await response.json();
};

export const deleteProduct = async (id) => {
    await fetch(`${API_URL}/productos/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders() // <--- Y AQUÍ
    });
};

// Función auxiliar para categorías (hardcodeada por simplicidad o puedes crear un endpoint)
export const getCategories = async () => {
    return [
        { id: 'consolas', name: 'Consolas' },
        { id: 'videojuegos', name: 'Videojuegos' },
        { id: 'accesorios', name: 'Accesorios' },
        { id: 'sillas', name: 'Sillas Gamer' }
    ];
};

// ==========================================
// 🛒 ÓRDENES
// ==========================================
export const getOrders = async () => {
    const response = await fetch(`${API_URL}/ordenes`, {
        headers: getAuthHeaders()
    });
    return await response.json();
};

export const createOrder = async (orderData) => {
    const response = await fetch(`${API_URL}/ordenes`, {
        method: 'POST',
        headers: getAuthHeaders(), // Importante para asociar la compra al usuario
        body: JSON.stringify(orderData)
    });
    return await response.json();
};

// Para el Admin Dashboard
export const getOrderById = async (id) => {
    const response = await fetch(`${API_URL}/ordenes/${id}`, {
        headers: getAuthHeaders() // Importante: enviamos el token
    });
    if (!response.ok) throw new Error("Orden no encontrada");
    return await response.json();
};

export const getOrdersByUserId = async (userId) => {
    const response = await fetch(`${API_URL}/ordenes/usuario/${userId}`, {
        headers: getAuthHeaders()
    });
    return await response.json();
};

// ==========================================
// 👥 USUARIOS (AUTH Y ADMIN)
// ==========================================
export const loginUser = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    if (!response.ok) throw new Error("Credenciales inválidas");
    return await response.json(); 
};

export const registerUser = async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    return await response.json();
};
// Funciones CRUD de Admin Usuarios
export const getUsers = async () => {
    const response = await fetch(`${API_URL}/usuarios`, {
        headers: getAuthHeaders()
    });
    return await response.json();
};
 

export const getUserById = async (id) => {
    const response = await fetch(`${API_URL}/usuarios/${id}`, {
        headers: getAuthHeaders()
    });
    return await response.json();
};

export const createUser = async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, // Registro suele ser público
        body: JSON.stringify(userData)
    });
    return await response.json();
};

export const updateUser = async (id, userData) => {
    const response = await fetch(`${API_URL}/usuarios/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
    });

    // Si la respuesta no fue exitosa, lanzamos un error.
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al actualizar el perfil.' }));
        throw new Error(errorData.message);
    }

    // Si la respuesta fue exitosa (2xx), no intentamos leer el cuerpo JSON.
    // Simplemente devolvemos los mismos datos que enviamos, asumiendo que se guardaron bien.
    return userData;
};

export const deleteUser = async (id) => {
    await fetch(`${API_URL}/usuarios/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
    });
};