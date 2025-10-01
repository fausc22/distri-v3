// hooks/useFinanzasData.js - VERSIÓN CORREGIDA
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { axiosAuth } from '../utils/apiClient';

export function useFinanzasData() {
  const [loading, setLoading] = useState({});
  const [error, setError] = useState(null);

  // Función helper para manejar loading por endpoint
  const setLoadingState = (endpoint, isLoading) => {
    setLoading(prev => ({
      ...prev,
      [endpoint]: isLoading
    }));
  };

  // ✅ Función helper mejorada para manejar errores
  const handleError = (error, endpoint) => {
    console.error(`❌ Error en ${endpoint}:`, error);
    
    let message = `Error al cargar ${endpoint}`;
    
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      if (status === 400) {
        message = errorData?.message || 'Parámetros inválidos';
      } else if (status === 404) {
        message = 'Datos no encontrados';
      } else if (status === 500) {
        message = errorData?.message || 'Error interno del servidor';
      } else {
        message = errorData?.message || `Error ${status}`;
      }
    } else if (error.request) {
      message = 'No se puede conectar con el servidor';
    } else {
      message = error.message || 'Error desconocido';
    }
    
    setError(message);
    toast.error(message);
    return { success: false, data: null, error: message };
  };

  // ✅ OBTENER GANANCIAS DETALLADAS MEJORADO
  const obtenerGananciasDetalladas = useCallback(async (filtros = {}) => {
    const endpoint = 'ganancias-detalladas';
    setLoadingState(endpoint, true);
    setError(null);

    try {
      // ✅ Validación de parámetros en el frontend
      if (!filtros.desde || !filtros.hasta) {
        const error = new Error('Las fechas desde y hasta son obligatorias');
        return handleError(error, endpoint);
      }

      // ✅ Validar que las fechas sean válidas
      const fechaDesde = new Date(filtros.desde);
      const fechaHasta = new Date(filtros.hasta);
      
      if (isNaN(fechaDesde.getTime()) || isNaN(fechaHasta.getTime())) {
        const error = new Error('Formato de fecha inválido');
        return handleError(error, endpoint);
      }

      if (fechaDesde > fechaHasta) {
        const error = new Error('La fecha desde no puede ser mayor que hasta');
        return handleError(error, endpoint);
      }

      // ✅ Configurar parámetros con valores por defecto
      const params = new URLSearchParams();
      params.append('desde', filtros.desde);
      params.append('hasta', filtros.hasta);
      params.append('periodo', filtros.periodo || 'mensual');
      
      // if (filtros.limite) {
      //   params.append('limite', filtros.limite);
      // }

      console.log('📊 Solicitando ganancias detalladas:', params.toString());

      const response = await axiosAuth.get(`/finanzas/ganancias-detalladas?${params.toString()}`);
      
      if (response.data.success) {
        console.log('✅ Ganancias detalladas obtenidas:', response.data.data?.length || 0, 'registros');
        return { 
          success: true, 
          data: response.data.data || [], 
          totales: response.data.totales || {},
          periodo: response.data.periodo,
          message: response.data.message
        };
      } else {
        return handleError(new Error(response.data.message), endpoint);
      }
    } catch (error) {
      return handleError(error, endpoint);
    } finally {
      setLoadingState(endpoint, false);
    }
  }, []);

  // ✅ NUEVA FUNCIÓN: Verificar disponibilidad de datos
  const verificarDisponibilidadDatos = useCallback(async () => {
    const endpoint = 'verificar-datos';
    setLoadingState(endpoint, true);
    setError(null);

    try {
      const response = await axiosAuth.get('/finanzas/verificar-datos');
      
      if (response.data.success) {
        return { 
          success: true, 
          data: response.data.data,
          recomendaciones: response.data.recomendaciones
        };
      } else {
        return handleError(new Error(response.data.message), endpoint);
      }
    } catch (error) {
      return handleError(error, endpoint);
    } finally {
      setLoadingState(endpoint, false);
    }
  }, []);

  // ✅ OBTENER RESUMEN FINANCIERO MEJORADO
  const obtenerResumenFinanciero = useCallback(async (filtros = {}) => {
    const endpoint = 'resumen-financiero';
    setLoadingState(endpoint, true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      // ✅ Solo agregar filtros de fecha si están presentes
      if (filtros.desde) params.append('desde', filtros.desde);
      if (filtros.hasta) params.append('hasta', filtros.hasta);

      console.log('📈 Solicitando resumen financiero:', params.toString());

      const response = await axiosAuth.get(`/finanzas/resumen-financiero?${params.toString()}`);
      
      if (response.data.success) {
        return { success: true, data: response.data.data };
      } else {
        return handleError(new Error(response.data.message), endpoint);
      }
    } catch (error) {
      return handleError(error, endpoint);
    } finally {
      setLoadingState(endpoint, false);
    }
  }, []);

  // ✅ FUNCIÓN MEJORADA: Obtener ganancias por producto con validación
  const obtenerGananciasPorProducto = useCallback(async (filtros = {}) => {
    const endpoint = 'ganancias-por-producto';
    setLoadingState(endpoint, true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (filtros.desde) params.append('desde', filtros.desde);
      if (filtros.hasta) params.append('hasta', filtros.hasta);
      // if (filtros.limite) params.append('limite', filtros.limite);

      const response = await axiosAuth.get(`/finanzas/ganancias-por-producto?${params.toString()}`);
      
      if (response.data.success) {
        return { success: true, data: response.data.data || [] };
      } else {
        return handleError(new Error(response.data.message), endpoint);
      }
    } catch (error) {
      return handleError(error, endpoint);
    } finally {
      setLoadingState(endpoint, false);
    }
  }, []);

  // ✅ FUNCIÓN MEJORADA: Obtener ganancias por empleado
  const obtenerGananciasPorEmpleado = useCallback(async (filtros = {}) => {
    const endpoint = 'ganancias-por-empleado';
    setLoadingState(endpoint, true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (filtros.desde) params.append('desde', filtros.desde);
      if (filtros.hasta) params.append('hasta', filtros.hasta);

      const response = await axiosAuth.get(`/finanzas/ganancias-por-empleado?${params.toString()}`);
      
      if (response.data.success) {
        return { success: true, data: response.data.data || [] };
      } else {
        return handleError(new Error(response.data.message), endpoint);
      }
    } catch (error) {
      return handleError(error, endpoint);
    } finally {
      setLoadingState(endpoint, false);
    }
  }, []);

  // ✅ FUNCIÓN MEJORADA: Obtener ganancias por ciudad
  const obtenerGananciasPorCiudad = useCallback(async (filtros = {}) => {
    const endpoint = 'ganancias-por-ciudad';
    setLoadingState(endpoint, true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (filtros.desde) params.append('desde', filtros.desde);
      if (filtros.hasta) params.append('hasta', filtros.hasta);
      // if (filtros.limite) params.append('limite', filtros.limite);

      const response = await axiosAuth.get(`/finanzas/ganancias-por-ciudad?${params.toString()}`);
      
      if (response.data.success) {
        return { success: true, data: response.data.data || [] };
      } else {
        return handleError(new Error(response.data.message), endpoint);
      }
    } catch (error) {
      return handleError(error, endpoint);
    } finally {
      setLoadingState(endpoint, false);
    }
  }, []);

  // ✅ FUNCIÓN MEJORADA: Obtener productos más rentables
  const obtenerProductosMasRentables = useCallback(async (filtros = {}) => {
    const endpoint = 'productos-mas-rentables';
    setLoadingState(endpoint, true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (filtros.desde) params.append('desde', filtros.desde);
      if (filtros.hasta) params.append('hasta', filtros.hasta);
      // if (filtros.limite) params.append('limite', filtros.limite);

      const response = await axiosAuth.get(`/finanzas/productos-mas-rentables?${params.toString()}`);
      
      if (response.data.success) {
        return { success: true, data: response.data.data || [] };
      } else {
        return handleError(new Error(response.data.message), endpoint);
      }
    } catch (error) {
      return handleError(error, endpoint);
    } finally {
      setLoadingState(endpoint, false);
    }
  }, []);

  // ✅ FUNCIÓN MEJORADA: Obtener balance general
  const obtenerBalanceGeneral = useCallback(async (filtros = {}) => {
    const endpoint = 'balance-general';
    setLoadingState(endpoint, true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (filtros.desde) params.append('desde', filtros.desde);
      if (filtros.hasta) params.append('hasta', filtros.hasta);
      if (filtros.anio) params.append('anio', filtros.anio);

      const response = await axiosAuth.get(`/finanzas/balance-general?${params.toString()}`);
      
      if (response.data.success) {
        return { 
          success: true, 
          data: response.data.data || [], 
          totales: response.data.totales || {}
        };
      } else {
        return handleError(new Error(response.data.message), endpoint);
      }
    } catch (error) {
      return handleError(error, endpoint);
    } finally {
      setLoadingState(endpoint, false);
    }
  }, []);

  // ✅ FUNCIÓN MEJORADA: Obtener productos más vendidos
  const obtenerProductosMasVendidos = useCallback(async (filtros = {}) => {
    const endpoint = 'ventas-productos';
    setLoadingState(endpoint, true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (filtros.desde) params.append('desde', filtros.desde);
      if (filtros.hasta) params.append('hasta', filtros.hasta);
      // if (filtros.limite) params.append('limite', filtros.limite);

      const response = await axiosAuth.get(`/finanzas/ventas-productos?${params.toString()}`);
      
      if (response.data.success) {
        return { success: true, data: response.data.data || [] };
      } else {
        return handleError(new Error(response.data.message), endpoint);
      }
    } catch (error) {
      return handleError(error, endpoint);
    } finally {
      setLoadingState(endpoint, false);
    }
  }, []);

  // ✅ FUNCIÓN MEJORADA: Obtener ventas por vendedor
  const obtenerVentasPorVendedor = useCallback(async (filtros = {}) => {
    const endpoint = 'ventas-vendedores';
    setLoadingState(endpoint, true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (filtros.desde) params.append('desde', filtros.desde);
      if (filtros.hasta) params.append('hasta', filtros.hasta);

      const response = await axiosAuth.get(`/finanzas/ventas-vendedores?${params.toString()}`);
      
      if (response.data.success) {
        return { success: true, data: response.data.data || [] };
      } else {
        return handleError(new Error(response.data.message), endpoint);
      }
    } catch (error) {
      return handleError(error, endpoint);
    } finally {
      setLoadingState(endpoint, false);
    }
  }, []);

  // ✅ FUNCIÓN MEJORADA: Obtener balance por cuenta
  const obtenerBalancePorCuenta = useCallback(async (filtros = {}) => {
    const endpoint = 'balance-cuenta';
    setLoadingState(endpoint, true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (filtros.desde) params.append('desde', filtros.desde);
      if (filtros.hasta) params.append('hasta', filtros.hasta);

      const response = await axiosAuth.get(`/finanzas/balance-cuenta?${params.toString()}`);
      
      if (response.data.success) {
        return { success: true, data: response.data.data || [] };
      } else {
        return handleError(new Error(response.data.message), endpoint);
      }
    } catch (error) {
      return handleError(error, endpoint);
    } finally {
      setLoadingState(endpoint, false);
    }
  }, []);

  // ✅ FUNCIÓN MEJORADA: Obtener flujo de fondos
  const obtenerFlujoDeFondos = useCallback(async (filtros = {}) => {
    const endpoint = 'flujo-fondos';
    setLoadingState(endpoint, true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (filtros.desde) params.append('desde', filtros.desde);
      if (filtros.hasta) params.append('hasta', filtros.hasta);
      if (filtros.cuenta_id) params.append('cuenta_id', filtros.cuenta_id);

      const response = await axiosAuth.get(`/finanzas/flujo-fondos?${params.toString()}`);
      
      if (response.data.success) {
        return { 
          success: true, 
          data: response.data.data || [], 
          totales: response.data.totales || {}
        };
      } else {
        return handleError(new Error(response.data.message), endpoint);
      }
    } catch (error) {
      return handleError(error, endpoint);
    } finally {
      setLoadingState(endpoint, false);
    }
  }, []);

  // ✅ FUNCIÓN MEJORADA: Obtener distribución de ingresos
  const obtenerDistribucionIngresos = useCallback(async (filtros = {}) => {
    const endpoint = 'distribucion-ingresos';
    setLoadingState(endpoint, true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (filtros.desde) params.append('desde', filtros.desde);
      if (filtros.hasta) params.append('hasta', filtros.hasta);

      const response = await axiosAuth.get(`/finanzas/distribucion-ingresos?${params.toString()}`);
      
      if (response.data.success) {
        return { 
          success: true, 
          data: response.data.data || [], 
          total: response.data.total || 0
        };
      } else {
        return handleError(new Error(response.data.message), endpoint);
      }
    } catch (error) {
      return handleError(error, endpoint);
    } finally {
      setLoadingState(endpoint, false);
    }
  }, []);

  // ✅ FUNCIÓN MEJORADA: Obtener gastos por categoría
  const obtenerGastosPorCategoria = useCallback(async (filtros = {}) => {
    const endpoint = 'gastos-categoria';
    setLoadingState(endpoint, true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (filtros.desde) params.append('desde', filtros.desde);
      if (filtros.hasta) params.append('hasta', filtros.hasta);
      // if (filtros.limite) params.append('limite', filtros.limite);

      const response = await axiosAuth.get(`/finanzas/gastos-categoria?${params.toString()}`);
      
      if (response.data.success) {
        return { 
          success: true, 
          data: response.data.data || [], 
          total: response.data.total || 0
        };
      } else {
        return handleError(new Error(response.data.message), endpoint);
      }
    } catch (error) {
      return handleError(error, endpoint);
    } finally {
      setLoadingState(endpoint, false);
    }
  }, []);

  // ✅ FUNCIÓN MEJORADA: Obtener años disponibles
  const obtenerAniosDisponibles = useCallback(async () => {
    const endpoint = 'anios-disponibles';
    setLoadingState(endpoint, true);
    setError(null);

    try {
      const response = await axiosAuth.get('/finanzas/anios-disponibles');
      
      if (response.data.success) {
        return { success: true, data: response.data.data || [] };
      } else {
        return handleError(new Error(response.data.message), endpoint);
      }
    } catch (error) {
      return handleError(error, endpoint);
    } finally {
      setLoadingState(endpoint, false);
    }
  }, []);

  // ✅ FUNCIÓN PARA RECARGAR TODOS LOS DATOS CON MEJOR MANEJO DE ERRORES
  const recargarTodosLosDatos = useCallback(async (filtros = {}) => {
    setError(null);
    
    console.log('🔄 Recargando todos los datos con filtros:', filtros);
    
    const resultados = await Promise.allSettled([
      obtenerResumenFinanciero(filtros),
      obtenerGananciasDetalladas(filtros),
      obtenerGananciasPorProducto({ ...filtros, limite: 10 }),
      obtenerGananciasPorEmpleado(filtros),
      obtenerGananciasPorCiudad({ ...filtros, limite: 10 }),
      obtenerProductosMasRentables({ ...filtros, limite: 10 }),
      obtenerProductosMasVendidos({ ...filtros, limite: 10 })
    ]);

    // ✅ Procesar resultados de manera más inteligente
    const errores = [];
    const exitos = [];
    
    resultados.forEach((resultado, index) => {
      const nombres = [
        'resumenFinanciero', 'gananciasDetalladas', 'gananciasPorProducto',
        'gananciasPorEmpleado', 'gananciasPorCiudad', 'productosMasRentables', 'productosMasVendidos'
      ];
      
      if (resultado.status === 'rejected') {
        errores.push(`${nombres[index]}: ${resultado.reason?.message || 'Error desconocido'}`);
      } else if (resultado.value?.success) {
        exitos.push(nombres[index]);
      } else {
        errores.push(`${nombres[index]}: ${resultado.value?.error || 'Error en respuesta'}`);
      }
    });

    // ✅ Mostrar mensaje apropiado según los resultados
    if (errores.length === 0) {
      toast.success(`✅ Todos los datos actualizados (${exitos.length} módulos)`);
    } else if (exitos.length > 0) {
      toast.success(`✅ ${exitos.length} módulos actualizados correctamente`);
      console.warn('⚠️ Algunos errores encontrados:', errores);
    } else {
      toast.error(`❌ Error cargando todos los módulos`);
      console.error('❌ Errores encontrados:', errores);
    }

    return {
      resumenFinanciero: resultados[0].status === 'fulfilled' ? resultados[0].value : null,
      gananciasDetalladas: resultados[1].status === 'fulfilled' ? resultados[1].value : null,
      gananciasPorProducto: resultados[2].status === 'fulfilled' ? resultados[2].value : null,
      gananciasPorEmpleado: resultados[3].status === 'fulfilled' ? resultados[3].value : null,
      gananciasPorCiudad: resultados[4].status === 'fulfilled' ? resultados[4].value : null,
      productosMasRentables: resultados[5].status === 'fulfilled' ? resultados[5].value : null,
      productosMasVendidos: resultados[6].status === 'fulfilled' ? resultados[6].value : null,
      errores,
      exitos
    };
  }, [
    obtenerResumenFinanciero,
    obtenerGananciasDetalladas,
    obtenerGananciasPorProducto,
    obtenerGananciasPorEmpleado,
    obtenerGananciasPorCiudad,
    obtenerProductosMasRentables,
    obtenerProductosMasVendidos
  ]);

  // ✅ FUNCIÓN PARA LIMPIAR ERRORES
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  // ✅ FUNCIÓN PARA FORMATEAR MONEDA
  const formatCurrency = useCallback((value) => {
    if (value === undefined || value === null || isNaN(value)) return '$0';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }, []);

  // ✅ FUNCIÓN PARA FORMATEAR PORCENTAJE
  const formatPercentage = useCallback((value) => {
    if (value === undefined || value === null || isNaN(value)) return '0%';
    return `${parseFloat(value).toFixed(1)}%`;
  }, []);


  const obtenerTopProductosTabla = useCallback(async (filtros = {}) => {
  const endpoint = 'top-productos-tabla';
  setLoadingState(endpoint, true);
  setError(null);

  try {
    const params = new URLSearchParams();
    
    if (filtros.desde) params.append('desde', filtros.desde);
    if (filtros.hasta) params.append('hasta', filtros.hasta);
    // if (filtros.limite) params.append('limite', filtros.limite);

    const response = await axiosAuth.get(`/finanzas/top-productos-tabla?${params.toString()}`);
    
    if (response.data.success) {
      return { success: true, data: response.data.data || [] };
    } else {
      return handleError(new Error(response.data.message), endpoint);
    }
  } catch (error) {
    return handleError(error, endpoint);
  } finally {
    setLoadingState(endpoint, false);
  }
  }, []);

  return {
    loading,
    error,

    // ✅ FUNCIONES PRINCIPALES MEJORADAS
    obtenerGananciasDetalladas,
    obtenerGananciasPorProducto,
    obtenerGananciasPorEmpleado,
    obtenerGananciasPorCiudad,
    obtenerResumenFinanciero,
    obtenerProductosMasRentables,
    obtenerBalanceGeneral,
    obtenerTopProductosTabla,
    obtenerProductosMasVendidos,

    // ✅ NUEVAS FUNCIONES
    verificarDisponibilidadDatos,
    obtenerVentasPorVendedor,
    obtenerBalancePorCuenta,
    obtenerFlujoDeFondos,
    obtenerDistribucionIngresos,
    obtenerGastosPorCategoria,
    obtenerAniosDisponibles,

    // ✅ UTILIDADES MEJORADAS
    recargarTodosLosDatos,
    limpiarError,
    formatCurrency,
    formatPercentage,

    // ✅ HELPERS PARA VERIFICAR LOADING
    isLoading: (endpoint) => loading[endpoint] || false,
    isAnyLoading: Object.values(loading).some(Boolean)
  };
}