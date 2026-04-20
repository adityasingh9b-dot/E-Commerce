import React, { useState } from 'react'
import { useGlobalContext } from '../provider/GlobalProvider'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import AddAddress from '../components/AddAddress'
import { useSelector } from 'react-redux'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'

const CheckoutPage = () => {
  const { notDiscountTotalPrice, totalPrice, totalQty, fetchCartItem, fetchOrder } = useGlobalContext()
  const [openAddress, setOpenAddress] = useState(false)
  const addressList = useSelector(state => state.addresses.addressList)
  const [selectAddress, setSelectAddress] = useState(0)
  const cartItemsList = useSelector(state => state.cartItem.cart)
  const navigate = useNavigate()

  const deliveryCharge = 50 

  const handleCashOnDelivery = async() => {
      try {
          const response = await Axios({
            ...SummaryApi.CashOnDeliveryOrder,
            data : {
              list_items : cartItemsList,
              addressId : addressList[selectAddress]?._id,
              subTotalAmt : totalPrice,
              totalAmt :  totalPrice + deliveryCharge, 
            }
          })

          const { data : responseData } = response

          if(responseData.success){
              toast.success(responseData.message)
              if(fetchCartItem){
                fetchCartItem()
              }
              if(fetchOrder){
                fetchOrder()
              }
              navigate('/success',{
                state : {
                  text : "Order"
                }
              })
          }

      } catch (error) {
        AxiosToastError(error)
      }
  }

  const handleOnlinePayment = async()=>{
    try {
        toast.loading("Loading...")
        const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY
        const stripePromise = await loadStripe(stripePublicKey)
        
        const response = await Axios({
            ...SummaryApi.payment_url,
            data : {
              list_items : cartItemsList,
              addressId : addressList[selectAddress]?._id,
              subTotalAmt : totalPrice,
              totalAmt :  totalPrice + deliveryCharge, 
            }
        })

        const { data : responseData } = response

        stripePromise.redirectToCheckout({ sessionId : responseData.id })
        
        if(fetchCartItem){
          fetchCartItem()
        }
        if(fetchOrder){
          fetchOrder()
        }
    } catch (error) {
        AxiosToastError(error)
    }
  }

  return (
    <section className='bg-blue-50'>
      <div className='container mx-auto p-4 flex flex-col lg:flex-row w-full gap-5 justify-between'>
        <div className='w-full'>
          <h3 className='text-lg font-bold'>Choose your address</h3>
          <div className='bg-white p-2 grid gap-4'>
            {
              addressList.map((address, index) => {
                return (
                  <label key={index} htmlFor={"address" + index} className={!address.status ? "hidden" : "block"}>
                    <div className='border rounded p-3 flex gap-3 hover:bg-blue-50 cursor-pointer'>
                      <div>
                        <input id={"address" + index} type='radio' value={index} onChange={(e) => setSelectAddress(e.target.value)} name='address' checked={selectAddress == index} />
                      </div>
                      {/* ✅ Address details made bold */}
                      <div className='font-bold text-neutral-800'>
                        <p>{address.address_line}</p>
                        <p>{address.city}, {address.state}</p>
                        <p>{address.country} - {address.pincode}</p>
                        <p className='mt-1 text-blue-700'>Ph: {address.mobile}</p>
                      </div>
                    </div>
                  </label>
                )
              })
            }
            <div onClick={() => setOpenAddress(true)} className='h-16 bg-blue-50 border-2 border-dashed flex justify-center items-center cursor-pointer font-bold text-blue-600'>
              + Add address
            </div>
          </div>
        </div>

        <div className='w-full max-w-md bg-white py-4 px-2 shadow-sm rounded'>
          <h3 className='text-lg font-bold px-4'>Summary</h3>
          <div className='bg-white p-4'>
            <h3 className='font-bold text-neutral-600 mb-2'>Bill details</h3>
            
            <div className='flex gap-4 justify-between ml-1 font-semibold'>
              <p>Items total</p>
              <p className='flex items-center gap-2'>
                <span className='line-through text-neutral-400 font-medium'>{DisplayPriceInRupees(notDiscountTotalPrice)}</span>
                <span className='text-neutral-900'>{DisplayPriceInRupees(totalPrice)}</span>
              </p>
            </div>

            <div className='flex gap-4 justify-between ml-1 font-semibold'>
              <p>Total Quantity:</p>
              <p className='text-neutral-900'>{totalQty} item</p>
            </div>
            
            <div className='flex gap-4 justify-between ml-1 font-semibold'>
              <p>Delivery Charge</p>
              <p className='text-green-700 font-bold'>{DisplayPriceInRupees(deliveryCharge)}</p>
            </div>

            <div className='font-bold flex items-center justify-between gap-4 border-t-2 pt-2 mt-2 text-xl text-neutral-900'>
              <p>Grand total</p>
              <p>{DisplayPriceInRupees(totalPrice + deliveryCharge)}</p>
            </div>
          </div>
          
          <div className='w-full flex flex-col gap-4 mt-4 px-4'>
            
            <button className='py-3 px-4 border-2 border-green-600 font-bold text-green-600 hover:bg-green-600 hover:text-white rounded uppercase tracking-wider' onClick={handleCashOnDelivery}> Place Order (Cash on Delivery) </button>
          </div>
        </div>
      </div>

      { openAddress && <AddAddress close={() => setOpenAddress(false)} /> }
    </section>
  )
}

export default CheckoutPage
