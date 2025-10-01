import { useState } from 'react';
import { MdRemoveRedEye, MdCloudUpload, MdLink, MdPhone, MdLocationOn } from 'react-icons/md';
import { toast } from 'react-hot-toast';
import { axiosAuth } from '../../../utils/apiClient';


const EstadoComprobanteBadge = ({ tieneComprobante }) => {
  if (tieneComprobante) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        ✅ Con comprobante
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
      ❌ Sin comprobante
    </span>
  );
};

const BotonGenerarLink = ({ ventaId, clienteNombre }) => {
  const [generandoLink, setGenerandoLink] = useState(false);

  const handleGenerarLink = async () => {
    setGenerandoLink(true);
    
    try {
      console.log(`🔗 Generando link público para venta ${ventaId}...`);
      
      const response = await axiosAuth.post(`/comprobantes/generar-link/venta/${ventaId}`);
      
      if (response.data.success) {
        const { link, expira } = response.data.data;
        
        // Copiar al portapapeles
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(link);
          toast.success(`🔗 Link copiado al portapapeles para ${clienteNombre}`);
        } else {
          // Fallback para navegadores que no soportan clipboard
          const textArea = document.createElement('textarea');
          textArea.value = link;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          toast.success(`🔗 Link copiado para ${clienteNombre}`);
        }
        
        // Mostrar información adicional
        setTimeout(() => {
          toast.success(`⏰ El link expira en 24 horas`, { duration: 5000 });
        }, 1000);
        
        console.log('✅ Link generado y copiado:', link);
      } else {
        toast.error(response.data.message || 'Error al generar el link');
      }
      
    } catch (error) {
      console.error('❌ Error generando link:', error);
      
      if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Esta venta ya tiene comprobante');
      } else if (error.response?.status === 404) {
        toast.error('Venta no encontrada');
      } else {
        toast.error('Error al generar el link. Intente nuevamente.');
      }
    } finally {
      setGenerandoLink(false);
    }
  };

  return (
    <button
      onClick={handleGenerarLink}
      disabled={generandoLink}
      className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg text-sm font-medium transition-colors"
      title="Generar link para que el cliente cargue el comprobante"
    >
      {generandoLink ? (
        <>
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Generando...
        </>
      ) : (
        <>
          <MdLink className="h-4 w-4" />
          Link
        </>
      )}
    </button>
  );
};

const FilaVentaComprobante = ({ venta, onGestionarComprobante }) => {
  const {
    id,
    cliente_nombre,
    cliente_telefono,
    cliente_direccion,
    fechaFormateada,
    montoFormateado,
    tieneComprobante,
    estado
  } = venta;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 hover:shadow-md transition-shadow">
      {/* Header con ID, estado y badges */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
            #{id}
          </span>
          <EstadoComprobanteBadge tieneComprobante={tieneComprobante} />
          {estado && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {estado}
            </span>
          )}
        </div>
      </div>

      {/* Información principal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg mb-2 leading-tight">
            {cliente_nombre || 'Sin nombre'}
          </h3>
          
          <div className="space-y-1 text-sm text-gray-600">
            {cliente_telefono && (
              <div className="flex items-center gap-2">
                <MdPhone className="h-4 w-4 text-gray-400" />
                <span>{cliente_telefono}</span>
              </div>
            )}
            
            {cliente_direccion && (
              <div className="flex items-center gap-2">
                <MdLocationOn className="h-4 w-4 text-gray-400" />
                <span className="truncate">{cliente_direccion}</span>
              </div>
            )}
            
            <div className="text-xs text-gray-500 mt-2">
              📅 {fechaFormateada}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between">
          <div className="text-right sm:text-right">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {montoFormateado}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-0">
            <button
              onClick={() => onGestionarComprobante(venta)}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tieneComprobante
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
            >
              {tieneComprobante ? (
                <>
                  <MdRemoveRedEye className="h-4 w-4" />
                  Ver/Gestionar
                </>
              ) : (
                <>
                  <MdCloudUpload className="h-4 w-4" />
                  Cargar Comprobante
                </>
              )}
            </button>

            <BotonGenerarLink 
              ventaId={id} 
              clienteNombre={cliente_nombre || 'Cliente'} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ListaVentasComprobantes = ({ ventas, loading, onGestionarComprobante, hayFiltros }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {/* Skeleton loading */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-6 bg-gray-200 rounded w-12"></div>
                <div className="h-6 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-40"></div>
              </div>
              <div className="flex flex-col justify-between">
                <div className="h-8 bg-gray-200 rounded w-24 ml-auto"></div>
                <div className="flex gap-2 mt-3">
                  <div className="h-9 bg-gray-200 rounded w-32"></div>
                  <div className="h-9 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!ventas || ventas.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="max-w-md mx-auto">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron ventas
          </h3>
          <p className="text-gray-500 text-sm">
            No hay ventas que coincidan con los filtros aplicados. 
            Intente ajustar los criterios de búsqueda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Información de resultados */}
      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <span>
          Mostrando {ventas.length} resultado{ventas.length !== 1 ? 's' : ''}
          {!hayFiltros && (
            <span className="text-gray-500"> (máximo 20 sin filtros)</span>
          )}
        </span>
      </div>

      {/* Lista de ventas */}
      {ventas.map((venta) => (
        <FilaVentaComprobante
          key={venta.id}
          venta={venta}
          onGestionarComprobante={onGestionarComprobante}
        />
      ))}
    </div>
  );
};

export default ListaVentasComprobantes;