import React from 'react'

export default function Header() {
  return (
    <section className="bg-red-700 text-white py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold sm:text-5xl">
            Bienvenido a Qualica-RD
          </h1>
          <p className="mt-4 text-lg text-gray-300">
            Aquí encontrarás todo lo que necesitas para gestionar tu negocio de manera eficiente.
          </p>
          <a
            href="#"
            className="mt-8 inline-block rounded-lg bg-white py-3 px-6 text-lg font-semibold text-red-700 hover:bg-gray-200"
          >
            Empezar ahora
          </a>
        </div>
      </div>
    </section>
  )
}
