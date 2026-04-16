import React from 'react'
import { IoClose } from 'react-icons/io5'
import { Link, useNavigate } from 'react-router-dom'
import { useGlobalContext } from '../provider/GlobalProvider'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import { FaCaretRight } from "react-icons/fa";
import { useSelector } from 'react-redux'
import AddToCartButton from './AddToCartButton'
import { pricewithDiscount } from '../utils/PriceWithDiscount'
import imageEmpty from '../assets/empty_cart.webp'
import toast from 'react-hot-toast'

const DisplayCartItem = ({close}) => {
    const { notDiscountTotalPrice, totalPrice ,totalQty} = useGlobalContext()
    const cartItem  = useSelector(state => state.cartItem.cart)
    const user = useSelector(state => state.user)
    const navigate = useNavigate()

    const deliveryCharge = 50

    const redirectToCheckoutPage = ()=>{
        if(user?._id){
            navigate("/checkout")
            if(close){
                close()
            }
            return
        }
        toast("Please Login")
    }

  return (
    <section className='bg-neutral-900 fixed top-0 bottom-0 right-0 left-0 bg-opacity-70 z-[100]'>
        <div className='bg-white w-full max-w-sm min-h-screen max-h-screen ml-auto overflow-hidden flex flex-col shadow-2xl relative'>
            
            {/* Header */}
            <div className='flex items-center p-4 shadow-sm gap-3 justify-between bg-white border-b shrink-0'>
                <h2 className='font-black uppercase tracking-tighter text-xl'>My Cart ({totalQty})</h2>
                <Link to={"/"} className='lg:hidden text-black'>
                    <IoClose size={28}/>
                </Link>
                <button onClick={close} className='hidden lg:block text-black hover:scale-110 transition-transform'>
                    <IoClose size={28}/>
                </button>
            </div>

            {/* Content Area - Added more padding bottom to clear the higher floating button */}
            <div className='flex-1 h-full bg-gray-50 p-2 flex flex-col gap-4 overflow-y-auto pb-40'> 
                {cartItem[0] ? (
                    <>
                        {/* Savings Alert */}
                        <div className='flex items-center justify-between px-4 py-3 bg-green-100 text-green-700 rounded-xl shrink-0 border border-green-200'>
                            <p className='text-xs font-bold uppercase'>Total Savings</p>
                            <p className='font-black'>{DisplayPriceInRupees(notDiscountTotalPrice - totalPrice )}</p>
                        </div>

                        {/* Items List */}
                        <div className='bg-white rounded-2xl p-4 shadow-sm grid gap-5 border border-gray-100'>
                            {cartItem.map((item,index)=>{
                                return(
                                    <div key={item?._id+"cartItemDisplay"} className='flex w-full gap-4 items-center'>
                                        <div className='w-16 h-16 min-h-16 min-w-16 bg-white border rounded-xl overflow-hidden p-1'>
                                            <img
                                                src={item?.productId?.image[0]}
                                                className='object-scale-down w-full h-full'
                                                alt={item?.productId?.name}
                                            />
                                        </div>
                                        <div className='w-full max-w-sm'>
                                            <p className='text-xs font-bold text-gray-800 line-clamp-2'>{item?.productId?.name}</p>
                                            <p className='text-[10px] text-neutral-400 font-semibold uppercase'>{item?.productId?.unit}</p>
                                            <p className='font-black text-sm text-green-700'>{DisplayPriceInRupees(pricewithDiscount(item?.productId?.price,item?.productId?.discount))}</p>
                                        </div>
                                        <div>
                                            <AddToCartButton data={item?.productId}/>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Bill Details */}
                        <div className='bg-white p-5 rounded-2xl border border-gray-100 mb-4 shadow-sm'>
                            <h3 className='font-black uppercase text-xs tracking-widest text-gray-400 mb-3 text-center'>Bill Summary</h3>
                            <div className='flex gap-4 justify-between text-sm mb-2'>
                                <p className='font-bold text-gray-600'>Items total</p>
                                <p className='flex items-center gap-2'>
                                    <span className='line-through text-neutral-400 text-xs'>{DisplayPriceInRupees(notDiscountTotalPrice)}</span>
                                    <span className='font-black'>{DisplayPriceInRupees(totalPrice)}</span>
                                </p>
                            </div>
                            <div className='flex gap-4 justify-between text-sm mb-2'>
                                <p className='font-bold text-gray-600'>Delivery Charges</p>
                                <p className='text-green-700 font-black'>{DisplayPriceInRupees(deliveryCharge)}</p>
                            </div>
                            <div className='font-black flex items-center justify-between gap-4 border-t border-dashed mt-3 pt-3 text-lg text-black'>
                                <p>Grand Total</p>
                                <p>{DisplayPriceInRupees(totalPrice + deliveryCharge)}</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className='bg-white flex flex-col justify-center items-center p-10 h-full rounded-2xl'>
                        <img src={imageEmpty} className='w-48 h-48 object-scale-down opacity-50' alt="Empty Cart" />
                        <p className='font-black text-gray-400 mt-4 uppercase tracking-widest'>Cart is empty</p>
                        <Link onClick={close} to={"/"} className='bg-black text-white px-8 py-3 rounded-xl font-black mt-6 shadow-lg uppercase text-sm'>Start Shopping</Link>
                    </div>
                )}
            </div>

            {/* ✅ UPDATED HIGHER FLOATING PROCEED BUTTON */}
            {cartItem[0] && (
                <div className='absolute bottom-14 left-0 right-0 px-4 z-[110]'>
                    <button 
                        onClick={redirectToCheckoutPage}
                        className='w-full bg-green-700 hover:bg-green-800 text-white px-5 py-5 rounded-[24px] font-black flex items-center justify-between transition-all shadow-[0_15px_40px_rgba(21,128,61,0.5)] active:scale-[0.95] border-2 border-white/10'
                    >
                        <div className='flex flex-col items-start'>
                            <span className='text-[10px] uppercase opacity-80 leading-none mb-1 tracking-widest'>To Pay</span>
                            <span className='text-xl leading-none font-black'>{DisplayPriceInRupees(totalPrice + deliveryCharge)}</span>
                        </div>
                        <div className='flex items-center gap-2 bg-white text-green-800 px-5 py-2.5 rounded-2xl shadow-inner'>
                            <span className='uppercase tracking-tighter text-sm font-black'>Proceed</span>
                            <FaCaretRight className='text-xl' />
                        </div>
                    </button>
                </div>
            )}
            
        </div>
    </section>
  )
}

export default DisplayCartItem
