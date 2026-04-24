import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import NoData from '../components/NoData';
import axios from 'axios';
import { setOrder } from "../store/orderSlice";
import { IoNotificationsOutline, IoNotificationsOffOutline, IoPlayCircleOutline } from "react-icons/io5";

const MyOrders = () => {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.orders?.order || []);
  const reduxUser = useSelector((state) => state.user?.user);
  const localUser = JSON.parse(localStorage.getItem("user"));
  const effectiveUser = reduxUser || localUser?.data || {};

  // --- POWER CHECK: Admin aur Co-Admin dono ko "Manager" maana jayega ---
  const isManager = effectiveUser?.role === 'ADMIN' || effectiveUser?.role === 'COADMIN';

  const [isMuted, setIsMuted] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false); 
  const [completedOrders, setCompletedOrders] = useState(() => {
    const saved = localStorage.getItem("completed_orders");
    return saved ? JSON.parse(saved) : {};
  });

  const audioRef = useRef(new Audio('/siren.mp3')); 
  const latestOrderIdRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("completed_orders", JSON.stringify(completedOrders));
  }, [completedOrders]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  const totalGrossSales = orders.reduce((sum, order) => {
    return sum + (Number(order.totalAmt) || Number(order.totalAmount) || 0);
  }, 0);

  const myCommission = totalGrossSales * 0.10;

  const playSiren = () => {
    // Siren bajegi agar Manager (Admin/Co-Admin) hai aur muted nahi hai
    if (!isMuted && isManager && isAudioEnabled) {
      audioRef.current.muted = false;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.error("Siren blocked:", err));
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('https://ecommerce-backend-gh79.onrender.com/api/order/order-list', {
          withCredentials: true
        });

        let fetchedOrders = Array.isArray(res.data.data) ? res.data.data : [];

        // Agar normal USER hai toh filter karo, varna Admin/Co-Admin ko saare dikhao
        if (!isManager) {
          fetchedOrders = fetchedOrders.filter((order) => {
            const orderUserId = typeof order.userId === 'string' ? order.userId : order.userId?._id;
            return orderUserId?.toString() === effectiveUser?._id?.toString();
          });
        }

        const sortedOrders = [...fetchedOrders].sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        if (sortedOrders.length > 0) {
          const newestFetchedId = sortedOrders[0]._id;
          if (latestOrderIdRef.current && latestOrderIdRef.current !== newestFetchedId) {
            playSiren();
          }
          latestOrderIdRef.current = newestFetchedId;
        }

        dispatch(setOrder(sortedOrders));
      } catch (err) {
        console.error('❌ Error fetching orders:', err.message);
      }
    };

    fetchOrders();
    const intervalId = setInterval(fetchOrders, 5000);
    return () => clearInterval(intervalId);
  }, [isManager, effectiveUser?._id, dispatch, isMuted, isAudioEnabled]);

  return (
    <div className='min-h-screen bg-gray-50 pb-10 relative'>
      
      {/* 1. Siren Activation Overlay for Managers */}
      {!isAudioEnabled && isManager && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex flex-col items-center justify-center text-white p-4 backdrop-blur-sm">
           <IoPlayCircleOutline size={70} className="mb-4 text-green-400" />
           <h2 className="text-xl font-bold mb-4">Enable Order Alerts? (Co-Admin)</h2>
           <button 
             onClick={() => setIsAudioEnabled(true)}
             className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-transform active:scale-95"
           >
             Activate Siren
           </button>
        </div>
      )}

      {/* --- STICKY HEAD BAR --- */}
      <div className='bg-white shadow-md p-4 sticky top-0 z-20 flex flex-col md:flex-row justify-between items-center gap-4'>
        <div className="flex items-center gap-4">
          <h1 className='text-xl font-black text-gray-900'>Dashboard</h1>
          
          {isManager && (
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-full transition-all flex items-center gap-2 ${isMuted ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600 animate-pulse'}`}
            >
              {isMuted ? <IoNotificationsOffOutline size={22} /> : <IoNotificationsOutline size={22} />}
              <span className="text-sm font-bold">{isMuted ? "Muted" : "Siren Active"}</span>
            </button>
          )}
        </div>
        
        {isManager && (
          <div className='flex flex-wrap gap-4 items-center justify-center'>
              <div className='bg-gray-100 px-4 py-2 rounded-lg border border-gray-300 text-center shadow-sm'>
                  <p className='text-sm text-gray-800 font-bold uppercase'>Total Gross Sales</p>
                  <p className='text-xl font-black text-gray-900'>{formatCurrency(totalGrossSales)}</p>
              </div>
              <div className='bg-blue-100 px-4 py-2 rounded-lg border border-blue-300 text-center shadow-sm'>
                  <p className='text-sm text-blue-800 font-bold uppercase'>10% Commission</p>
                  <p className='text-xl font-black text-blue-900'>{formatCurrency(myCommission)}</p>
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
              className={`order rounded-lg p-5 text-sm border bg-white mb-6 shadow-sm transition-all ${completedOrders[order._id] ? 'opacity-50 grayscale' : 'opacity-100'} ${isManager ? 'border-l-8 border-l-primary-600' : ''}`}
            >
              <div className='flex justify-between items-start border-b-2 border-gray-200 pb-3 mb-3'>
                <div className="flex gap-4 items-start">
                  {/* --- CHECKBOX FOR COADMIN TOO --- */}
                  {isManager && (
                    <input 
                      type="checkbox" 
                      checked={!!completedOrders[order._id]}
                      onChange={() => {
                        setCompletedOrders(prev => ({
                          ...prev,
                          [order._id]: !prev[order._id]
                        }));
                      }}
                      className="mt-1.5 h-6 w-6 cursor-pointer accent-green-600" 
                    />
                  )}
                  
                  <div>
                    <p className='font-black text-gray-900 text-lg'>
                      Order No: <span className="text-primary-700">#{order.orderId || "N/A"}</span>
                    </p>
                    <p className='text-sm font-bold text-gray-800 mt-1'>
                      📅 {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'} 
                    </p>
                  </div>
                </div>
                
                <div className='text-right'>
                  <p className='text-xl font-black text-green-700'>
                    {formatCurrency(order.totalAmt || order.totalAmount)}
                  </p>
                </div>
              </div>

              {/* Customer & Address Details */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                <div className="bg-blue-50 p-3 rounded border border-blue-100 text-gray-900">
                  <p className='font-bold mb-1 text-base'>👤 Customer</p>
                  <p className='font-semibold'>{order?.userId?.name || "N/A"}</p>
                  <p>{order?.userId?.email || "N/A"}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded border border-orange-100 text-gray-900">
                  <p className='font-bold mb-1 text-base'>📍 Delivery To</p>
                  <p className='font-semibold'>{order?.delivery_address?.address_line || "N/A"}</p>
                  <p className='font-black'>📞 {order?.delivery_address?.mobile || "N/A"}</p>
                </div>
              </div>

              {/* Items List */}
              <div className='bg-gray-100 rounded-md p-4 border border-gray-200'>
                <p className='font-bold text-gray-900 mb-3 border-b-2 border-gray-300 pb-2 text-base'>Items Ordered</p>
                {(Array.isArray(order.products) ? order.products : []).map((item, i) => (
                  <div key={i} className='flex gap-4 mt-3 items-center border-b border-gray-300 pb-3 last:border-0'>
                    <img src={item?.product_details?.image?.[0] || ''} className='w-16 h-16 object-scale-down rounded bg-white border' alt='' />
                    <div className='flex-1'>
                      <p className='font-bold text-gray-900'>{item?.product_details?.name || 'Product'}</p>
                      <p className='text-sm font-semibold text-gray-800'>Qty: {item?.quantity || item?.qty || 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyOrders;
