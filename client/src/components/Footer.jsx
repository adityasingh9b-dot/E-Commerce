import React from 'react'
import { FaWhatsapp } from "react-icons/fa"; // Changed to Whatsapp icon

const Footer = () => {
  return (
    <footer className='border-t bg-white'>
        <div className='container mx-auto p-4 text-center flex flex-col lg:flex-row lg:justify-between items-center gap-4'>
            <p className='text-gray-600 text-sm'>© All Rights Reserved 2024.</p>

            <div className='flex items-center gap-2 justify-center'>
                <p className='text-sm font-medium text-gray-500'>Need Help?</p>
                <a 
                    href='https://wa.me/919369250645?text=Hello%20Aditya!%20,%20I%20need%20help%20with%20my%20order.'
                    target="_blank"
                    rel="noopener noreferrer"
                    className='flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-full hover:bg-green-600 transition-all text-sm font-semibold shadow-sm'
                >
                    <FaWhatsapp className='text-lg'/>
                    Contact Support
                </a>
            </div>
        </div>
    </footer>
  )
}

export default Footer

