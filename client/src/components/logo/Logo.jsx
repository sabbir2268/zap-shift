import React from 'react';
import logo from '../../assets/logo.png'; // Adjust the path to your logo image

const Logo = () => {
    return (
        <div className="flex items-end ">
            <img className="w-10 h-10" src={logo} alt="Logo" />
            <h1 className="text-2xl font-bold text-[var(--secondary)] ml-2">
              ZapShift
            </h1>
          </div>
    );
};

export default Logo;