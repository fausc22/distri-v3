import { usePedidosContext } from '../../context/PedidosContext';

function ControlCantidad({ cantidad, onCantidadChange }) {
  const formatearCantidad = (cantidad) => {
    const cantidadNum = parseFloat(cantidad);
    return cantidadNum % 1 === 0 ? cantidadNum.toString() : cantidadNum.toFixed(1);
  };

  const incrementar = () => {
    const nuevaCantidad = parseFloat(cantidad) + 0.5;
    onCantidadChange(nuevaCantidad);
  };

  const decrementar = () => {
    const nuevaCantidad = Math.max(0.5, parseFloat(cantidad) - 0.5);
    onCantidadChange(nuevaCantidad);
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      <button 
        className={`w-6 h-6 rounded flex items-center justify-center ${
          cantidad <= 0.5 
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
            : 'bg-gray-300 hover:bg-gray-400 text-black'
        }`}
        onClick={decrementar}
        disabled={cantidad <= 0.5}
      >
        -
      </button>
      <span className="mx-2 font-medium min-w-[40px] text-center">
        {formatearCantidad(cantidad)}
      </span>
      <button 
        className="bg-gray-300 hover:bg-gray-400 text-black w-6 h-6 rounded flex items-center justify-center"
        onClick={incrementar}
      >
        +
      </button>
    </div>
  );
}

function TablaEscritorio({ productos, onActualizarCantidad, onEliminar }) {
  const formatearCantidad = (cantidad) => {
    const cantidadNum = parseFloat(cantidad);
    return cantidadNum % 1 === 0 ? cantidadNum.toString() : cantidadNum.toFixed(1);
  };

  return (
    <div className="hidden md:block overflow-x-auto bg-white rounded shadow text-black">
      <table className="w-full">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3 text-left">Producto</th>
            <th className="p-3 text-center">Unidad</th>
            <th className="p-3 text-center">Cantidad</th>
            <th className="p-3 text-center">Precio Unit.</th>
            <th className="p-3 text-center">IVA %</th>
            <th className="p-3 text-center">Subtotal</th>
            <th className="p-3 text-center">Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {productos.length > 0 ? (
            productos.map((prod, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  <div>
                    <div className="font-medium">{prod.nombre}</div>
                    {prod.id && (
                      <div className="text-sm text-gray-500">ID: {prod.id}</div>
                    )}
                  </div>
                </td>
                <td className="p-3 text-center">{prod.unidad_medida || 'Unidad'}</td>
                <td className="p-3 text-center">
                  <div className="flex flex-col items-center">
                    <ControlCantidad
                      cantidad={prod.cantidad}
                      onCantidadChange={(nuevaCantidad) => onActualizarCantidad(idx, nuevaCantidad)}
                    />
                    
                  </div>
                </td>
                <td className="p-3 text-center font-medium">${Number(prod.precio).toFixed(2)}</td>
                <td className="p-3 text-center">{prod.porcentaje_iva}%</td>
                <td className="p-3 text-center font-bold text-green-600">${prod.subtotal.toFixed(2)}</td>
                <td className="p-3 text-center">
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors"
                    onClick={() => onEliminar(idx)}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="p-8 text-center text-gray-500">
                No hay productos agregados al pedido
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function TarjetasMovil({ productos, onActualizarCantidad, onEliminar }) {
  const formatearCantidad = (cantidad) => {
    const cantidadNum = parseFloat(cantidad);
    return cantidadNum % 1 === 0 ? cantidadNum.toString() : cantidadNum.toFixed(1);
  };

  return (
    <div className="md:hidden space-y-4">
      {productos.length > 0 ? (
        productos.map((prod, idx) => (
          <div key={idx} className="bg-white p-4 rounded-lg shadow border">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-lg">{prod.nombre}</h4>
                {prod.id && (
                  <p className="text-sm text-gray-500">ID: {prod.id}</p>
                )}
                <p className="text-sm text-gray-600">Unidad: {prod.unidad_medida || 'Unidad'}</p>
              </div>
              <button
                className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded ml-2 transition-colors"
                onClick={() => onEliminar(idx)}
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div>
                  <span className="text-gray-600 text-sm">Cantidad: {formatearCantidad(prod.cantidad)}</span>
                  <div className="mt-1">
                    <ControlCantidad
                      cantidad={prod.cantidad}
                      onCantidadChange={(nuevaCantidad) => onActualizarCantidad(idx, nuevaCantidad)}
                    />
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Precio unitario:</span>
                  <div className="font-medium">${Number(prod.precio).toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">IVA:</span>
                  <div className="font-medium">{prod.porcentaje_iva}%</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <span className="text-gray-600 text-sm">Subtotal (sin IVA):</span>
                  <div className="font-bold text-green-600 text-lg">${prod.subtotal.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
          <div className="text-4xl mb-2">📋</div>
          <p>No hay productos agregados al pedido</p>
        </div>
      )}
    </div>
  );
}

export default function ProductosCarrito() {
  const { productos, updateCantidad, removeProducto, subtotal, totalIva, total } = usePedidosContext();

  const handleActualizarCantidad = (index, nuevaCantidad) => {
    // Convertir a float y redondear a medios
    let cantidadFloat = parseFloat(nuevaCantidad);
    if (isNaN(cantidadFloat)) cantidadFloat = 0.5;
    
    // Redondear a 0.5 más cercano
    cantidadFloat = Math.round(cantidadFloat * 2) / 2;
    
    // Aplicar mínimo de 0.5
    const cantidadValida = Math.max(0.5, cantidadFloat);
    
    updateCantidad(index, cantidadValida);
  };

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Productos del Pedido</h3>
      
      <TablaEscritorio
        productos={productos}
        onActualizarCantidad={handleActualizarCantidad}
        onEliminar={removeProducto}
      />
      
      <TarjetasMovil
        productos={productos}
        onActualizarCantidad={handleActualizarCantidad}
        onEliminar={removeProducto}
      />
      
      {/* Resumen de totales */}
      {productos.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-semibold text-lg mb-3 text-gray-800">Resumen del Pedido</h4>
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Subtotal (sin IVA):</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">IVA Total:</span>
              <span className="font-medium">${totalIva.toFixed(2)}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold">Total (con IVA):</span>
              <span className="font-bold text-green-600">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}