import React from 'react'
import { FaWhatsapp, FaDownload } from "react-icons/fa"; 

const Footer = () => {
  return (
    <footer className='border-t bg-white sticky bottom-0 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]'>
        <div className='container mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-3'>
            
            {/* Copyright - Reduced size for mobile */}
            <p className='text-gray-500 text-[10px] md:text-xs order-3 md:order-1'>
                © 2024 AdiMart.
            </p>

            {/* Main Actions Container */}
            <div className='flex flex-wrap items-center justify-center gap-2 order-1 md:order-2'>
                
                {/* INSTALL APP BUTTON (New) */}
                <a 
                    href='https://drive.google.com/uc?export=download&id=1b3yoVSZiVGeN0Sqs0BrxZFDta9smcmSj'
                    className='flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-all text-xs font-bold shadow-md active:scale-95'
                >
                    <FaDownload className='text-xs'/>
                    INSTALL APP
                </a>

                {/* HELP SECTION */}
                <div className='flex items-center gap-2 ml-1 border-l pl-2 border-gray-200'>
                    <span className='text-[10px] font-bold text-gray-400 hidden sm:block'>NEED HELP?</span>
                    <a 
                        href='https://wa.me/919369250645?text=Hello%20Aditya!%20I%20need%20help%20with%20my%20order.'
                        target="_blank"
                        rel="noopener noreferrer"
                        className='flex items-center gap-1.5 bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-all text-xs font-bold shadow-md active:scale-95'
                    >
                        <FaWhatsapp className='text-base'/>
                        SUPPORT
                    </a>
                </div>
            </div>
        </div>
    </footer>
  )
}

export default Footer
