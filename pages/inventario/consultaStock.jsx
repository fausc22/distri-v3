import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Head from 'next/head';
import useAuth from '../../hooks/useAuth';
import { axiosAuth } from '../../utils/apiClient';

// Componente del modal de edición
function ModalEditarProducto({ producto, isOpen, onClose, onProductoActualizado, categorias }) {
  const [formData, setFormData] = useState({
    nombre: '',
    categoria_id: '',
    stock_actual: ''
  });
  const [loading, setLoading] = useState(false);

  // Llenar formulario cuando se selecciona un producto
  useEffect(() => {
    if (producto) {
      setFormData({
        nombre: producto.nombre || '',
        categoria_id: producto.categoria_id || '',
        stock_actual: producto.stock_actual || ''
      });
    }
  }, [producto]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    if (!formData.categoria_id) {
      toast.error('La categoría es obligatoria');
      return;
    }

    if (formData.stock_actual === '' || isNaN(formData.stock_actual)) {
      toast.error('El stock debe ser un número válido');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosAuth.put(`/productos/actualizar-producto-basico/${producto.id}`, {
        ...formData,
        stock_actual: parseFloat(formData.stock_actual)
      });
      
      if (response.data.success) {
        toast.success('Producto actualizado correctamente');
        onProductoActualizado(); // Recargar la tabla
        onClose(); // Cerrar modal
      }
    } catch (error) {
      console.error('Error actualizando producto:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar producto');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Editar Producto: {producto?.nombre}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            disabled={loading}
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={loading}
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría *
            </label>
            <select
              name="categoria_id"
              value={formData.categoria_id}
              onChange={handleInputChange}
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={loading}
            >
              <option value="">Seleccionar categoría</option>
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Actual */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Actual *
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const newValue = Math.max(0, parseFloat(formData.stock_actual || 0) - 0.5);
                  setFormData(prev => ({ ...prev, stock_actual: newValue.toString() }));
                }}
                className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-300"
                disabled={loading || parseFloat(formData.stock_actual || 0) <= 0}
              >
                -0.5
              </button>
              <input
                type="number"
                name="stock_actual"
                value={formData.stock_actual}
                onChange={handleInputChange}
                className="flex-1 p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                min="0"
                step="0.5"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => {
                  const newValue = parseFloat(formData.stock_actual || 0) + 0.5;
                  setFormData(prev => ({ ...prev, stock_actual: newValue.toString() }));
                }}
                className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300"
                disabled={loading}
              >
                +0.5
              </button>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={handleSubmit}
              className={`px-6 py-2 text-white rounded-md ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              disabled={loading}
            >
              {loading ? 'Actualizando...' : 'Actualizar Producto'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente principal
export default function GestionProductos() {
  useAuth();

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Cargar todos los productos
  const cargarProductos = async () => {
    setLoading(true);
    try {
      const response = await axiosAuth.get(`/productos/obtener-todos-productos?search=${searchTerm}`);
      if (response.data.success) {
        setProductos(response.data.data);
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  // Cargar categorías
  const cargarCategorias = async () => {
    try {
      const response = await axiosAuth.get('/productos/categorias');
      if (response.data.success) {
        setCategorias(response.data.data);
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
      toast.error('Error al cargar categorías');
    }
  };

  useEffect(() => {
    cargarProductos();
    cargarCategorias();
  }, []);

  // Recargar productos cuando cambie el término de búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      cargarProductos();
      setCurrentPage(1); // Resetear a la primera página
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Filtrar productos localmente para la paginación
  const productosFiltrados = productos.filter(producto =>
    producto.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producto.categoria_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const productosPaginados = productosFiltrados.slice(startIndex, startIndex + itemsPerPage);

  const handleEditarProducto = (producto) => {
    setProductoSeleccionado(producto);
    setModalAbierto(true);
  };

  const handleProductoActualizado = () => {
    cargarProductos(); // Recargar la tabla
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const getStockColor = (stock) => {
    if (stock === 0) return 'bg-red-100 text-red-800';
    if (stock <= 5) return 'bg-orange-100 text-orange-800';
    if (stock <= 20) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStockText = (stock) => {
    if (stock === 0) return 'Sin stock';
    if (stock <= 5) return 'Stock crítico';
    if (stock <= 20) return 'Stock bajo';
    return 'Stock normal';
  };

  const formatearStock = (stock) => {
    const numero = parseFloat(stock || 0);
    // Si es entero, mostrar sin decimales
    if (numero % 1 === 0) {
      return numero.toString();
    }
    // Si tiene decimales, mostrar con 1 decimal
    return numero.toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>VERTIMAR | Consulta de Stock </title>
        <meta name="description" content="Administrar todos los productos de VERTIMAR" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Consulta de Stock
          </h1>
          
          {/* Barra de búsqueda */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full">
              <input
                type="text"
                placeholder="Buscar por nombre o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
                
                {searchTerm && (
                    <button
                    onClick={() => setSearchTerm('')}
                    className="px-3 py-1 text-xs bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                    >
                    LIMPIAR
                    </button>
                )}
                </div>
          </div>
        </div>

        {/* Tabla de productos */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Vista desktop */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Actual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productosPaginados.map((producto) => (
                  <tr key={producto.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {producto.nombre || '-'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {producto.unidad_medida || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {producto.categoria_nombre || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${
                        producto.stock_actual === 0 ? 'text-red-600' : 
                        producto.stock_actual <= 5 ? 'text-orange-600' : 
                        'text-gray-900'
                      }`}>
                        {formatearStock(producto.stock_actual)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockColor(producto.stock_actual)}`}>
                        {getStockText(producto.stock_actual)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${parseFloat(producto.precio).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditarProducto(producto)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vista móvil */}
          <div className="lg:hidden">
            {productosPaginados.map((producto) => (
              <div key={producto.id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {producto.nombre || '-'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {producto.categoria_nombre || '-'} • {producto.unidad_medida || '-'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleEditarProducto(producto)}
                    className="ml-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex-shrink-0"
                  >
                    Editar
                  </button>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Stock</p>
                      <span className={`text-sm font-bold ${
                        producto.stock_actual === 0 ? 'text-red-600' : 
                        producto.stock_actual <= 5 ? 'text-orange-600' : 
                        'text-gray-900'
                      }`}>
                        {formatearStock(producto.stock_actual)}
                      </span>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Precio</p>
                      <span className="text-sm font-medium text-gray-900">
                        ${parseFloat(producto.precio).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStockColor(producto.stock_actual)}`}>
                    {getStockText(producto.stock_actual)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-4 sm:px-6 py-3 border-t border-gray-200">
              {/* Vista móvil de paginación */}
              <div className="flex flex-col sm:hidden space-y-3">
                <p className="text-sm text-gray-700 text-center">
                  Página {currentPage} de {totalPages}
                </p>
                <p className="text-xs text-gray-500 text-center">
                  {startIndex + 1} a {Math.min(startIndex + itemsPerPage, productosFiltrados.length)} de {productosFiltrados.length} productos
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex-1 max-w-[120px] px-4 py-3 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    ← Anterior
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex-1 max-w-[120px] px-4 py-3 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
              
              {/* Vista desktop de paginación */}
              <div className="hidden sm:flex sm:flex-1 sm:justify-between sm:items-center">
                <p className="text-sm text-gray-700">
                  Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, productosFiltrados.length)} de {productosFiltrados.length} productos
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Anterior
                  </button>
                  <span className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md">
                    {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de edición */}
      <ModalEditarProducto
        producto={productoSeleccionado}
        categorias={categorias}
        isOpen={modalAbierto}
        onClose={() => {
          setModalAbierto(false);
          setProductoSeleccionado(null);
        }}
        onProductoActualizado={handleProductoActualizado}
      />
    </div>
  );
}