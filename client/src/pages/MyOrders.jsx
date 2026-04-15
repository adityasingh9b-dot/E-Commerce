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
  const [isAudioEnabled, setIsAudioEnabled] = useState(false); 
  const [completedOrders, setCompletedOrders] = useState(() => {
    // Persistent Checkbox Logic (Like Cart)
    const saved = localStorage.getItem("completed_orders");
    return saved ? JSON.parse(saved) : {};
  });

  const audioRef = useRef(new Audio('/siren.mp3'));

  // 2. CALCULATIONS
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

  // 3. HANDLERS
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
      console.log("🚨 Siren Triggered!");
      audioRef.current.muted = false;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.log("Click the 'Activate' button first!"));
    }
  };

  // 4. FETCH LOGIC
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

        // Trigger sound if new order arrives
        if (orders.length > 0 && sortedOrders.length > 0) {
          if (sortedOrders[0]._id !== orders[0]._id) {
            playSiren();
          }
        }

        dispatch(setOrder(sortedOrders));
      } catch (err) {
        console.error('❌ Error:', err.message);
      }
    };

    fetchOrders();
    const intervalId = setInterval(fetchOrders, 5000);
    return () => clearInterval(intervalId);
  }, [effectiveUser, dispatch, orders, isMuted, isAudioEnabled]);

  return (
    <div className='min-h-screen bg-gray-50 pb-10 relative'>
      
      {/* AUTOPLAY PROTECTION OVERLAY */}
      {!isAudioEnabled && effectiveUser?.role === 'ADMIN' && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex flex-col items-center justify-center text-white p-4 backdrop-blur-md">
           <IoPlayCircleOutline size={80} className="animate-pulse mb-4 text-green-400" />
           <h2 className="text-2xl font-bold mb-2">Order Siren Ready</h2>
           <p className="text-center mb-6 text-gray-300">Browser needs one click to allow the alarm sound.</p>
           <button 
             onClick={() => setIsAudioEnabled(true)}
             className="bg-green-600 hover:bg-green-700 text-white px-10 py-3 rounded-full font-black shadow-2xl transition-all scale-110"
           >
             ACTIVATE SIREN
           </button>
        </div>
      )}

      {/* HEADER */}
      <div className='bg-white shadow-md p-4 sticky top-0 z-20 flex flex-col md:flex-row justify-between items-center gap-4 border-b'>
        <div className="flex items-center gap-4">
          <h1 className='text-xl font-black text-gray-800 tracking-tighter'>ADMIN DASHBOARD</h1>
          {effectiveUser?.role === 'ADMIN' && (
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-full border flex items-center gap-2 ${isMuted ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}`}
            >
              {isMuted ? <IoNotificationsOffOutline size={22} /> : <IoNotificationsOutline size={22} className="animate-swing" />}
              <span className="text-[10px] font-black">{isMuted ? "MUTED" : "LIVE ALARM"}</span>
            </button>
          )}
        </div>
        
        {effectiveUser?.role === 'ADMIN' && (
          <div className='flex flex-wrap gap-2'>
              <div className='bg-blue-50 px-3 py-1 rounded border border-blue-100 text-center shadow-sm'>
                  <p className='text-[10px] text-blue-500 font-bold uppercase'>My 10% Commission</p>
                  <p className='text-sm font-black text-blue-800'>{formatCurrency(myCommission)}</p>
              </div>
          </div>
        )}
      </div>

      <div className='container mx-auto p-4'>
        {orders.length === 0 ? <NoData /> : orders.map((order) => (
          <div
            key={order._id}
            className={`order rounded-lg p-5 text-sm border bg-white mb-6 shadow-sm transition-all duration-300 ${completedOrders[order._id] ? 'opacity-40 grayscale bg-gray-100' : 'opacity-100'}`}
            style={{ borderLeft: completedOrders[order._id] ? '8px solid #9ca3af' : '8px solid #10b981' }}
          >
            <div className='flex justify-between items-start border-b pb-3 mb-3'>
              <div className="flex gap-4 items-start">
                {effectiveUser?.role === 'ADMIN' && (
                  <input 
                    type="checkbox" 
                    checked={!!completedOrders[order._id]}
                    onChange={() => toggleOrderCompletion(order._id)}
                    className="mt-1.5 h-6 w-6 cursor-pointer accent-green-600 shadow-sm" 
                  />
                )}
                <div>
                  <p className='font-black text-gray-800 text-base'>
                    ORDER: <span className="text-green-600">#{order.orderId || "N/A"}</span>
                  </p>
                  <p className='text-xs font-bold text-gray-500 uppercase'>
                    📅 {new Date(order.createdAt).toLocaleDateString()} 
                    <span className="ml-2 bg-gray-200 px-1.5 py-0.5 rounded text-gray-700">
                      ⏰ {new Date(order.createdAt).toLocaleTimeString()}
                    </span>
                  </p>
                </div>
              </div>
              <p className='text-lg font-black text-gray-900'>{formatCurrency(order.totalAmt || order.totalAmount)}</p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <p className='font-bold text-blue-800 text-[10px] uppercase'>👤 Customer</p>
                <p className='text-gray-700 font-bold capitalize'>{order?.userId?.name || "N/A"}</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                <p className='font-bold text-orange-800 text-[10px] uppercase'>📍 Address & Phone</p>
                <p className='text-gray-700 font-bold leading-tight'>{order?.delivery_address?.address_line}</p>
                <p className='text-orange-700 font-black text-sm mt-1'>📞 {order?.delivery_address?.mobile}</p>
              </div>
            </div>

            <div className='bg-gray-50 rounded-md p-3 border border-gray-200'>
              {(Array.isArray(order.products) ? order.products : []).map((item, i) => (
                <div key={i} className='flex gap-4 mt-2 items-center border-b last:border-0 pb-2'>
                  <img src={item?.product_details?.image?.[0]} className='w-12 h-12 object-cover rounded border bg-white' alt="p" />
                  <div className='flex-1'>
                    <p className='font-bold text-gray-800'>{item?.product_details?.name}</p>
                    <p className='text-xs font-black text-green-600'>Qty: {item?.product_details?.quantity ?? item?.quantity ?? item?.qty}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
