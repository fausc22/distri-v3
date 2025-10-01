import { MdAssignment, MdCheckCircle, MdCancel } from 'react-icons/md';

const EstadisticasComprobantes = ({
  totalVentas,
  ventasConComprobante,
  ventasSinComprobante,
  loading
}) => {
  const porcentajeConComprobante = totalVentas > 0 
    ? Math.round((ventasConComprobante / totalVentas) * 100) 
    : 0;

  const porcentajeSinComprobante = totalVentas > 0 
    ? Math.round((ventasSinComprobante / totalVentas) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
      {/* Total de ventas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total de Ventas</p>
            <p className="text-3xl font-bold text-gray-900">{totalVentas.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Registradas en el sistema</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <MdAssignment className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Con comprobante */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Con Comprobante</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-green-600">{ventasConComprobante.toLocaleString()}</p>
              <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                {porcentajeConComprobante}%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Comprobantes cargados</p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <MdCheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Sin comprobante */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Sin Comprobante</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-red-600">{ventasSinComprobante.toLocaleString()}</p>
              <span className="text-sm font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">
                {porcentajeSinComprobante}%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Pendientes de carga</p>
          </div>
          <div className="p-3 bg-red-100 rounded-full">
            <MdCancel className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstadisticasComprobantes;