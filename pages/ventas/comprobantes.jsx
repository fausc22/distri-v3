import { useState, useEffect } from 'react';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import ModalGestionComprobante from '../../components/comprobantes/ModalGestionComprobante';
import { useVentasComprobantes } from '../../hooks/comprobantes/useVentasComprobantes';

import ListaVentasComprobantes from '../../components/comprobantes/ventas/ListaVentasComprobantes';
import FiltrosVentasComprobantes from '../../components/comprobantes/ventas/FiltrosVentasComprobantes';

export default function VentasComprobantes() {
  const { user } = useAuth();
  
  const {
    ventas,
    ventasFiltradas,
    loading,
    searchTerm,
    filtros,
    handleSearch,
    handleFiltroChange,
    refrescarDatos,
    refrescarVentaEspecifica,  // ✅ Nueva función
    hayFiltrosActivos
  } = useVentasComprobantes();

  // Estados para el modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

  // Handlers del modal
  const abrirModal = (venta) => {
    setVentaSeleccionada(venta);
    setModalAbierto(true);
  };

  const cerrarModal = async () => {
    setModalAbierto(false);
    
    // ✅ Refrescar la venta específica antes de limpiar selección
    if (ventaSeleccionada?.id) {
      console.log(`🔄 Refrescando estado de venta ${ventaSeleccionada.id} después de cerrar modal`);
      await refrescarVentaEspecifica(ventaSeleccionada.id);
    }
    
    setVentaSeleccionada(null);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>VERTIMAR | Comprobantes de Ventas</title>
        <meta name="description" content="Gestión de comprobantes de ventas VERTIMAR" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      {/* Header */}
      <div className="bg-purple-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">📄 Comprobantes de Ventas</h1>
              <p className="text-purple-200 mt-1 text-sm">
                Gestión y carga de comprobantes de pago de clientes
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0">
              <button
                onClick={refrescarDatos}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cargando...
                  </>
                ) : (
                  <>
                    🔄 Actualizar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filtros */}
        <FiltrosVentasComprobantes
          searchTerm={searchTerm}
          filtros={filtros}
          onSearch={handleSearch}
          onFiltroChange={handleFiltroChange}
          resultados={ventasFiltradas.length}
          loading={loading}
        />

        {/* Lista de ventas */}
        <ListaVentasComprobantes
          ventas={ventasFiltradas}
          loading={loading}
          onGestionarComprobante={abrirModal}
          hayFiltros={hayFiltrosActivos}
        />
      </div>

      {/* Modal de gestión de comprobantes */}
      <ModalGestionComprobante
        mostrar={modalAbierto}
        onCerrar={cerrarModal}
        id={ventaSeleccionada?.id}
        tipo="venta"
        titulo={ventaSeleccionada ? `Comprobante - Venta #${ventaSeleccionada.id}` : ''}
      />
    </div>
  );
}