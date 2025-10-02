// hooks/useEmpleados.js - VERSIÓN MEJORADA
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import useAuth from './useAuth';
import { axiosAuth } from '../utils/apiClient';

export const useEmpleados = () => {
  const [loading, setLoading] = useState(false);
  const { user, logout, isManager } = useAuth();

  // Verificar permisos
  const checkPermissions = (action = 'gestionar empleados') => {
    if (!user) {
      toast.error('Debes estar autenticado');
      logout();
      return false;
    }

    if (!isManager()) {
      toast.error('Solo los gerentes pueden gestionar empleados');
      return false;
    }

    return true;
  };

  // Crear empleado
  const crearEmpleado = async (empleadoData) => {
    if (!checkPermissions('crear empleados')) {
      return { success: false, error: 'Sin permisos' };
    }

    setLoading(true);
    try {
      const response = await axiosAuth.post('/empleados/crear-empleado', empleadoData);

      toast.success('Empleado creado exitosamente');
      return { success: true, data: response.data };

    } catch (error) {
      console.error('Error al crear empleado:', error);
      
      let message = 'Error al crear empleado';
      
      if (error.response) {
        switch (error.response.status) {
          case 401:
            message = 'Sesión expirada';
            logout();
            break;
          case 403:
            message = 'No tienes permisos';
            break;
          default:
            message = error.response.data?.message || message;
        }
      }
      
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Actualizar empleado - CORREGIDO: usa req.params.id
  const actualizarEmpleado = async (id, empleadoData) => {
    if (!checkPermissions('actualizar empleados')) {
      return { success: false, error: 'Sin permisos' };
    }

    setLoading(true);
    try {
      // Si la contraseña está vacía, no enviarla
      const dataToSend = { ...empleadoData };
      if (!dataToSend.password || dataToSend.password.trim() === '') {
        delete dataToSend.password;
      }

      const response = await axiosAuth.put(
        `/empleados/actualizar-empleado/${id}`,
        dataToSend
      );

      toast.success('Empleado actualizado exitosamente');
      return { success: true, data: response.data };

    } catch (error) {
      console.error('Error al actualizar empleado:', error);
      
      let message = 'Error al actualizar empleado';
      
      if (error.response) {
        switch (error.response.status) {
          case 401:
            message = 'Sesión expirada';
            logout();
            break;
          case 403:
            message = 'No tienes permisos';
            break;
          default:
            message = error.response.data?.message || message;
        }
      }
      
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Buscar empleados - CORREGIDO: usa 'search' como query param
  const buscarEmpleados = async (searchTerm) => {
    if (!checkPermissions('buscar empleados')) {
      return { success: false, data: [] };
    }

    setLoading(true);
    try {
      const response = await axiosAuth.get(
        `/empleados/buscar-empleado?search=${encodeURIComponent(searchTerm || '')}`
      );

      return { success: true, data: response.data };

    } catch (error) {
      console.error('Error al buscar empleados:', error);
      
      let message = 'Error al buscar empleados';
      if (error.response?.status === 401) {
        message = 'Sesión expirada';
        logout();
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      
      toast.error(message);
      return { success: false, data: [] };
    } finally {
      setLoading(false);
    }
  };

  // Listar todos los empleados
  const listarEmpleados = async () => {
    if (!checkPermissions('listar empleados')) {
      return { success: false, data: [] };
    }

    setLoading(true);
    try {
      const response = await axiosAuth.get('/empleados/listar');

      return { success: true, data: response.data };

    } catch (error) {
      const message = error.response?.data?.message || 'Error al listar empleados';
      toast.error(message);
      return { success: false, data: [] };
    } finally {
      setLoading(false);
    }
  };

  // Obtener empleado por ID
  const obtenerEmpleado = async (id) => {
    if (!checkPermissions('obtener empleado')) {
      return { success: false, error: 'Sin permisos' };
    }

    setLoading(true);
    try {
      const response = await axiosAuth.get(`/empleados/${id}`);

      return { success: true, data: response.data };

    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener empleado';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Desactivar empleado
  const desactivarEmpleado = async (id) => {
    if (!checkPermissions('desactivar empleados')) {
      return { success: false, error: 'Sin permisos' };
    }

    setLoading(true);
    try {
      const response = await axiosAuth.delete(`/empleados/${id}`);

      toast.success('Empleado desactivado exitosamente');
      return { success: true, data: response.data };

    } catch (error) {
      const message = error.response?.data?.message || 'Error al desactivar empleado';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Validaciones
  const validarDatosEmpleado = (datos, esEdicion = false) => {
    const errores = [];

    if (!datos.nombre?.trim()) errores.push('El nombre es obligatorio');
    if (!datos.apellido?.trim()) errores.push('El apellido es obligatorio');
    if (!datos.usuario?.trim()) errores.push('El usuario es obligatorio');
    if (!datos.rol) errores.push('El rol es obligatorio');

    // En creación, la contraseña es obligatoria
    if (!esEdicion && (!datos.password || datos.password.length < 6)) {
      errores.push('La contraseña debe tener al menos 6 caracteres');
    }

    // En edición, validar solo si se proporcionó
    if (esEdicion && datos.password && datos.password.length > 0 && datos.password.length < 6) {
      errores.push('La contraseña debe tener al menos 6 caracteres');
    }

    if (datos.usuario && datos.usuario.length > 0) {
      if (datos.usuario.length < 3 || datos.usuario.length > 20) {
        errores.push('El usuario debe tener entre 3-20 caracteres');
      }
      if (!/^[a-zA-Z0-9_]+$/.test(datos.usuario)) {
        errores.push('El usuario solo puede contener letras, números y guión bajo');
      }
    }

    if (datos.email && datos.email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
      errores.push('El formato del email no es válido');
    }

    if (datos.dni && datos.dni.length > 0 && !/^\d+$/.test(datos.dni)) {
      errores.push('El DNI debe contener solo números');
    }

    if (datos.telefono && datos.telefono.length > 0 && !/^\d+$/.test(datos.telefono)) {
      errores.push('El teléfono debe contener solo números');
    }

    return errores;
  };

  return {
    loading,
    user,
    isManager,
    crearEmpleado,
    actualizarEmpleado,
    buscarEmpleados,
    listarEmpleados,
    obtenerEmpleado,
    desactivarEmpleado,
    validarDatosEmpleado,
    checkPermissions
  };
};