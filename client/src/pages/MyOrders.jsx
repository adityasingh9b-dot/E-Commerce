import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import NoData from '../components/NoData';
import axios from 'axios';
import { setOrder } from "../store/orderSlice";

const MyOrders = () => {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.orders?.order || []);
  const reduxUser = useSelector((state) => state.user?.user);
  const localUser = JSON.parse(localStorage.getItem("user"));
  const effectiveUser = reduxUser || localUser?.data || {};

  // Currency Formatter Helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      await axios.delete(`https://ecommerce-backend-gh79.onrender.com/api/order/${orderId}`, {
        withCredentials: true
      });

      alert("✅ Order deleted successfully");

      const res = await axios.get('https://ecommerce-backend-gh79.onrender.com/api/order/order-list', {
        withCredentials: true
      });

      let freshOrders = Array.isArray(res.data.data) ? res.data.data : [];

      if (effectiveUser?.role !== 'ADMIN') {
        freshOrders = freshOrders.filter((order) => {
          const orderUserId = typeof order.userId === 'string' ? order.userId : order.userId?._id;
          return orderUserId?.toString() === effectiveUser?._id?.toString();
        });
      }

      dispatch(setOrder(freshOrders.reverse()));
    } catch (error) {
      console.error("❌ Error deleting order:", error);
      alert("⚠️ Failed to delete order");
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

        const reversed = [...fetchedOrders].reverse();
        dispatch(setOrder(reversed));
      } catch (err) {
        console.error('❌ Error fetching orders:', err.message);
      }
    };

    fetchOrders();
    const intervalId = setInterval(fetchOrders, 5000);
    return () => clearInterval(intervalId);
  }, [effectiveUser, dispatch]);

  return (
    <div className='min-h-screen bg-gray-50 pb-10'>
      <div className='bg-white shadow-md p-4 font-semibold sticky top-0 z-10'>
        <h1 className='text-xl'>My Orders</h1>
      </div>

      <div className='container mx-auto p-4'>
        {!orders || orders.length === 0 ? (
          <NoData />
        ) : (
          orders.map((order, index) => (
            <div
              key={order._id || index}
              className='order rounded-lg p-5 text-sm border bg-white mb-6 shadow-sm hover:shadow-md transition-shadow'
            >
              <div className='flex justify-between items-start border-b pb-3 mb-3'>
                <div>
                  <p className='font-bold text-gray-800 text-base'>
                    Order No: <span className="text-primary-600">#{order.orderId || "N/A"}</span>
                  </p>
                  <p className='text-xs text-gray-400'>
                    Placed on: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Date N/A'}
                  </p>
                </div>
                {/* TOTAL AMOUNT DISPLAY */}
                <div className='text-right'>
                  <p className='text-xs text-gray-500 uppercase font-bold tracking-wider'>Total Amount</p>
                  <p className='text-lg font-black text-green-700'>
                    {formatCurrency(order.totalAmt || order.totalAmount)}
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                <div>
                  <p className='font-semibold text-gray-700 mb-1'>Customer Details</p>
                  <p className='text-gray-600'>Name: {order?.userId?.name || "N/A"}</p>
                  <p className='text-gray-600'>Email: {order?.userId?.email || "N/A"}</p>
                </div>
                <div>
                  <p className='font-semibold text-gray-700 mb-1'>Shipping Address</p>
                  <p className='text-gray-600'>{order?.delivery_address?.address_line || "N/A"}</p>
                  <p className='text-gray-600 font-medium'>📞 {order?.delivery_address?.mobile || "N/A"}</p>
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
                          Qty: {qty ?? 'N/A'} × {item?.product_details?.unit || 'unit'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {effectiveUser?.role === 'ADMIN' && (
                <div className='mt-4 flex justify-end'>
                  <button
                    onClick={() => handleDelete(order._id)}
                    className="bg-red-100 text-red-600 py-2 px-4 rounded-md font-medium hover:bg-red-500 hover:text-white transition-colors border border-red-200"
                  >
                    Delete Order
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyOrders;
