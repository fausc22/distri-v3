// hooks/useBusquedaHybrid.js - Hook híbrido para búsqueda de clientes PWA/Web
import { useState, useEffect } from 'react';
import { useOfflineCatalog } from './useOfflineCatalog';
import { getAppMode } from '../utils/offlineManager';

export function useClienteSearchHybrid() {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const appMode = getAppMode();
  const isPWA = appMode === 'pwa';

  // Hook del catálogo offline
  const { buscarClientes } = useOfflineCatalog();

  // ✅ MONITOREAR CONECTIVIDAD SOLO EN PWA
  useEffect(() => {
    if (isPWA) {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      
      setIsOnline(navigator.onLine);
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [isPWA]);

  // ✅ BÚSQUEDA HÍBRIDA DE CLIENTES
  const buscarCliente = async () => {
    if (!busqueda.trim()) return;

    setLoading(true);
    try {
      console.log(`🔍 Buscando clientes en modo ${appMode}:`, busqueda);
      
      const resultados = await buscarClientes(busqueda);
      
      setResultados(resultados);
      setMostrarModal(true);
      
      console.log(`✅ Clientes encontrados: ${resultados.length}`);
    } catch (error) {
      console.error('❌ Error buscando clientes:', error);
      setResultados([]);
    } finally {
      setLoading(false);
    }
  };

  const limpiarBusqueda = () => {
    setBusqueda('');
    setResultados([]);
    setMostrarModal(false);
  };

  return {
    // Estados
    busqueda,
    setBusqueda,
    resultados,
    loading,
    mostrarModal,
    setMostrarModal,
    isPWA,
    isOnline,
    
    // Funciones
    buscarCliente,
    limpiarBusqueda
  };
}