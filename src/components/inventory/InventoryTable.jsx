function getCategoryIcon(cat) {
  switch (cat?.toLowerCase()) {
    case 'rostro': return 'fa-face-smile';
    case 'ojos': return 'fa-eye';
    case 'labios': return 'fa-lips';
    case 'cuidado_piel': return 'fa-leaf';
    default: return 'fa-box';
  }
}

function InventoryTable({ productos, onEliminar, onEditar, onVerDetalle }) {
  if (productos.length === 0) {
    return <p className="text-textMuted text-sm py-8 text-center bg-white">No se encontraron productos en el inventario.</p>
  }

  const formatMoneda = (n) => `$${Number(n || 0).toLocaleString('es-CO')}`

  return (
    <div className="overflow-x-auto bg-white rounded-t-xl">
      <table className="w-full text-sm text-left">
        <thead className="bg-white border-b border-gray-100">
          <tr className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
            <th className="py-4 px-4 font-bold w-16 text-center">Foto</th>
            <th className="py-4 px-4 font-bold">Producto</th>
            <th className="py-4 px-4 font-bold">Categoría</th>
            <th className="py-4 px-4 font-bold text-center">Stock</th>
            <th className="py-4 px-4 font-bold text-right text-emerald-600">Precio Venta</th>
            <th className="py-4 px-4 font-bold text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => {
            const stockBajo = p.cantidad <= 2
            return (
              <tr 
                key={p.id} 
                className="border-b border-gray-50 hover:bg-primaryLt/30 transition-colors cursor-pointer group"
                onClick={() => onVerDetalle(p)}
              >
                <td className="py-3 px-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden mx-auto flex items-center justify-center">
                    {p.imagenUrl ? (
                      <img src={p.imagenUrl} alt={p.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <i className="fa-solid fa-image text-gray-300"></i>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <p className="font-bold text-gray-800 group-hover:text-primary transition-colors">{p.nombre}</p>
                  <p className="text-[10px] text-gray-400 font-medium">
                    {p.marca} {p.tono && ` - ${p.tono}`}
                  </p>
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-100/80 text-gray-500 text-xs font-medium">
                    <i className={`fa-solid ${getCategoryIcon(p.categoria)} text-[10px]`}></i>
                    <span className="capitalize">{p.categoria?.replace('_', ' ')}</span>
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`font-bold ${stockBajo ? 'text-amber-600' : 'text-gray-600'}`}>
                    {p.cantidad}
                  </span>
                  <span className="text-gray-400 text-xs ml-1">{p.unidad}</span>
                  {stockBajo && p.cantidad > 0 && (
                    <p className="text-[9px] text-amber-500 font-semibold mt-0.5">Stock bajo</p>
                  )}
                  {p.cantidad === 0 && (
                    <p className="text-[9px] text-red-500 font-semibold mt-0.5">Agotado</p>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="font-bold text-emerald-600 text-base">{formatMoneda(p.precioVenta)}</span>
                </td>
                <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center gap-1">
                    <button 
                      onClick={() => onVerDetalle(p)}
                      className="w-7 h-7 rounded flex items-center justify-center text-primary hover:bg-primaryLt transition-colors"
                      title="Ver historial de precios"
                    >
                      <i className="fa-solid fa-clock-rotate-left text-xs"></i>
                    </button>
                    <button 
                      onClick={() => onEditar(p)} 
                      className="w-7 h-7 rounded flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Editar Producto"
                    >
                      <i className="fa-solid fa-pen text-xs"></i>
                    </button>
                    <button 
                      onClick={() => onEliminar(p.id)} 
                      className="w-7 h-7 rounded flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                      title="Eliminar Producto"
                    >
                      <i className="fa-solid fa-trash text-xs"></i>
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
export default InventoryTable
