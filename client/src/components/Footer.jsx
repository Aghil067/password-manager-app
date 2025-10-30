import React from 'react';
import { FaGithub, FaTwitter, FaLock, FaHeart } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-pink-600 py-10 border-t border-pink-900">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start text-center lg:text-left gap-10">

          {/* Brand Section */}
          <div className="flex flex-col items-center lg:items-start space-y-3 w-full sm:w-auto">
            <div className="text-3xl font-extrabold flex items-center justify-center">
              <span className="text-pink-400">&lt;</span>
              <span className="text-pink-300">Pass</span>
              <span className="text-pink-500">Manager</span>
              <span className="text-pink-400">/&gt;</span>
            </div>

            <p className="text-sm text-pink-400 flex items-center justify-center lg:justify-start">
              <FaLock className="mr-1" /> Your secure password vault
            </p>

            <div className="flex space-x-5 text-pink-500 justify-center lg:justify-start">
              <a
                href="https://github.com/yourusername/passmanager"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-300 transition-colors"
                aria-label="GitHub"
              >
                <FaGithub size={20} />
              </a>
              <a
                href="https://twitter.com/yourhandle"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-300 transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter size={20} />
              </a>
            </div>
          </div>

          {/* Links Section */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 w-full sm:w-auto">
            <div className="flex flex-col space-y-2">
              <h3 className="font-bold text-pink-400 text-lg">Product</h3>
              <a href="#" className="text-sm hover:text-pink-300 transition-colors">Features</a>
              <a href="#" className="text-sm hover:text-pink-300 transition-colors">Security</a>
              <a href="#" className="text-sm hover:text-pink-300 transition-colors">Pricing</a>
            </div>

            <div className="flex flex-col space-y-2">
              <h3 className="font-bold text-pink-400 text-lg">Company</h3>
              <a href="#" className="text-sm hover:text-pink-300 transition-colors">About</a>
              <a href="#" className="text-sm hover:text-pink-300 transition-colors">Blog</a>
              <a href="#" className="text-sm hover:text-pink-300 transition-colors">Careers</a>
            </div>

            <div className="flex flex-col space-y-2">
              <h3 className="font-bold text-pink-400 text-lg">Support</h3>
              <a href="#" className="text-sm hover:text-pink-300 transition-colors">Help</a>
              <a href="#" className="text-sm hover:text-pink-300 transition-colors">FAQs</a>
              <a href="#" className="text-sm hover:text-pink-300 transition-colors">Contact</a>
            </div>
          </div>

          {/* Legal Section */}
          <div className="flex flex-col items-center lg:items-end space-y-2 w-full sm:w-auto">
            <div className="flex flex-wrap justify-center lg:justify-end space-x-4">
              <a href="#" className="text-sm hover:text-pink-300 transition-colors">Privacy</a>
              <a href="#" className="text-sm hover:text-pink-300 transition-colors">Terms</a>
              <a href="#" className="text-sm hover:text-pink-300 transition-colors">Contact</a>
            </div>

            <p className="text-xs text-pink-500 flex items-center justify-center lg:justify-end">
              Made with <FaHeart className="mx-1 text-pink-400" /> © {currentYear} PassManager
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
