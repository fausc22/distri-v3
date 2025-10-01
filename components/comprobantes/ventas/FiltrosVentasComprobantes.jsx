import { useState } from 'react';
import { MdSearch, MdFilterList, MdClear, MdExpandMore, MdExpandLess } from 'react-icons/md';

const FiltrosVentasComprobantes = ({
  searchTerm,
  filtros,
  onSearch,
  onFiltroChange,
  resultados,
  loading
}) => {
  const [filtrosExpandidos, setFiltrosExpandidos] = useState(false);

  const toggleFiltros = () => {
    setFiltrosExpandidos(!filtrosExpandidos);
  };

  const limpiarTodosFiltros = () => {
    onSearch('');
    onFiltroChange('estado', 'todos');
    onFiltroChange('fechaDesde', '');
    onFiltroChange('fechaHasta', '');
    onFiltroChange('montoMin', '');
    onFiltroChange('montoMax', '');
  };

  const hayFiltrosActivos = () => {
    return searchTerm || 
           filtros.estado !== 'todos' || 
           filtros.fechaDesde || 
           filtros.fechaHasta || 
           filtros.montoMin || 
           filtros.montoMax;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      {/* Búsqueda principal - Siempre visible */}
      <div className="p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MdSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por cliente, teléfono o ID de venta..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
          />
        </div>

        {/* Botones de filtro rápido */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <button
            onClick={() => onFiltroChange('estado', filtros.estado === 'sin' ? 'todos' : 'sin')}
            className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
              filtros.estado === 'sin'
                ? 'bg-red-100 text-red-800 border border-red-200'
                : 'bg-gray-100 text-gray-600 hover:bg-red-50'
            }`}
          >
            ❌ Sin comprobante
          </button>
          
          <button
            onClick={() => onFiltroChange('estado', filtros.estado === 'con' ? 'todos' : 'con')}
            className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
              filtros.estado === 'con'
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-green-50'
            }`}
          >
            ✅ Con comprobante
          </button>

          {/* Botón expandir filtros */}
          <button
            onClick={toggleFiltros}
            className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full text-sm font-medium transition-colors"
          >
            <MdFilterList className="h-4 w-4" />
            Más filtros
            {filtrosExpandidos ? <MdExpandLess className="h-4 w-4" /> : <MdExpandMore className="h-4 w-4" />}
          </button>

          {/* Limpiar filtros */}
          {hayFiltrosActivos() && (
            <button
              onClick={limpiarTodosFiltros}
              className="flex items-center gap-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full text-sm font-medium transition-colors"
            >
              <MdClear className="h-4 w-4" />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Filtros expandidos */}
      {filtrosExpandidos && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro por fecha desde */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📅 Fecha desde
              </label>
              <input
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) => onFiltroChange('fechaDesde', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              />
            </div>

            {/* Filtro por fecha hasta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📅 Fecha hasta
              </label>
              <input
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) => onFiltroChange('fechaHasta', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              />
            </div>

            {/* Filtro por monto mínimo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                💰 Monto mínimo
              </label>
              <input
                type="number"
                placeholder="0"
                value={filtros.montoMin}
                onChange={(e) => onFiltroChange('montoMin', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              />
            </div>

            {/* Filtro por monto máximo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                💰 Monto máximo
              </label>
              <input
                type="number"
                placeholder="999999"
                value={filtros.montoMax}
                onChange={(e) => onFiltroChange('montoMax', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Estado del filtrado */}
          <div className="mt-4 text-sm text-gray-600">
            <span>
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Buscando...
                </span>
              ) : (
                <span>
                  📊 {resultados} resultado{resultados !== 1 ? 's' : ''} encontrado{resultados !== 1 ? 's' : ''}
                </span>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FiltrosVentasComprobantes;