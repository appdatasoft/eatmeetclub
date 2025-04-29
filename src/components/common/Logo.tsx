
import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <Link to="/" className={`flex items-center ${className}`}>
      <div className="flex items-center">
        <svg width="40" height="40" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
          {/* Outer circle */}
          <circle cx="100" cy="100" r="95" fill="#9FD7D9" fillOpacity="0.6" stroke="#008080" strokeWidth="10" />
          
          {/* Horizontal divider line */}
          <line x1="10" y1="100" x2="190" y2="100" stroke="#008080" strokeWidth="8" />
          
          {/* Heart */}
          <path d="M60,70 C60,50 80,50 90,60 C100,50 120,50 120,70 C120,90 90,110 90,110 C90,110 60,90 60,70Z" fill="#ff5f50" stroke="#008080" strokeWidth="5" />
          
          {/* Fork */}
          <path d="M140,40 L140,160" stroke="#272163" strokeWidth="15" strokeLinecap="round" />
          <path d="M120,40 L140,60" stroke="#272163" strokeWidth="15" strokeLinecap="round" />
          <path d="M140,60 L160,40" stroke="#272163" strokeWidth="15" strokeLinecap="round" />
        </svg>
        
        <div className="font-serif text-xl font-bold">
          <span className="text-[#008080]">EAT</span>
          <span className="text-[#ff5f50]">MEET</span>
          <span className="text-[#272163]">CLUB</span>
        </div>
      </div>
    </Link>
  );
};

export default Logo;
