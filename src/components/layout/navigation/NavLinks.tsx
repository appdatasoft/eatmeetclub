
import React from 'react';
import { Link } from 'react-router-dom';

const NavLinks = () => {
  // Navigation links that will be displayed in the navbar
  const links = [
    { name: 'Home', href: '/' },
    { name: 'Events', href: '/events' },
    { name: 'Venues', href: '/venues' },
    { name: 'How It Works', href: '/how-it-works' },
  ];

  return (
    <div className="hidden md:flex space-x-8">
      {links.map((link) => (
        <Link
          key={link.name}
          to={link.href}
          className="text-gray-700 hover:text-brand-500 font-medium transition-colors"
        >
          {link.name}
        </Link>
      ))}
    </div>
  );
};

export default NavLinks;
