import React, { createContext, useContext } from 'react';
import useAuth from '../hooks/useAuth';

// ✅ Crear contexto
const AuthContext = createContext();

// ✅ Provider con protección SSR CORREGIDA
export function AuthProvider({ children }) {
  // ✅ SIEMPRE llamar useAuth (cumple rules of hooks)
  const auth = useAuth();
  
  // ✅ PROTECCIÓN SSR: Sobrescribir valores durante SSR
  const safeAuth = typeof window !== 'undefined' ? auth : {
    user: null,
    loading: true,
    login: () => Promise.resolve(),
    logout: () => {},
    hasRole: () => false,
    isAuthenticated: false
  };

  return (
    <AuthContext.Provider value={safeAuth}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ Hook para usar el contexto con protección SSR
export function useAuthContext() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext debe ser usado dentro de un AuthProvider');
  }
  
  return context;
}

// ✅ HOC para proteger rutas con verificación de hydration
export function withAuth(Component, requiredRoles = []) {
  return function AuthenticatedComponent(props) {
    const { user, loading, hasRole } = useAuthContext();

    // ✅ PROTECCIÓN SSR: No renderizar contenido sensible durante SSR
    if (typeof window === 'undefined') {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3">Cargando...</span>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3">Cargando...</span>
        </div>
      );
    }

    if (!user) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Acceso no autorizado
            </h2>
            <p className="text-gray-600">
              Por favor, inicie sesión para continuar
            </p>
          </div>
        </div>
      );
    }

    if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Permisos insuficientes
            </h2>
            <p className="text-gray-600">
              No tienes permisos para acceder a esta página
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Roles requeridos: {requiredRoles.join(', ')}
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}