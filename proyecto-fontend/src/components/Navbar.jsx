import React, { useState } from "react";
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import LogoutButton from "../utilities/auth";
import Modal from "./Modal"; // Importamos el componente Modal
import useApi from "../utilities/apiComunicator";

const navigation = [
  { name: "Inicio", href: "/home", current: true },
  { name: "Almacen", href: "/almacen", current: false },
  { name: "Inventario", href: "/inventario", current: false },
  { name: "Tareas", href: "/tareas", current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const { data } = useApi("login", false);
  const location = useLocation();
  const userName = localStorage.getItem("userName"); // Leer el nombre del usuario desde el localStorage
  const [modalOpen, setModalOpen] = useState(false); // Estado para abrir/cerrar la modal
  const [newUserName, setNewUserName] = useState(userName || ""); // Estado para almacenar el nuevo nombre

  const handleChangeUserName = () => {
    const token = localStorage.getItem("authToken");
    const email = localStorage.getItem("userEmail"); // Obtén el email correctamente desde localStorage
  
    if (!email || !token) {
      console.error("No se encontró email o token en localStorage.");
      return;
    }
  
    fetch(`http://localhost:8080/api/usuario/modificar?email=${email}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nombre: newUserName }), // Enviar el nuevo nombre
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          localStorage.setItem("userName", newUserName); // Guardar el nuevo nombre en localStorage
          setModalOpen(false); // Cerrar la modal
        } else {
          alert("Error al actualizar el nombre.");
        }
      })
      .catch((err) => {
        console.error("Error al modificar el nombre:", err);
        alert("Error al actualizar el nombre.");
      });
  };

  return (
    <>
      <Disclosure as="nav" className="bg-white">
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
              {/* Mobile menu button */}
              <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:outline-hidden focus:ring-inset">
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open main menu</span>
                <Bars3Icon
                  aria-hidden="true"
                  className="block size-6 group-data-open:hidden"
                />
                <XMarkIcon
                  aria-hidden="true"
                  className="hidden size-6 group-data-open:block"
                />
              </DisclosureButton>
            </div>
            <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
              <div className="flex shrink-0 items-center">
                <img alt="Your Company" src="logo.png" className="h-8 w-auto" />
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
                        "rounded-md px-3 py-2 text-sm font-medium"
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
              {/* Profile dropdown */}
              <Menu as="div" className="relative ml-3">
                <div>
                  <MenuButton className="relative flex rounded-full bg-gray-800 text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                    <span className="text-white px-4 py-2">{userName}</span>
                  </MenuButton>
                </div>
                <MenuItems
                  transition
                  className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 ring-1 shadow-lg ring-black/5"
                >
                  <MenuItem>
                    <button
                      className="block px-4 py-2 text-sm text-black"
                      onClick={() => setModalOpen(true)} // Abre la modal
                    >
                      Modificar Usuario
                    </button>
                  </MenuItem>
                  <MenuItem>
                    <LogoutButton />
                  </MenuItem>
                </MenuItems>
              </Menu>
            </div>
          </div>
        </div>

        <DisclosurePanel className="sm:hidden">
          <div className="space-y-1 px-2 pt-2 pb-3">
            {navigation.map((item) => (
              <DisclosureButton
                key={item.name}
                as="a"
                href={item.href}
                aria-current={item.current ? "page" : undefined}
                className={classNames(
                  item.current
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white",
                  "block rounded-md px-3 py-2 text-base font-medium"
                )}
              >
                {item.name}
              </DisclosureButton>
            ))}
          </div>
        </DisclosurePanel>
      </Disclosure>

      {/* Modal para modificar el nombre del usuario */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleChangeUserName}
        newUserName={newUserName}
        setNewUserName={setNewUserName} // Se pasa la función setNewUserName a Modal
      />
    </>
  );
}
