import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import NoData from '../components/NoData';
import axios from 'axios';
import { setOrder } from "../store/orderSlice";
import { IoNotificationsOutline, IoNotificationsOffOutline } from "react-icons/io5";

const MyOrders = () => {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.orders?.order || []);
  const reduxUser = useSelector((state) => state.user?.user);
  const localUser = JSON.parse(localStorage.getItem("user"));
  const effectiveUser = reduxUser || localUser?.data || {};

  // 1. Mute State & Audio Reference
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(new Audio('/siren.mp3')); 

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  const deliveryChargePerOrder = 50;

  const totalGrossSales = orders.reduce((sum, order) => {
    return sum + (Number(order.totalAmt) || Number(order.totalAmount) || 0);
  }, 0);

  const totalNetFoodSales = orders.reduce((sum, order) => {
    const amt = Number(order.totalAmt) || Number(order.totalAmount) || 0;
    const foodOnly = amt > deliveryChargePerOrder ? amt - deliveryChargePerOrder : 0;
    return sum + foodOnly;
  }, 0);

  const myCommission = totalNetFoodSales * 0.10;

  // 2. Play Siren Function
  const playSiren = () => {
    if (!isMuted && effectiveUser?.role === 'ADMIN') {
      audioRef.current.currentTime = 0; // Reset to start
      audioRef.current.play().catch(err => console.log("Audio play blocked: Interaction needed first."));
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('https://ecommerce-backend-gh79.onrender.com/api/order/order-list', {
          withCredentials: true
        });

        let fetchedOrders = Array.isArray(res.data.data) ? res.data.data : [];

        if (effectiveUser?.role !== 'ADMIN') {
          fetchedOrders = fetchedOrders.filter((order) => {
            const orderUserId = typeof order.userId === 'string' ? order.userId : order.userId?._id;
            return orderUserId?.toString() === effectiveUser?._id?.toString();
          });
        }

        const sortedOrders = [...fetchedOrders].sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        // 3. SOUND TRIGGER LOGIC: Compare new list with current redux state
        if (orders.length > 0 && sortedOrders.length > 0) {
          if (sortedOrders[0]._id !== orders[0]._id) {
            console.log("🚨 New Order Detected!");
            playSiren();
          }
        }

        dispatch(setOrder(sortedOrders));
      } catch (err) {
        console.error('❌ Error fetching orders:', err.message);
      }
    };

    fetchOrders();
    const intervalId = setInterval(fetchOrders, 5000);
    return () => clearInterval(intervalId);
  }, [effectiveUser, dispatch, orders, isMuted]); // Added dependencies for sound logic

  return (
    <div className='min-h-screen bg-gray-50 pb-10'>
      {/* --- STICKY HEAD BAR --- */}
      <div className='bg-white shadow-md p-4 sticky top-0 z-20 flex flex-col md:flex-row justify-between items-center gap-4'>
        <div className="flex items-center gap-4">
          <h1 className='text-xl font-bold text-gray-800'>Admin Orders</h1>
          
          {/* 4. NOTIFICATION TOGGLE BUTTON */}
          {effectiveUser?.role === 'ADMIN' && (
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-full transition-all flex items-center gap-2 ${isMuted ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600 animate-pulse'}`}
            >
              {isMuted ? <IoNotificationsOffOutline size={22} /> : <IoNotificationsOutline size={22} />}
              <span className="text-xs font-bold">{isMuted ? "Muted" : "Active"}</span>
            </button>
          )}
        </div>
        
        {effectiveUser?.role === 'ADMIN' && (
          <div className='flex flex-wrap gap-3 items-center justify-center'>
              <div className='bg-gray-100 px-3 py-1 rounded border border-gray-200 text-center'>
                  <p className='text-[10px] text-gray-500 font-bold uppercase'>Gross (Inc. Delivery)</p>
                  <p className='text-sm font-bold text-gray-700'>{formatCurrency(totalGrossSales)}</p>
              </div>

              <div className='bg-green-100 px-4 py-2 rounded-lg border border-green-200 text-center shadow-sm'>
                  <p className='text-xs text-green-600 font-bold uppercase'>Net Food Sales</p>
                  <p className='text-lg font-black text-green-800'>{formatCurrency(totalNetFoodSales)}</p>
              </div>
              
              <div className='bg-blue-100 px-4 py-2 rounded-lg border border-blue-200 text-center shadow-sm'>
                  <p className='text-xs text-blue-600 font-bold uppercase'>10% Commission</p>
                  <p className='text-lg font-black text-blue-800'>{formatCurrency(myCommission)}</p>
              </div>
          </div>
        )}
      </div>

      <div className='container mx-auto p-4'>
        {!orders || orders.length === 0 ? (
          <NoData />
        ) : (
          orders.map((order, index) => (
            <div
              key={order._id || index}
              className={`order rounded-lg p-5 text-sm border bg-white mb-6 shadow-sm hover:shadow-md transition-shadow ${effectiveUser?.role === 'ADMIN' ? 'border-l-8 border-l-primary-500' : ''}`}
            >
              <div className='flex justify-between items-start border-b pb-3 mb-3'>
                <div className="flex gap-4 items-start">
                  {effectiveUser?.role === 'ADMIN' && (
                    <input 
                      type="checkbox" 
                      className="mt-1.5 h-5 w-5 cursor-pointer accent-primary-600" 
                      onClick={(e) => e.stopPropagation()} 
                    />
                  )}
                  
                  <div>
                    <p className='font-bold text-gray-800 text-base'>
                      Order No: <span className="text-primary-600">#{order.orderId || "N/A"}</span>
                    </p>
                    <p className='text-xs font-medium text-gray-500'>
                      📅 {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'} 
                      <span className="ml-2 bg-gray-200 px-1.5 py-0.5 rounded text-gray-700">
                        ⏰ {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Time N/A'}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className='text-right'>
                  <p className='text-xs text-gray-500 uppercase font-bold tracking-wider'>Total Paid</p>
                  <p className='text-lg font-black text-green-700'>
                    {formatCurrency(order.totalAmt || order.totalAmount)}
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                <div className="bg-blue-50/50 p-2 rounded">
                  <p className='font-semibold text-gray-700 mb-1 flex items-center gap-1'>👤 Customer Details</p>
                  <p className='text-gray-600 capitalize'>Name: {order?.userId?.name || "N/A"}</p>
                  <p className='text-gray-600'>Email: {order?.userId?.email || "N/A"}</p>
                </div>
                <div className="bg-orange-50/50 p-2 rounded">
                  <p className='font-semibold text-gray-700 mb-1 flex items-center gap-1'>📍 Shipping Address</p>
                  <p className='text-gray-600'>{order?.delivery_address?.address_line || "N/A"}</p>
                  <p className='text-gray-600 font-bold text-sm mt-1'>📞 {order?.delivery_address?.mobile || "N/A"}</p>
                </div>
              </div>

              <div className='bg-gray-50 rounded-md p-3'>
                <p className='font-semibold text-gray-700 mb-2 border-b pb-1'>Items Ordered</p>
                {(Array.isArray(order.products) ? order.products : []).map((item, i) => {
                  const qty = item?.product_details?.quantity ?? item?.quantity ?? item?.qty ?? null;
                  return (
                    <div key={i} className='flex gap-4 mt-3 items-center last:border-0 border-b border-gray-100 pb-2'>
                      <img
                        src={item?.product_details?.image?.[0] || ''}
                        alt={item?.product_details?.name || 'Product'}
                        className='w-16 h-16 object-scale-down rounded bg-white border'
                      />
                      <div className='flex-1'>
                        <p className='font-medium text-gray-800'>
                          {item?.product_details?.name || 'Unnamed Product'}
                        </p>
                        <p className='text-xs text-gray-500'>
                          Qty: <span className="font-bold text-gray-700">{qty ?? 'N/A'}</span> × {item?.product_details?.unit || 'unit'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyOrders;
