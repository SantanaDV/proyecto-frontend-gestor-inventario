import React, { useState } from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };

  return (
    <>
   
    <header className="absolute left-0 top-0 z-20 flex w-full items-center">
      <div className="container">
        <div className="relative -mx-4 flex items-center justify-between">
          <div className="w-60 max-w-full px-4">
            <a href="/#" className="block w-full py-5">
              <img
                src="https://cdn.tailgrids.com/2.0/image/assets/images/logo/logo.svg"
                alt="logo"
                className="w-full dark:hidden"
              />
              <img
                src="https://cdn.tailgrids.com/2.0/image/assets/images/logo/logo-white.svg"
                alt="logo"
                className="w-full hidden dark:block"
              />
            </a>
          </div>
          <div className="flex w-full items-center justify-between px-4">
            <div>
              <button
                onClick={handleToggle}
                className={` ${open && "navbarTogglerActive"} absolute right-4 top-1/2 block -translate-y-1/2 rounded-lg px-3 py-[6px] ring-primary focus:ring-2 lg:hidden`}
              >
                <span className="relative my-[6px] block h-[2px] w-[30px] bg-body-color dark:bg-white"></span>
                <span className="relative my-[6px] block h-[2px] w-[30px] bg-body-color dark:bg-white"></span>
                <span className="relative my-[6px] block h-[2px] w-[30px] bg-body-color dark:bg-white"></span>
              </button>
              <nav
                className={`absolute right-4 top-full w-full max-w-[250px] rounded-lg bg-white px-6 py-5 shadow dark:bg-dark-2 lg:static lg:block lg:w-full lg:max-w-full lg:bg-transparent lg:shadow-none lg:dark:bg-transparent ${!open && "hidden"}`}
              >
                <ul className="block lg:flex">
                  <ListItem NavLink="/#">Home</ListItem>
                  <ListItem NavLink="/#">Payment</ListItem>
                  <ListItem NavLink="/#">About</ListItem>
                  <ListItem NavLink="/#">Blog</ListItem>
                </ul>
              </nav>
            </div>
            <div className="hidden justify-end pr-16 sm:flex lg:pr-0">
              <NavLink
                to="/#"
                className="px-7 py-3 text-base font-medium text-dark hover:text-primary dark:text-white"
              >
                Sign in
              </NavLink>
              <NavLink
                to="/#"
                className="rounded-lg bg-primary px-7 py-3 text-base font-medium text-white hover:bg-opacity-90"
              >
                Sign Up
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </header>
    </>
  );
};

export default Navbar;

const ListItem = ({ children, NavLink }) => {
  return (
    <li>
      <NavLink
        to={NavLink}
        className="flex py-2 text-base font-medium text-dark hover:text-primary dark:text-white lg:ml-10 lg:inline-flex"
      >
        {children}
      </NavLink>
    </li>
  );
};

