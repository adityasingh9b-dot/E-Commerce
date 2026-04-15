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

  // 1. STATES
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false); // To bypass browser block
  const [completedOrders, setCompletedOrders] = useState(() => {
    // Persistent Checkbox Logic (Like Cart)
    const saved = localStorage.getItem("completed_orders");
    return saved ? JSON.parse(saved) : {};
  });

  const audioRef = useRef(new Audio('/siren.mp3'));

  // Save checkbox state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("completed_orders", JSON.stringify(completedOrders));
  }, [completedOrders]);

  const toggleOrderCompletion = (orderId) => {
    setCompletedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount || 0);
  };

  const playSiren = () => {
    if (!isMuted && effectiveUser?.role === 'ADMIN' && isAudioEnabled) {
      console.log("🚨 Playing Siren...");
      audioRef.current.muted = false;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.error("Play failed:", err));
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

        const sortedOrders = [...fetchedOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // SOUND TRIGGER: Compare latest order ID
        if (orders.length > 0 && sortedOrders.length > 0) {
          if (sortedOrders[0]._id !== orders[0]._id) {
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
  }, [effectiveUser, dispatch, orders, isMuted, isAudioEnabled]);

  return (
    <div className='min-h-screen bg-gray-50 pb-10 relative'>
      
      {/* 2. BROWSER AUTOPLAY FIX: Overlay if audio not enabled */}
      {!isAudioEnabled && effectiveUser?.role === 'ADMIN' && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex flex-col items-center justify-center text-white p-4 backdrop-blur-sm">
           <IoPlayCircleOutline size={80} className="animate-bounce mb-4 text-primary-400" />
           <h2 className="text-2xl font-bold mb-2">Admin Dashboard Ready</h2>
           <p className="text-center mb-6 text-gray-300">Browser requires a click to enable order alerts (Siren).</p>
           <button 
             onClick={() => setIsAudioEnabled(true)}
             className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-full font-bold transition-all shadow-xl"
           >
             Activate Siren & Start Monitoring
           </button>
        </div>
      )}

      {/* --- STICKY HEAD BAR --- */}
      <div className='bg-white shadow-md p-4 sticky top-0 z-20 flex flex-col md:flex-row justify-between items-center gap-4'>
        <div className="flex items-center gap-4">
          <h1 className='text-xl font-bold text-gray-800 uppercase tracking-tight'>Order Desk</h1>
          {effectiveUser?.role === 'ADMIN' && (
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-full flex items-center gap-2 border ${isMuted ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200 animate-pulse'}`}
            >
              {isMuted ? <IoNotificationsOffOutline size={22} /> : <IoNotificationsOutline size={22} />}
              <span className="text-xs font-black uppercase">{isMuted ? "Muted" : "Live"}</span>
            </button>
          )}
        </div>
        
        {effectiveUser?.role === 'ADMIN' && (
          <div className='flex flex-wrap gap-2'>
              <div className='bg-blue-100 px-3 py-1 rounded border border-blue-200 text-center'>
                  <p className='text-[10px] text-blue-600 font-bold uppercase'>10% Commission</p>
                  <p className='text-sm font-black text-blue-800'>{formatCurrency(myCommission)}</p>
              </div>
          </div>
        )}
      </div>

      <div className='container mx-auto p-4'>
        {orders.map((order, index) => (
          <div
            key={order._id || index}
            className={`order rounded-lg p-5 text-sm border bg-white mb-6 shadow-sm transition-all duration-300 ${completedOrders[order._id] ? 'opacity-50 grayscale' : 'opacity-100'} ${effectiveUser?.role === 'ADMIN' ? 'border-l-8 border-l-primary-500' : ''}`}
          >
            <div className='flex justify-between items-start border-b pb-3 mb-3'>
              <div className="flex gap-4 items-start">
                {effectiveUser?.role === 'ADMIN' && (
                  <input 
                    type="checkbox" 
                    checked={!!completedOrders[order._id]}
                    onChange={() => toggleOrderCompletion(order._id)}
                    className="mt-1.5 h-6 w-6 cursor-pointer accent-green-600" 
                  />
                )}
                <div>
                  <p className='font-bold text-gray-800 text-base flex items-center gap-2'>
                    Order: <span className="text-primary-600 font-black">#{order.orderId || "N/A"}</span>
                    {completedOrders[order._id] && <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded italic">COMPLETED</span>}
                  </p>
                  <p className='text-xs font-medium text-gray-500'>
                    📅 {new Date(order.createdAt).toLocaleDateString()} 
                    <span className="ml-2 bg-gray-200 px-1.5 py-0.5 rounded text-gray-700">
                      ⏰ {new Date(order.createdAt).toLocaleTimeString()}
                    </span>
                  </p>
                </div>
              </div>
              <div className='text-right'>
                <p className='text-lg font-black text-green-700'>{formatCurrency(order.totalAmt || order.totalAmount)}</p>
              </div>
            </div>

            {/* Customer & Address Section */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
              <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                <p className='font-bold text-blue-800 text-xs uppercase mb-1'>👤 Customer</p>
                <p className='text-gray-700 font-medium capitalize'>{order?.userId?.name || "N/A"}</p>
                <p className='text-gray-500 text-xs'>{order?.userId?.email || "N/A"}</p>
              </div>
              <div className="bg-orange-50/50 p-3 rounded-lg border border-orange-100">
                <p className='font-bold text-orange-800 text-xs uppercase mb-1'>📍 Delivery To</p>
                <p className='text-gray-700 font-medium'>{order?.delivery_address?.address_line || "N/A"}</p>
                <p className='text-gray-900 font-black text-sm mt-1 flex items-center gap-1'>📞 {order?.delivery_address?.mobile || "N/A"}</p>
              </div>
            </div>

            {/* Items Section */}
            <div className='bg-gray-50 rounded-md p-3 border border-dashed border-gray-300'>
              <p className='font-bold text-gray-600 text-[10px] uppercase mb-2 tracking-widest'>Items List</p>
              {(Array.isArray(order.products) ? order.products : []).map((item, i) => {
                const qty = item?.product_details?.quantity ?? item?.quantity ?? item?.qty ?? null;
                return (
                  <div key={i} className='flex gap-4 mt-2 items-center border-b border-gray-200 last:border-0 pb-2'>
                    <img src={item?.product_details?.image?.[0]} className='w-12 h-12 object-scale-down rounded bg-white shadow-sm' alt="item" />
                    <div className='flex-1'>
                      <p className='font-bold text-gray-800 leading-tight'>{item?.product_details?.name}</p>
                      <p className='text-xs text-gray-500 font-bold'>Qty: <span className="text-primary-600">{qty}</span></p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
