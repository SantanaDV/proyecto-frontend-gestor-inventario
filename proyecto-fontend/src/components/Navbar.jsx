import React, { useState } from "react";
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link, useLocation } from "react-router-dom";
import LogoutButton from "../utilities/auth";
import Modal from "./Modal";

const navigation = [
  { name: "Inicio", href: "/home" },
  { name: "Almacén", href: "/almacen" },
  { name: "Inventario", href: "/inventario" },
  { name: "Tareas", href: "/tareas" },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const location = useLocation();
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "");
  const [modalOpen, setModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState(userName);

  const handleUpdateUserName = async () => {
    const token = localStorage.getItem("authToken");
    const email = localStorage.getItem("userEmail");
    if (!email || !token) {
      return alert("Email o token no encontrados.");
    }

    try {
      const res = await fetch(`http://localhost:8080/api/usuario/modificar?email=${email}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre: newUserName.trim() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log("Respuesta del servidor:", data);

      if (data.nombre && data.nombre === newUserName.trim()) {
        localStorage.setItem("userName", data.nombre);
        setUserName(data.nombre);
        setModalOpen(false);
      } else {
        alert("La API no devolvió el nombre actualizado.");
      }
    } catch (err) {
      console.error("Error al modificar el nombre:", err);
      alert("Error al actualizar el nombre. Intenta de nuevo.");
    }
  };

  return (
    <>
      <Disclosure as="nav" className="bg-white">
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
              <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:outline-none focus:ring-inset">
                <span className="sr-only">Open main menu</span>
                <Bars3Icon className="block h-6 w-6 group-data-open:hidden" aria-hidden="true" />
                <XMarkIcon className="hidden h-6 w-6 group-data-open:block" aria-hidden="true" />
              </DisclosureButton>
            </div>
            <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
              <div className="flex shrink-0 items-center">
                <img src="logo.png" alt="Your Company" className="h-8 w-auto" />
              </div>
              <div className="hidden sm:ml-6 sm:block">
                <div className="flex space-x-4">
                  {navigation.map(item => (
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
              <Menu as="div" className="relative ml-3">
                <MenuButton className="flex rounded-full bg-gray-800 text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                  <span className="text-white px-4 py-2">{userName}</span>
                </MenuButton>
                <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5">
                  <MenuItem>
                    <button className="block px-4 py-2 text-sm text-black" onClick={() => setModalOpen(true)}>
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
            {navigation.map(item => (
              <DisclosureButton
                key={item.name}
                as="a"
                href={item.href}
                className={classNames(
                  location.pathname === item.href
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover=text-white",
                  "block rounded-md px-3 py-2 text-base font-medium"
                )}
              >
                {item.name}
              </DisclosureButton>
            ))}
          </div>
        </DisclosurePanel>
      </Disclosure>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleUpdateUserName}
        newUserName={newUserName}
        setNewUserName={setNewUserName}
      />
    </>
  );
}