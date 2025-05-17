

import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
    <nav className="bg-gray-100 shadow-md fixed w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold text-[#025266]">LeadTrack</span>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">

                <NavLink to='/' className="text-gray-700 hover:text-blue-600 ml-[230px] px-3 py-2">Home</NavLink>
                <NavLink to="/about" className="text-gray-700 hover:text-blue-600 px-3 py-2">About</NavLink>
               <NavLink to="/services" className="text-gray-700 hover:text-blue-600 px-3 py-2">Services</NavLink>
               <NavLink to="/contact" className="text-gray-700 hover:text-blue-600 px-3 py-2">Contact</NavLink>


            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <NavLink to={"/login"}>
              <button className="px-6 py-2 border bg-[#0b5a6e] text-[white] rounded-md">Login</button>
            </NavLink>
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 focus:outline-none"
              >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 ">

                <NavLink to='/Herosection' className="text-gray-700 hover:text-blue-600 px-3 py-2">Home</NavLink>
                <NavLink to="/about" className="text-gray-700 hover:text-blue-600 px-3 py-2">About</NavLink>
               <NavLink to="/services" className="text-gray-700 hover:text-blue-600 px-3 py-2">Services</NavLink>
               <NavLink to='/contact' className="text-gray-700 hover:text-blue-600 px-3 py-2">Contact</NavLink>


          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <NavLink to="/login">
                <button className="w-full px-4 py-2 border bg-[#0b5a6e] text-white rounded-md">Login</button>
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </nav>
    <Outlet/>
      </>
  );
};

export default Navbar



