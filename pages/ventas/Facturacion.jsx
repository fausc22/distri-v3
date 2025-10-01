// pages/ventas/Facturacion.jsx - ACTUALIZADO CON FUNCIONALIDAD VER COMPROBANTE
import { useState } from 'react';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

// Hooks personalizados
import { useHistorialVentas } from '../../hooks/ventas/useHistorialVentas';
import { useFiltrosVentas } from '../../hooks/ventas/useFiltrosVentas';
import { usePaginacion } from '../../hooks/usePaginacion';
import { useEditarVenta } from '../../hooks/ventas/useEditarVenta';
import { useComprobantes } from '../../hooks/ventas/useComprobantes';
import { useGenerarPDFsVentas } from '../../hooks/ventas/useGenerarPDFsVentas';
import { useSolicitarCAE } from '../../hooks/ventas/useSolicitarCAE';

// Componentes
import FiltrosHistorialVentas from '../../components/ventas/FiltrosHistorialVentas';
import TablaVentas from '../../components/ventas/TablaVentas';
import { Paginacion } from '../../components/Paginacion';
import { ModalDetalleVenta } from '../../components/ventas/ModalesHistorialVentas';
import { ModalComprobantesVenta } from '../../components/ventas/ModalComprobantesVenta';
import { ModalConfirmacionSalida } from '../../components/ventas/ModalesConfirmacion';
import { BotonAcciones } from '../../components/ventas/BotonAcciones';

// ✅ IMPORTAR axiosAuth para hacer la llamada a la API de comprobantes
import { axiosAuth } from '../../utils/apiClient';

