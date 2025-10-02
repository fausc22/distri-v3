// pages/empleados.jsx
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Head from 'next/head';
import useAuth from '../../hooks/useAuth';
import { useEmpleados } from '../../hooks/useEmpleados';
import SearchBar from '../../components/common/SearchBar';
import TableHeader from '../../components/common/TableHeader';
import Pagination from '../../components/common/Pagination';
import ModalEmpleado from '../../components/empleados/ModalEmpleado';

export default function GestionEmpleados() {
  useAuth();

  const { buscarEmpleados, desactivarEmpleado, loading, isManager } = useEmpleados();
  
  const [empleados, setEmpleados] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoModal, setModoModal] = useState('crear');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  
  const [sortBy, setSortBy] = useState('nombre');
  const [sortOrder, setSortOrder] = useState('asc');

  // Verificar permisos
  useEffect(() => {
    if (!isManager()) {
      toast.error('Solo los gerentes pueden acceder a esta sección');
      window.location.href = '/';
    }
  }, [isManager]);

  const cargarEmpleados = async () => {
    if (searchTerm.trim().length > 0) {
      const resultado = await buscarEmpleados(searchTerm);
      if (resultado.success) {
        setEmpleados(resultado.data);
      }
    } else {
      setEmpleados([]);
    }
  };

  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      const timeoutId = setTimeout(() => {
        cargarEmpleados();
        setCurrentPage(1);
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setEmpleados([]);
    }
  }, [searchTerm]);

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const empleadosOrdenados = [...empleados].sort((a, b) => {
    let aVal = a[sortBy] || '';
    let bVal = b[sortBy] || '';
    
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(empleadosOrdenados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const empleadosPaginados = empleadosOrdenados.slice(startIndex, startIndex + itemsPerPage);

  const handleNuevoEmpleado = () => {
    setEmpleadoSeleccionado(null);
    setModoModal('crear');
    setModalAbierto(true);
  };

  const handleEditarEmpleado = (empleado) => {
    setEmpleadoSeleccionado(empleado);
    setModoModal('editar');
    setModalAbierto(true);
  };

  const handleDesactivarEmpleado = async (empleado) => {
    if (window.confirm(`¿Estás seguro de desactivar a ${empleado.nombre} ${empleado.apellido}?`)) {
      const resultado = await desactivarEmpleado(empleado.id);
      if (resultado.success) {
        cargarEmpleados();
      }
    }
  };

  const handleEmpleadoGuardado = () => {
    cargarEmpleados();
  };

  const columnas = [
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'apellido', label: 'Apellido', sortable: true },
    { key: 'usuario', label: 'Usuario', sortable: true },
    { key: 'rol', label: 'Rol', sortable: true },
    { key: 'telefono', label: 'Teléfono', sortable: false },
    { key: 'email', label: 'Email', sortable: false },
    { key: 'acciones', label: 'Acciones', sortable: false }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>VERTIMAR | Gestión de Empleados</title>
        <meta name="description" content="Gestión de empleados" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Gestión de Empleados
          </h1>
          
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={() => setSearchTerm('')}
            placeholder="Buscar por nombre, apellido o usuario..."
            loading={loading}
            extraButtons={
              <button
                onClick={handleNuevoEmpleado}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nuevo Empleado
              </button>
            }
          />

          {searchTerm.trim().length === 0 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                💡 Escribe para buscar empleados por nombre, apellido o usuario
              </p>
            </div>
          )}

          {empleados.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              Total de empleados: <span className="font-semibold">{empleados.length}</span>
            </div>
          )}
        </div>

        {empleados.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Vista desktop */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <TableHeader
                  columns={columnas}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                <tbody className="bg-white divide-y divide-gray-200">
                  {empleadosPaginados.map((empleado) => (
                    <tr key={empleado.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {empleado.nombre || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {empleado.apellido || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {empleado.usuario || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          empleado.rol === 'GERENTE' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {empleado.rol === 'GERENTE' ? 'Gerente' : 'Vendedor'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {empleado.telefono || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {empleado.email || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditarEmpleado(empleado)}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDesactivarEmpleado(empleado)}
                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors"
                          >
                            Desactivar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vista móvil */}
            <div className="lg:hidden">
              {empleadosPaginados.map((empleado) => (
                <div key={empleado.id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900">
                        {empleado.nombre} {empleado.apellido}
                      </h3>
                      <p className="text-sm text-gray-500">
                        @{empleado.usuario}
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                        empleado.rol === 'GERENTE' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {empleado.rol === 'GERENTE' ? 'Gerente' : 'Vendedor'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <span className="text-gray-500">Tel:</span>
                      <span className="ml-1 text-gray-900">{empleado.telefono || '-'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Email:</span>
                      <span className="ml-1 text-gray-900">{empleado.email || '-'}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditarEmpleado(empleado)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDesactivarEmpleado(empleado)}
                      className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                    >
                      Desactivar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              startIndex={startIndex}
              itemsPerPage={itemsPerPage}
              totalItems={empleadosOrdenados.length}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Modal */}
      <ModalEmpleado
        empleado={empleadoSeleccionado}
        isOpen={modalAbierto}
        onClose={() => {
          setModalAbierto(false);
          setEmpleadoSeleccionado(null);
        }}
        onEmpleadoGuardado={handleEmpleadoGuardado}
        modo={modoModal}
      />
    </div>
  );
}