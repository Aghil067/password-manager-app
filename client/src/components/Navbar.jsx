import React from "react";

const Navbar = () => {
  return (
    <nav className="bg-black text-pink-500 p-4 shadow-lg border-b border-pink-900">
      <div className="container mx-auto flex justify-center">
        <div className="logo font-bold text-xl md:text-2xl flex items-center">
          <span className="text-pink-400">&lt;</span>
          <span className="text-pink-300">Pass</span>
          <span className="text-pink-500">Manager</span>
          <span className="text-pink-400">/&gt;</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
