import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import CargadorComprobantePublico from '../../components/publico/CargadorComprobantePublico';

export default function ComprobantePagina() {
  const router = useRouter();
  const { token } = router.query;
  
  const [datosVenta, setDatosVenta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenValido, setTokenValido] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      verificarToken();
    }
  }, [token]);

  const verificarToken = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comprobantes/publico/verificar/${token}`);
      const data = await response.json();

      if (data.success && data.valido) {
        setTokenValido(true);
        setDatosVenta(data.venta);
      } else {
        setTokenValido(false);
        setError(data.message || 'El enlace no es válido o ha expirado');
      }
    } catch (err) {
      console.error('Error verificando token:', err);
      setError('Error de conexión. Intente nuevamente más tarde.');
      setTokenValido(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubidaExitosa = () => {
    setTokenValido(false);
    toast.success('¡Comprobante subido exitosamente!');
  };

  const handleError = (mensaje) => {
    setError(mensaje);
    toast.error(mensaje);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Head>
          <title>VERTIMAR | Cargando...</title>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        </Head>
        
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-600">Verificando enlace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>VERTIMAR | Cargar Comprobante</title>
        <meta name="description" content="Carga de comprobante de pago - VERTIMAR" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      {/* Header simple */}
      <div className="bg-purple-800 text-white py-8">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-2">VERTIMAR</h1>
          <p className="text-purple-200">Cargar Comprobante de Pago</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {!tokenValido || error ? (
          // Error o token inválido
          <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center">
            <div className="max-w-md mx-auto">
              <svg className="mx-auto h-16 w-16 text-red-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.002 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Enlace no válido
              </h2>
              
              <p className="text-gray-600 mb-6">
                {error || 'El enlace que está intentando acceder no es válido, ha expirado o ya fue utilizado.'}
              </p>
              
              <div className="space-y-3 text-sm text-gray-500">
                <p>• Los enlaces expiran después de 24 horas</p>
                <p>• Cada enlace solo se puede usar una vez</p>
                <p>• Si ya subió un comprobante, el enlace se desactiva</p>
              </div>
              
              <div className="mt-8">
                <p className="text-sm text-gray-500">
                  Si necesita ayuda, contacte a su vendedor en VERTIMAR
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Interfaz de carga
          <div className="space-y-6">
            {/* Información de la venta */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                📄 Información de la Venta
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Cliente:</p>
                  <p className="font-medium text-gray-900">{datosVenta.cliente_nombre}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Monto:</p>
                  <p className="font-bold text-lg text-green-600">
                    {new Intl.NumberFormat('es-AR', {
                      style: 'currency',
                      currency: 'ARS'
                    }).format(datosVenta.total)}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                Venta #{datosVenta.id} • {new Date(datosVenta.fecha).toLocaleDateString('es-AR')}
              </div>
            </div>

            {/* Componente de carga */}
            <CargadorComprobantePublico 
              token={token}
              onSubidaExitosa={handleSubidaExitosa}
              onError={handleError}
            />

            {/* Información adicional */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                📋 Instrucciones importantes:
              </h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Suba el comprobante de pago correspondiente a esta venta</p>
                <p>• Formatos aceptados: PDF, JPG, PNG, DOC, DOCX</p>
                <p>• Tamaño máximo: 10MB</p>
                <p>• Una vez subido, este enlace se desactivará automáticamente</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}