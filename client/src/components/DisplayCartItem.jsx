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

    // --- DELIVERY CHARGE CONSTANT ---
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
    <section className='bg-neutral-900 fixed top-0 bottom-0 right-0 left-0 bg-opacity-70 z-50'>
        <div className='bg-white w-full max-w-sm min-h-screen max-h-screen ml-auto overflow-hidden flex flex-col'>
            <div className='flex items-center p-4 shadow-md gap-3 justify-between bg-white'>
                <h2 className='font-semibold'>Cart</h2>
                <Link to={"/"} className='lg:hidden'>
                    <IoClose size={25}/>
                </Link>
                <button onClick={close} className='hidden lg:block'>
                    <IoClose size={25}/>
                </button>
            </div>

            <div className='flex-1 h-full bg-blue-50 p-2 flex flex-col gap-4 overflow-y-auto'>
                {/***display items */}
                {
                    cartItem[0] ? (
                        <>
                            <div className='flex items-center justify-between px-4 py-2 bg-blue-100 text-blue-500 rounded-full shrink-0'>
                                    <p>Your total savings</p>
                                    <p>{DisplayPriceInRupees(notDiscountTotalPrice - totalPrice )}</p>
                            </div>
                            <div className='bg-white rounded-lg p-4 grid gap-5'>
                                    {
                                        cartItem.map((item,index)=>{
                                            return(
                                                <div key={item?._id+"cartItemDisplay"} className='flex w-full gap-4'>
                                                    <div className='w-16 h-16 min-h-16 min-w-16 bg-white border rounded'>
                                                        <img
                                                            src={item?.productId?.image[0]}
                                                            className='object-scale-down w-full h-full'
                                                            alt={item?.productId?.name}
                                                        />
                                                    </div>
                                                    <div className='w-full max-w-sm text-xs'>
                                                        <p className='text-xs text-ellipsis line-clamp-2'>{item?.productId?.name}</p>
                                                        <p className='text-neutral-400'>{item?.productId?.unit}</p>
                                                        <p className='font-semibold'>{DisplayPriceInRupees(pricewithDiscount(item?.productId?.price,item?.productId?.discount))}</p>
                                                    </div>
                                                    <div>
                                                        <AddToCartButton data={item?.productId}/>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
                            </div>
                            <div className='bg-white p-4 mb-2'>
                                <h3 className='font-semibold'>Bill details</h3>
                                <div className='flex gap-4 justify-between ml-1 text-sm'>
                                    <p>Items total</p>
                                    <p className='flex items-center gap-2'><span className='line-through text-neutral-400'>{DisplayPriceInRupees(notDiscountTotalPrice)}</span><span>{DisplayPriceInRupees(totalPrice)}</span></p>
                                </div>
                                <div className='flex gap-4 justify-between ml-1 text-sm'>
                                    <p>Total Quantity:</p>
                                    <p className='flex items-center gap-2'>{totalQty} item</p>
                                </div>
                                
                                {/* --- UPDATED DELIVERY CHARGE --- */}
                                <div className='flex gap-4 justify-between ml-1 text-sm'>
                                    <p>Delivery Charges</p>
                                    <p className='text-green-600 font-medium'>{DisplayPriceInRupees(deliveryCharge)}</p>
                                </div>

                                {/* --- UPDATED GRAND TOTAL --- */}
                                <div className='font-bold flex items-center justify-between gap-4 border-t mt-2 pt-2'>
                                    <p >Grand total</p>
                                    <p>{DisplayPriceInRupees(totalPrice + deliveryCharge)}</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className='bg-white flex flex-col justify-center items-center p-10'>
                            <img
                                src={imageEmpty}
                                className='w-full h-full object-scale-down' 
                                alt="Empty Cart"
                            />
                            <Link onClick={close} to={"/"} className='block bg-green-600 px-4 py-2 text-white rounded mt-4'>Shop Now</Link>
                        </div>
                    )
                }
                
            </div>

            {
                cartItem[0] && (
                    <div className='p-2 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)]'>
                        <div className='bg-green-700 text-neutral-100 px-4 font-bold text-base py-4 rounded flex items-center gap-4 justify-between'>
                            <div>
                                {/* --- PROCEED BUTTON TOTAL UPDATED --- */}
                                {DisplayPriceInRupees(totalPrice + deliveryCharge)}
                            </div>
                            <button onClick={redirectToCheckoutPage} className='flex items-center gap-1'>
                                Proceed
                                <span><FaCaretRight/></span>
                            </button>
                        </div>
                    </div>
                )
            }
            
        </div>
    </section>
  )
}

export default DisplayCartItem