function HistorialVentasContent() {
  // Estados para modales
  const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
  const [mostrarModalComprobante, setMostrarModalComprobante] = useState(false);
  const [mostrarConfirmacionSalida, setMostrarConfirmacionSalida] = useState(false);

  const { user, loading: authLoading } = useAuth();

  // Hooks personalizados
  const { ventas, selectedVentas, loading, handleSelectVenta, handleSelectAllVentas, clearSelection, getVentasSeleccionadas, cargarVentas } = useHistorialVentas();
  
  // Hook de filtros para ventas
  const { filtros, ventasFiltradas, handleFiltrosChange, limpiarFiltros } = useFiltrosVentas(ventas);
  
  const {
    datosActuales: ventasActuales,
    paginaActual,
    registrosPorPagina,
    totalPaginas,
    indexOfPrimero,
    indexOfUltimo,
    cambiarPagina,
    cambiarRegistrosPorPagina
  } = usePaginacion(ventasFiltradas, 10);

  const {
    selectedVenta,
    productos,
    cuenta,
    loading: loadingProductos,
    cargarProductosVenta,
    cargarCuenta,
    cerrarEdicion
  } = useEditarVenta();

  const {
    comprobante,
    comprobantePreview,
    comprobanteExistente,
    uploadingComprobante,
    verificarComprobanteExistente,
    handleFileChange,
    uploadComprobante,
    viewComprobante,
    limpiarComprobante
  } = useComprobantes();

  // Hook para generar PDFs y ranking de ventas
  const {
    // PDF Individual
    generandoPDF,
    pdfURL,
    mostrarModalPDF,
    nombreArchivo,
    tituloModal,
    subtituloModal,
    generarPDFIndividualConModal,
    descargarPDF,
    compartirPDF,
    cerrarModalPDF,
    
    // PDF Múltiple
    imprimiendoMultiple,
    mostrarModalPDFMultiple,
    pdfURLMultiple,
    nombreArchivoMultiple,
    tituloModalMultiple,
    subtituloModalMultiple,
    generarPDFsMultiplesConModal,
    descargarPDFMultiple,
    compartirPDFMultiple,
    cerrarModalPDFMultiple,

    // Ranking de Ventas
    generandoRanking,
    mostrarModalRanking,
    pdfURLRanking,
    nombreArchivoRanking,
    tituloModalRanking,
    subtituloModalRanking,
    generarRankingVentas,
    descargarRanking,
    compartirRanking,
    cerrarModalRanking
  } = useGenerarPDFsVentas();

  const { solicitarCAE, solicitarCAEMultiple, solicitando: solicitandoCAE } = useSolicitarCAE();

  // Handlers para eventos de la tabla
  const handleRowDoubleClick = async (venta) => {
    try {
      await cargarProductosVenta(venta);
      await cargarCuenta(venta);
      setMostrarModalDetalle(true);
    } catch (error) {
      toast.error('Error al cargar detalles de la venta');
    }
  };

  const handleCloseModalDetalle = () => {
    setMostrarModalDetalle(false);
    cerrarEdicion();
  };

  // Handlers para comprobantes
  const handleCargarComprobante = async () => {
    if (!selectedVenta) {
      toast.error("Seleccione una venta primero");
      return;
    }
    
    limpiarComprobante();
    await verificarComprobanteExistente(selectedVenta.id);
    setMostrarModalDetalle(false);
    setTimeout(() => setMostrarModalComprobante(true), 300);
  };

  const handleCloseModalComprobante = () => {
    setMostrarModalComprobante(false);
    setTimeout(() => setMostrarModalDetalle(true), 300);
  };

  const handleUploadComprobante = async () => {
    if (!selectedVenta) return;
    
    const exito = await uploadComprobante(selectedVenta.id);
    if (exito) {
      setTimeout(() => {
        setMostrarModalComprobante(false);
        setTimeout(() => setMostrarModalDetalle(true), 300);
      }, 1500);
    }
  };

  const handleViewComprobante = () => {
    if (!selectedVenta) return;
    viewComprobante(selectedVenta.id);
  };

  // 🆕 NUEVA FUNCIÓN: Handler para ver comprobante desde el modal de detalle
  const handleVerComprobanteDesdeDetalle = async (ventaId, tipo) => {
    try {
      console.log(`👀 Abriendo comprobante: ${tipo}/${ventaId}`);
      
      // Usar la misma URL que el sistema de comprobantes
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const url = `${apiUrl}/comprobantes/obtener/${tipo}/${ventaId}`;
      
      // Abrir en nueva pestaña
      window.open(url, '_blank', 'noopener,noreferrer');
      
      toast.success('Comprobante abierto en nueva pestaña');
      
    } catch (error) {
      console.error('❌ Error abriendo comprobante:', error);
      toast.error('Error al abrir el comprobante');
    }
  };

  // Handler para generar PDF individual
  const handleGenerarPDF = async () => {
    if (!selectedVenta || productos.length === 0) {
      toast.error("Seleccione una venta con productos");
      return;
    }

    console.log('🖨️ Generando PDF individual con modal para venta:', selectedVenta.id);
    await generarPDFIndividualConModal(selectedVenta, productos);
  };

  // Función para imprimir múltiples CON MODAL
  const handleImprimirMultiple = async () => {
    const ventasSeleccionadas = ventasFiltradas.filter(venta => 
      selectedVentas.includes(venta.id)
    );
    
    if (ventasSeleccionadas.length === 0) {
      toast.error("Seleccione al menos una venta para imprimir");
      return;
    }

    console.log('🖨️ Ventas seleccionadas para imprimir con modal:', ventasSeleccionadas.map(v => ({ id: v.id, cliente: v.cliente_nombre })));
    
    const exito = await generarPDFsMultiplesConModal(ventasSeleccionadas);
    
    if (exito) {
      clearSelection();
    }
  };

  // NUEVO HANDLER para generar ranking de ventas
  const handleGenerarRankingVentas = async () => {
    const ventasSeleccionadas = ventasFiltradas.filter(venta => 
      selectedVentas.includes(venta.id)
    );
    
    if (ventasSeleccionadas.length === 0) {
      toast.error("Seleccione al menos una venta para generar el ranking");
      return;
    }

    console.log('📊 Generando ranking de ventas para:', ventasSeleccionadas.map(v => ({ 
      id: v.id, 
      cliente: v.cliente_nombre,
      total: v.total 
    })));
    
    const exito = await generarRankingVentas(ventasSeleccionadas);
    
    if (exito) {
      console.log('✅ Ranking de ventas generado exitosamente');
    }
  };

  // Handlers para navegación
  const handleConfirmarSalida = () => {
    setMostrarConfirmacionSalida(true);
  };

  const handleSalir = () => {
    window.location.href = '/';
  };

  const handleSolicitarCAE = async () => {
    // Obtener ventas seleccionadas que NO tienen CAE
    const ventasSinCAE = ventasFiltradas.filter(venta => 
      selectedVentas.includes(venta.id) && !venta.cae_id
    );
    
    if (ventasSinCAE.length === 0) {
      toast.error('Todas las ventas seleccionadas ya tienen CAE asignado');
      return;
    }
    
    // Confirmar acción
    const confirmacion = window.confirm(
      `¿Solicitar CAE para ${ventasSinCAE.length} venta${ventasSinCAE.length > 1 ? 's' : ''}?\n\n` +
      `Esto enviará las facturas a ARCA/AFIP para obtener autorización electrónica.`
    );
    
    if (!confirmacion) return;
    
    console.log(`📋 Solicitando CAE para ${ventasSinCAE.length} ventas...`);
    
    try {
      // Si es solo una venta
      if (ventasSinCAE.length === 1) {
        const resultado = await solicitarCAE(ventasSinCAE[0].id);
        
        if (resultado.success) {
          // Recargar ventas para ver el CAE actualizado
          await cargarVentas();
          clearSelection();
        }
      } 
      // Si son múltiples ventas
      else {
        const ventasIds = ventasSinCAE.map(v => v.id);
        const resultado = await solicitarCAEMultiple(ventasIds);
        
        if (resultado.success) {
          // Mostrar resumen
          toast.success(
            `✅ Proceso completado:\n` +
            `${resultado.resumen.exitosos} exitosos\n` +
            `${resultado.resumen.fallidos} fallidos`,
            { duration: 5000 }
          );
          
          // Recargar ventas
          await cargarVentas();
          clearSelection();
        }
      }
      
    } catch (error) {
      console.error('❌ Error en solicitud de CAE:', error);
      toast.error('Error al procesar solicitudes de CAE');
    }
  };

  const handleSolicitarCAEIndividual = async (ventaId) => {
  console.log(`📋 Solicitando CAE para venta individual ${ventaId}...`);
  
  try {
    const resultado = await solicitarCAE(ventaId);
    
    if (resultado.success) {
      // Recargar ventas para actualizar la lista
      await cargarVentas();
      
      // Recargar productos de la venta actual para actualizar el modal
      if (selectedVenta && selectedVenta.id === ventaId) {
        await cargarProductosVenta(selectedVenta);
      }
      
      toast.success('CAE obtenido exitosamente');
    }
  } catch (error) {
    console.error('❌ Error solicitando CAE individual:', error);
    toast.error('Error al solicitar CAE');
  }
  };

  // Limpiar selección cuando cambian los filtros
  const handleFiltrosChangeConLimpieza = (nuevosFiltros) => {
    handleFiltrosChange(nuevosFiltros);
    clearSelection();
    cambiarPagina(1); // Reset a primera página
  };

  const handleLimpiarFiltrosConSeleccion = () => {
    limpiarFiltros();
    clearSelection();
    cambiarPagina(1); // Reset a primera página
  };

  // Mostrar loading mientras se autentica
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Head>
        <title>VERTIMAR | HISTORIAL DE VENTAS</title>
        <meta name="description" content="Historial de ventas en el sistema VERTIMAR" />
      </Head>
      
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-6xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          HISTORIAL DE VENTAS
        </h1>
        
        {/* Componente de filtros */}
        <FiltrosHistorialVentas
          filtros={filtros}
          onFiltrosChange={handleFiltrosChangeConLimpieza}
          onLimpiarFiltros={handleLimpiarFiltrosConSeleccion}
          user={user}
          totalVentas={ventas.length}
          ventasFiltradas={ventasFiltradas.length}
          ventasOriginales={ventas}
        />
        
        <TablaVentas
          ventas={ventasActuales}
          selectedVentas={selectedVentas}
          onSelectVenta={handleSelectVenta}
          onSelectAll={() => handleSelectAllVentas(ventasActuales)}
          onRowDoubleClick={handleRowDoubleClick}
          loading={loading}
        />
        
        <Paginacion
          datosOriginales={ventasFiltradas}
          paginaActual={paginaActual}
          registrosPorPagina={registrosPorPagina}
          totalPaginas={totalPaginas}
          indexOfPrimero={indexOfPrimero}
          indexOfUltimo={indexOfUltimo}
          onCambiarPagina={cambiarPagina}
          onCambiarRegistrosPorPagina={cambiarRegistrosPorPagina}
        />
        
        {/* BOTÓN ACTUALIZADO CON PROPS PARA RANKING */}
        <BotonAcciones
          selectedVentas={selectedVentas}
          onImprimirMultiple={handleImprimirMultiple}
          imprimiendo={imprimiendoMultiple}
          onSolicitarCAE={handleSolicitarCAE}
          solicitando={solicitandoCAE}
          onVolverMenu={handleConfirmarSalida}
          // Props para modal PDF múltiple
          mostrarModalPDFMultiple={mostrarModalPDFMultiple}
          pdfURLMultiple={pdfURLMultiple}
          nombreArchivoMultiple={nombreArchivoMultiple}
          tituloModalMultiple={tituloModalMultiple}
          subtituloModalMultiple={subtituloModalMultiple}
          onDescargarPDFMultiple={descargarPDFMultiple}
          onCompartirPDFMultiple={compartirPDFMultiple}
          onCerrarModalPDFMultiple={cerrarModalPDFMultiple}
          // Props para ranking de ventas
          onGenerarRankingVentas={handleGenerarRankingVentas}
          generandoRanking={generandoRanking}
          mostrarModalRanking={mostrarModalRanking}
          pdfURLRanking={pdfURLRanking}
          nombreArchivoRanking={nombreArchivoRanking}
          tituloModalRanking={tituloModalRanking}
          subtituloModalRanking={subtituloModalRanking}
          onDescargarRanking={descargarRanking}
          onCompartirRanking={compartirRanking}
          onCerrarModalRanking={cerrarModalRanking}
        />
      </div>
      
      {/* ✅ MODAL DE DETALLE ACTUALIZADO CON NUEVA PROP */}
      <ModalDetalleVenta
        venta={selectedVenta}
        productos={productos}
        loading={loadingProductos}
        onClose={handleCloseModalDetalle}
        onImprimirFacturaIndividual={handleGenerarPDF}
        generandoPDF={generandoPDF}
        cuenta={cuenta}
        // Props para modal PDF individual
        mostrarModalPDF={mostrarModalPDF}
        pdfURL={pdfURL}
        nombreArchivo={nombreArchivo}
        tituloModal={tituloModal}
        subtituloModal={subtituloModal}
        onDescargarPDF={descargarPDF}
        onCompartirPDF={compartirPDF}
        onCerrarModalPDF={cerrarModalPDF}
        // 🆕 NUEVA PROP: Función para ver comprobante
        onVerComprobante={handleVerComprobanteDesdeDetalle}

         onSolicitarCAE={handleSolicitarCAEIndividual}  
          solicitandoCAE={solicitandoCAE}   
      />

      {/* Modal comprobantes */}
      <ModalComprobantesVenta
        mostrar={mostrarModalComprobante}
        venta={selectedVenta}
        comprobante={comprobante}
        comprobantePreview={comprobantePreview}
        comprobanteExistente={comprobanteExistente}
        uploadingComprobante={uploadingComprobante}
        onClose={handleCloseModalComprobante}
        onFileChange={handleFileChange}
        onUpload={handleUploadComprobante}
        onView={handleViewComprobante}
      />

      {/* Modal confirmación salida */}
      <ModalConfirmacionSalida
        mostrar={mostrarConfirmacionSalida}
        onConfirmar={handleSalir}
        onCancelar={() => setMostrarConfirmacionSalida(false)}
      />
    </div>
  );
}

export default function HistorialVentas() {
  return <HistorialVentasContent />;
}