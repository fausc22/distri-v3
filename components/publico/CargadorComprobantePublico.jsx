import { useState } from 'react';
import { MdCloudUpload, MdCheckCircle } from 'react-icons/md';

const CargadorComprobantePublico = ({ token, onSubidaExitosa, onError }) => {
  const [archivo, setArchivo] = useState(null);
  const [archivoPreview, setArchivoPreview] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [completado, setCompletado] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const validarArchivo = (file) => {
    // Validar tamaño (10MB máximo)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { valido: false, mensaje: 'El archivo es demasiado grande. Máximo 10MB permitido.' };
    }
    
    // Validar tipo de archivo
    const allowedTypes = [
      'image/jpeg', 
      'image/jpg', 
      'image/png', 
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return { valido: false, mensaje: 'Tipo de archivo no válido. Solo se permiten: JPG, PNG, PDF, DOC, DOCX' };
    }
    
    return { valido: true };
  };

  const procesarArchivo = (file) => {
    const validacion = validarArchivo(file);
    
    if (!validacion.valido) {
      onError(validacion.mensaje);
      return;
    }
    
    setArchivo(file);
    
    // Generar preview si es una imagen
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setArchivoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setArchivoPreview(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      procesarArchivo(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      procesarArchivo(e.dataTransfer.files[0]);
    }
  };

  const subirComprobante = async () => {
    if (!archivo || !token) return;

    setSubiendo(true);
    
    try {
      const formData = new FormData();
      formData.append("comprobante", archivo);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comprobantes/publico/subir/${token}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setCompletado(true);
        setTimeout(() => {
          onSubidaExitosa();
        }, 2000);
      } else {
        onError(data.message || 'Error al subir el comprobante');
      }
      
    } catch (error) {
      console.error('Error subiendo comprobante:', error);
      onError('Error de conexión. Intente nuevamente más tarde.');
    } finally {
      setSubiendo(false);
    }
  };

  const limpiarArchivo = () => {
    setArchivo(null);
    setArchivoPreview(null);
  };

  const obtenerIconoArchivo = (tipo) => {
    if (tipo.startsWith('image/')) return '🖼️';
    if (tipo === 'application/pdf') return '📄';
    if (tipo.includes('document')) return '📝';
    return '📎';
  };

  if (completado) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-green-200 p-8 text-center">
        <MdCheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          ¡Comprobante subido exitosamente!
        </h3>
        <p className="text-gray-600 mb-4">
          Su comprobante ha sido recibido y asociado a la venta correctamente.
        </p>
        <p className="text-sm text-gray-500">
          Este enlace se ha desactivado automáticamente. Puede cerrar esta página.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        📤 Subir Comprobante de Pago
      </h3>

      {!archivo ? (
        // Zona de drop/upload
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            dragActive 
              ? 'border-purple-500 bg-purple-50' 
              : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('archivo-input').click()}
        >
          <input 
            id="archivo-input"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
          
          <MdCloudUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          
          <p className="text-lg font-medium text-gray-900 mb-2">
            Haga clic aquí o arrastre su archivo
          </p>
          
          <p className="text-sm text-gray-600 mb-4">
            Seleccione el comprobante de pago para esta venta
          </p>
          
          <p className="text-xs text-gray-500">
            Formatos: PDF, JPG, PNG, DOC, DOCX • Máximo: 10MB
          </p>
        </div>
      ) : (
        // Archivo seleccionado
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              {/* Preview o icono */}
              <div className="flex-shrink-0">
                {archivoPreview ? (
                  <img 
                    src={archivoPreview} 
                    alt="Vista previa" 
                    className="w-16 h-16 object-cover rounded border"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded border flex items-center justify-center text-2xl">
                    {obtenerIconoArchivo(archivo.type)}
                  </div>
                )}
              </div>
              
              {/* Info del archivo */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-purple-900 truncate">
                  {archivo.name}
                </p>
                <p className="text-sm text-purple-700">
                  Tamaño: {(archivo.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <p className="text-xs text-purple-600">
                  Tipo: {archivo.type}
                </p>
              </div>
              
              {/* Botón eliminar */}
              <button
                onClick={limpiarArchivo}
                className="flex-shrink-0 text-red-600 hover:text-red-800 text-sm font-medium"
              >
                ✕ Quitar
              </button>
            </div>
          </div>

          {/* Botón de subida */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={limpiarArchivo}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Cambiar Archivo
            </button>
            
            <button
              onClick={subirComprobante}
              disabled={subiendo}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                subiendo 
                  ? 'bg-gray-400 cursor-not-allowed text-white' 
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {subiendo ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Subiendo...
                </div>
              ) : (
                '📤 Subir Comprobante'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CargadorComprobantePublico;