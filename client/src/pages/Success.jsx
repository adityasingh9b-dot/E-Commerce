import React, { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { setOrder } from '../store/orderSlice'

const Success = () => {
  const location = useLocation()
  const dispatch = useDispatch()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('/api/order/order-list')
        let fetchedOrders = Array.isArray(res.data.orders) ? res.data.orders : []
        dispatch(setOrder(fetchedOrders.reverse()))
      } catch (err) {
        console.error('Error fetching orders on Success page:', err)
      }
    }

    fetchOrders()
  }, [dispatch])

  return (
    <div className='m-2 w-full max-w-md bg-green-200 p-4 py-5 rounded mx-auto flex flex-col justify-center items-center gap-5'>
      <p className='text-green-800 font-bold text-lg text-center'>
        {Boolean(location?.state?.text) ? location?.state?.text : 'Payment'} Successfully
      </p>
      <Link to='/' className='border border-green-900 text-green-900 hover:bg-green-900 hover:text-white transition-all px-4 py-1'>
        Go To Home
      </Link>
    </div>
  )
}

export default Success

