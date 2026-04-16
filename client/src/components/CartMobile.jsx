import React from 'react'
import { useGlobalContext } from '../provider/GlobalProvider'
import { FaCartShopping } from 'react-icons/fa6'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import { Link } from 'react-router-dom'
import { FaCaretRight } from "react-icons/fa";
import { useSelector } from 'react-redux'

const CartMobileLink = () => {
    const { totalPrice, totalQty } = useGlobalContext()
    const cartItem = useSelector(state => state.cartItem.cart)

  return (
    <>
        {
            cartItem[0] && (
            /* Fixed position ensures it floats OVER the footer */
            <div className='fixed bottom-0 left-0 right-0 p-3 z-[100] lg:hidden'>
                <div className='bg-green-700 px-4 py-3 rounded-xl text-white shadow-[0_-5px_20px_rgba(0,0,0,0.2)] flex items-center justify-between gap-3 border-t border-green-500 animate-bounce-subtle'>
                    
                    {/* Left Side: Items & Price */}
                    <div className='flex items-center gap-3'>
                        <div className='p-2 bg-green-600 rounded-lg shadow-inner'>
                            <FaCartShopping className='text-xl text-white'/>
                        </div>
                        <div className='flex flex-col'>
                            <p className='text-[10px] font-black uppercase tracking-widest opacity-90'>Your Cart</p>
                            <p className='text-sm font-black leading-none'>
                                {totalQty} items • {DisplayPriceInRupees(totalPrice)}
                            </p>
                        </div>
                    </div>

                    {/* Right Side: View Cart Link */}
                    <Link to={"/cart"} className='flex items-center gap-1 bg-white text-green-800 px-4 py-2 rounded-lg font-black text-xs uppercase shadow-md active:scale-95 transition-all'>
                        <span>View Cart</span>
                        <FaCaretRight className='text-lg'/>
                    </Link>
                </div>
            </div>
            )
        }
    </>
  )
}

export default CartMobileLink
