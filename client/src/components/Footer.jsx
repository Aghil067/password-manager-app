import React from 'react';
import { FaGithub, FaTwitter, FaLock, FaHeart } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-pink-600 py-8 border-t border-pink-900">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-8">
          {/* Brand Section */}
          <div className="flex flex-col items-center md:items-start space-y-2">
            <div className="text-2xl font-extrabold flex items-center">
              <span className="text-pink-400">&lt;</span>
              <span className="text-pink-300">Pass</span>
              <span className="text-pink-500">Manager</span>
              <span className="text-pink-400">/&gt;</span>
            </div>
            
            <p className="text-sm text-pink-400 flex items-center">
              <FaLock className="mr-1" /> Your secure password vault
            </p>
            
            <div className="flex space-x-4 text-pink-500">
              <a 
                href="https://github.com/yourusername/passmanager" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-pink-300 transition-colors"
                aria-label="GitHub"
              >
                <FaGithub size={18} />
              </a>
              <a 
                href="https://twitter.com/yourhandle" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-pink-300 transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter size={18} />
              </a>
            </div>
          </div>

          {/* Links Section */}
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col space-y-2">
              <h3 className="font-bold text-pink-400">Product</h3>
              <a href="#" className="text-sm hover:text-pink-300 transition-colors">Features</a>
              <a href="#" className="text-sm hover:text-pink-300 transition-colors">Security</a>
              <a href="#" className="text-sm hover:text-pink-300 transition-colors">Pricing</a>
            </div>
            
            <div className="flex flex-col space-y-2">
              <h3 className="font-bold text-pink-400">Company</h3>
              <a href="#" className="text-sm hover:text-pink-300 transition-colors">About</a>
              <a href="#" className="text-sm hover:text-pink-300 transition-colors">Blog</a>
              <a href="#" className="text-sm hover:text-pink-300 transition-colors">Careers</a>
            </div>
          </div>

          {/* Legal Section */}
          <div className="flex flex-col items-center md:items-end space-y-2">
            <div className="flex space-x-4">
              <a href="#" className="text-sm hover:text-pink-300 transition-colors">Privacy</a>
              <a href="#" className="text-sm hover:text-pink-300 transition-colors">Terms</a>
              <a href="#" className="text-sm hover:text-pink-300 transition-colors">Contact</a>
            </div>
            
            <p className="text-xs text-pink-500 flex items-center">
              Made with <FaHeart className="mx-1 text-pink-400" /> © {currentYear} PassManager
            </p>
            
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;