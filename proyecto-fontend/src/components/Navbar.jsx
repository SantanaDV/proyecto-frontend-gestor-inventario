"use client"

/**
 * @fileoverview Componente de barra de navegación
 * Muestra los enlaces de navegación y opciones de usuario
 */

import { useState } from "react"
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react"
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline"
import { Link, useLocation } from "react-router-dom"
import { useAuthContext } from "../context/AuthContext"
import Modal from "./Modal"

// Enlaces de navegación
const navigation = [
  { name: "Inicio", href: "/home" },
  { name: "Almacén", href: "/almacen" },
  { name: "Inventario", href: "/inventario" },
  { name: "Tareas", href: "/tareas" },
]

/**
 * Combina clases condicionales
 * @param {string[]} classes - Clases a combinar
 * @returns {string} Clases combinadas
 */
function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

/**
 * Componente de barra de navegación
 * @returns {JSX.Element} Componente renderizado
 */
export default function Navbar() {
  const location = useLocation()
  const { user, updateUserName, logout } = useAuthContext()
  const [modalOpen, setModalOpen] = useState(false)
  const [newUserName, setNewUserName] = useState(user?.name || "")

  /**
   * Maneja la actualización del nombre de usuario
   */
  const handleUpdateUserName = async () => {
    if (!newUserName.trim()) {
      return alert("El nombre no puede estar vacío.")
    }

    const success = await updateUserName(newUserName.trim())

    if (success) {
      setModalOpen(false)
    } else {
      alert("Error al actualizar el nombre. Intenta de nuevo.")
    }
  }

  return (
    <>
      <Disclosure as="nav" className="bg-white">
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            {/* Botón de menú móvil */}
            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
              <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:outline-none focus:ring-inset">
                <span className="sr-only">Abrir menú principal</span>
                <Bars3Icon className="block h-6 w-6 group-data-open:hidden" aria-hidden="true" />
                <XMarkIcon className="hidden h-6 w-6 group-data-open:block" aria-hidden="true" />
              </DisclosureButton>
            </div>

            {/* Logo y enlaces de navegación */}
            <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
              <div className="flex shrink-0 items-center">
                <img src="logo.png" alt="Qualica-RD" className="h-8 w-auto" />
              </div>
              <div className="hidden sm:ml-6 sm:block">
                <div className="flex space-x-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={classNames(
                        location.pathname === item.href
                          ? "bg-red-900 text-white"
                          : "text-black hover:bg-red-900 hover:text-white",
                        "rounded-md px-3 py-2 text-sm font-medium",
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Menú de usuario */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
              <Menu as="div" className="relative ml-3">
                <MenuButton className="flex rounded-full bg-gray-800 text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                  <span className="text-white px-4 py-2">{user?.name || "Usuario"}</span>
                </MenuButton>
                <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5">
                  <MenuItem>
                    <button className="block px-4 py-2 text-sm text-black" onClick={() => setModalOpen(true)}>
                      Modificar Usuario
                    </button>
                  </MenuItem>
                  <MenuItem>
                    <button
                      className="block px-4 py-2 text-sm text-black data-focus:bg-red-200 data-focus:outline-hidden"
                      onClick={logout}
                    >
                      Cerrar Sesión
                    </button>
                  </MenuItem>
                </MenuItems>
              </Menu>
            </div>
          </div>
        </div>

        {/* Menú móvil */}
        <DisclosurePanel className="sm:hidden">
          <div className="space-y-1 px-2 pt-2 pb-3">
            {navigation.map((item) => (
              <DisclosureButton
                key={item.name}
                as="a"
                href={item.href}
                className={classNames(
                  location.pathname === item.href
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover=text-white",
                  "block rounded-md px-3 py-2 text-base font-medium",
                )}
              >
                {item.name}
              </DisclosureButton>
            ))}
          </div>
        </DisclosurePanel>
      </Disclosure>

      {/* Modal para modificar nombre de usuario */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleUpdateUserName}
        newUserName={newUserName}
        setNewUserName={setNewUserName}
      />
    </>
  )
}
