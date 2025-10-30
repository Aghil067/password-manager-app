import React from "react";

const Navbar = () => {
  return (
    <nav className="bg-black text-pink-500 py-4 px-6 shadow-lg border-b border-pink-900">
      <div className="container mx-auto flex justify-center items-center">
        {/* Centered Logo */}
        <div className="logo font-extrabold text-2xl flex items-center space-x-1">
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
