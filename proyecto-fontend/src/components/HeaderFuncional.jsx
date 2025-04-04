import React from 'react'

export default function HeaderAlmacen() {
  return (
    <section className="bg-red-700 text-white py-4">
  <div className="flex justify-between items-center px-8">
    <p>Funcionalidades</p>
    <div className="flex gap-4">
      <button className="mr-2 bg-white text-red-700 border border-red-700 px-4 py-1 rounded font-semibold hover:bg-gray-200 hover:text-red-900">
        Añadir
      </button>
      <button className="bg-white text-red-700 border border-red-700 px-4 py-1 rounded font-semibold hover:bg-gray-200 hover:text-red-900">
        Editar
      </button>
    </div>
  </div>
</section>


  )
}
