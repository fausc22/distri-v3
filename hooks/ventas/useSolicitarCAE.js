// hooks/ventas/useSolicitarCAE.js
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { axiosAuth } from '../../utils/apiClient';

/**
 * Hook para solicitar CAE de ARCA/AFIP
 */
export function useSolicitarCAE() {
  const [solicitando, setSolicitando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Solicitar CAE para una venta específica
   */
  const solicitarCAE = async (ventaId) => {
    console.log(`📋 Solicitando CAE para venta ${ventaId}...`);
    
    setSolicitando(true);
    setError(null);
    setResultado(null);

    try {
      const response = await axiosAuth.post('/arca/solicitar-cae', {
        ventaId: ventaId
      });

      if (response.data.success) {
        const { data } = response.data;
        
        console.log('✅ CAE obtenido exitosamente:', data.cae);
        
        setResultado(data);
        
        // Toast con información del CAE
        toast.success(
          <div>
            <div className="font-bold">✅ CAE Obtenido</div>
            <div className="text-sm">CAE: {data.cae}</div>
            <div className="text-sm">Vence: {data.fechaVencimiento}</div>
          </div>,
          { duration: 5000 }
        );
        
        return { success: true, data };
      } else {
        throw new Error(response.data.message || 'Error desconocido');
      }
      
    } catch (err) {
      console.error('❌ Error solicitando CAE:', err);
      
      const errorMessage = err.response?.data?.message || err.message || 'Error al solicitar CAE';
      const errorDetalles = err.response?.data?.error || '';
      
      setError({
        message: errorMessage,
        detalles: errorDetalles
      });
      
      // Toast de error detallado
      toast.error(
        <div>
          <div className="font-bold">❌ Error solicitando CAE</div>
          <div className="text-sm">{errorMessage}</div>
          {errorDetalles && (
            <div className="text-xs mt-1 text-gray-300">{errorDetalles}</div>
          )}
        </div>,
        { duration: 6000 }
      );
      
      return { success: false, error: errorMessage };
      
    } finally {
      setSolicitando(false);
    }
  };

  /**
   * Solicitar CAE para múltiples ventas
   */
  const solicitarCAEMultiple = async (ventasIds) => {
    console.log(`📋 Solicitando CAE para ${ventasIds.length} ventas...`);
    
    setSolicitando(true);
    setError(null);
    
    const resultados = {
      exitosos: [],
      fallidos: []
    };

    try {
      // Procesar una por una para tener control detallado
      for (const ventaId of ventasIds) {
        try {
          const resultado = await solicitarCAE(ventaId);
          
          if (resultado.success) {
            resultados.exitosos.push({
              ventaId,
              cae: resultado.data.cae
            });
          } else {
            resultados.fallidos.push({
              ventaId,
              error: resultado.error
            });
          }
          
          // Pequeña pausa entre requests
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (err) {
          resultados.fallidos.push({
            ventaId,
            error: err.message
          });
        }
      }

      // Resumen final
      const totalExitosos = resultados.exitosos.length;
      const totalFallidos = resultados.fallidos.length;
      
      console.log(`📊 Resumen: ${totalExitosos} exitosos, ${totalFallidos} fallidos`);
      
      if (totalExitosos > 0) {
        toast.success(
          `✅ ${totalExitosos} CAE${totalExitosos > 1 ? 's' : ''} obtenido${totalExitosos > 1 ? 's' : ''} exitosamente`,
          { duration: 4000 }
        );
      }
      
      if (totalFallidos > 0) {
        toast.error(
          `❌ ${totalFallidos} venta${totalFallidos > 1 ? 's' : ''} con error`,
          { duration: 4000 }
        );
      }
      
      return {
        success: totalExitosos > 0,
        resultados,
        resumen: {
          total: ventasIds.length,
          exitosos: totalExitosos,
          fallidos: totalFallidos
        }
      };
      
    } catch (err) {
      console.error('❌ Error en solicitud múltiple:', err);
      toast.error('Error procesando solicitudes múltiples');
      return { success: false, error: err.message };
    } finally {
      setSolicitando(false);
    }
  };

  /**
   * Limpiar estado
   */
  const limpiar = () => {
    setResultado(null);
    setError(null);
  };

  return {
    solicitarCAE,
    solicitarCAEMultiple,
    solicitando,
    resultado,
    error,
    limpiar
  };
}

export default useSolicitarCAE;