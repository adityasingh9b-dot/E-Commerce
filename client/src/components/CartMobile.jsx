import React from 'react'
import { useGlobalContext } from '../provider/GlobalProvider'
import { FaCartShopping } from 'react-icons/fa6'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import { Link, useLocation } from 'react-router-dom' // ✅ Added useLocation
import { FaCaretRight } from "react-icons/fa";
import { useSelector } from 'react-redux'

const CartMobileLink = () => {
    const { totalPrice, totalQty } = useGlobalContext()
    const cartItem = useSelector(state => state.cartItem.cart)
    const location = useLocation() // ✅ Current page track karne ke liye

    // ✅ Agar cart page par hain toh kuch render mat karo
    if(location.pathname === "/cart"){
        return null
    }

  return (
    <>
        {
            cartItem[0] && (
            /* added z-50 taaki footer ke upar dikhe */
            <div className='sticky bottom-4 p-2 z-50'>
                <div className='bg-green-700 px-3 py-2 rounded-xl text-white shadow-2xl flex items-center justify-between gap-3 lg:hidden border border-green-500'>
                    <div className='flex items-center gap-3'>
                        <div className='p-2 bg-green-600 rounded-lg'>
                            <FaCartShopping className='text-lg text-white'/>
                        </div>
                        <div className='flex flex-col'>
                            <p className='text-[10px] font-black uppercase opacity-80 leading-none'>Items</p>
                            <p className='text-sm font-black'>{totalQty} | {DisplayPriceInRupees(totalPrice)}</p>
                        </div>
                    </div>

                    <Link to={"/cart"} className='flex items-center gap-1 bg-white text-green-800 px-3 py-1.5 rounded-lg font-black text-xs uppercase shadow-sm'>
                        <span>View Cart</span>
                        <FaCaretRight/>
                    </Link>
                </div>
            </div>
            )
        }
    </>
  )
}

export default CartMobileLink
