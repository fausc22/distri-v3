// hooks/useAuditoria.js - VERSIÓN CORREGIDA
import { useState, useEffect, useCallback } from 'react';
import { axiosAuth } from '../utils/apiClient';
import { toast } from 'react-hot-toast';

export function useAuditoria() {
  const [registros, setRegistros] = useState([]);
  const [registrosOriginales, setRegistrosOriginales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    fecha_desde: '',
    fecha_hasta: '',
    usuario_nombre: '',
    accion: '',
    metodo_http: '',
    estado: ''
  });

  // Cargar registros de auditoría
  const cargarRegistros = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      console.log('🔍 Cargando registros de auditoría...');
      
      const queryParams = new URLSearchParams();
      
      // Aplicar filtros - solo agregar si tienen valor
      Object.entries({ ...filtros, ...params }).forEach(([key, value]) => {
        if (value && value.toString().trim() !== '') {
          queryParams.append(key, value.toString().trim());
        }
      });
      
      // ✅ Configuración fija para la interfaz
      queryParams.append('limite', '50');
      queryParams.append('pagina', '1');

      console.log('📊 Query params enviados:', queryParams.toString());

      const response = await axiosAuth.get(`/auditoria?${queryParams.toString()}`);
      
      if (response.data.success) {
        const registrosRecibidos = response.data.data || [];
        setRegistros(registrosRecibidos);
        setRegistrosOriginales(registrosRecibidos);
        
        console.log('✅ Registros de auditoría cargados:', {
          cantidad: registrosRecibidos.length,
          meta: response.data.meta
        });

        if (registrosRecibidos.length === 0) {
          toast.info('No se encontraron registros con los filtros aplicados');
        }
      } else {
        throw new Error(response.data.message || 'Error cargando auditoría');
      }
    } catch (error) {
      console.error('❌ Error cargando auditoría:', error);
      
      if (error.response?.status === 403) {
        toast.error('Acceso denegado. Solo gerentes pueden ver la auditoría.');
      } else if (error.response?.status === 401) {
        toast.error('Sesión expirada. Por favor, inicie sesión nuevamente.');
      } else {
        toast.error('Error al cargar registros de auditoría');
      }
      
      setRegistros([]);
      setRegistrosOriginales([]);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  // Aplicar filtros
  const aplicarFiltros = useCallback((nuevosFiltros) => {
    console.log('🔍 Aplicando filtros:', nuevosFiltros);
    setFiltros(nuevosFiltros);
  }, []);

  // Limpiar filtros
  const limpiarFiltros = useCallback(() => {
    console.log('🧹 Limpiando filtros');
    const filtrosVacios = {
      fecha_desde: '',
      fecha_hasta: '',
      usuario_nombre: '',
      accion: '',
      metodo_http: '',
      estado: ''
    };
    setFiltros(filtrosVacios);
  }, []);

  // Obtener detalle de un registro
  const obtenerDetalle = useCallback(async (id) => {
    try {
      console.log('🔍 Obteniendo detalle de auditoría ID:', id);
      
      const response = await axiosAuth.get(`/auditoria/detalle/${id}`);
      
      if (response.data.success) {
        console.log('✅ Detalle obtenido para ID:', id);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Error obteniendo detalle');
      }
    } catch (error) {
      console.error('❌ Error obteniendo detalle:', error);
      
      if (error.response?.status === 404) {
        toast.error('Registro no encontrado');
      } else {
        toast.error('Error al obtener detalle del registro');
      }
      return null;
    }
  }, []);

  // Obtener estadísticas simples
  const getEstadisticas = useCallback(() => {
    const total = registrosOriginales.length;
    const filtrado = registros.length;
    
    const porEstado = registros.reduce((acc, reg) => {
      acc[reg.estado] = (acc[reg.estado] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      filtrado,
      exitosos: porEstado.EXITOSO || 0,
      fallidos: porEstado.FALLIDO || 0
    };
  }, [registros, registrosOriginales]);

  // Obtener usuarios únicos para filtros
  const getUsuariosUnicos = useCallback(() => {
    const usuarios = [...new Set(
      registrosOriginales
        .map(reg => reg.usuario_nombre)
        .filter(nombre => nombre && nombre.trim() !== '' && nombre !== 'null')
    )].sort();
    
    return usuarios;
  }, [registrosOriginales]);

  // Obtener acciones únicas para filtros
  const getAccionesUnicas = useCallback(() => {
    const acciones = [...new Set(
      registrosOriginales
        .map(reg => reg.accion)
        .filter(accion => accion && accion.trim() !== '' && accion !== 'null')
    )].sort();
    
    return acciones;
  }, [registrosOriginales]);

  // ✅ Cargar datos cuando cambien los filtros
  useEffect(() => {
    cargarRegistros();
  }, [filtros]);

  // ✅ Cargar datos iniciales al montar
  useEffect(() => {
    console.log('🚀 Hook useAuditoria inicializado');
    cargarRegistros();
  }, []);

  return {
    // Datos
    registros,
    registrosOriginales,
    loading,
    filtros,
    
    // Funciones
    cargarRegistros,
    aplicarFiltros,
    limpiarFiltros,
    obtenerDetalle,
    
    // Utilidades
    getEstadisticas,
    getUsuariosUnicos,
    getAccionesUnicas
  };
}