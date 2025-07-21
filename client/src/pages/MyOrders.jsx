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


console.log("👤 Effective User (Redux or LocalStorage):", effectiveUser);
console.log("🔐 Effective User Role:", effectiveUser?.role);

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
        const orderUserId =
          typeof order.userId === 'string'
            ? order.userId
            : order.userId?._id;
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

      console.log("📦 API Response from /api/order/order-list:", res.data);

      let fetchedOrders = Array.isArray(res.data.data) ? res.data.data : [];

      console.log("📥 Fetched Orders (before filtering):", fetchedOrders);

      if (effectiveUser?.role !== 'ADMIN') {
        fetchedOrders = fetchedOrders.filter((order) => {
          const orderUserId =
            typeof order.userId === 'string'
              ? order.userId
              : order.userId?._id;
          return orderUserId?.toString() === effectiveUser?._id?.toString();
        });
        console.log("🔐 Filtered Orders for Normal User:", fetchedOrders);
      } else {
        console.log("🛠 Admin detected. Showing ALL orders.");
      }

      const reversed = [...fetchedOrders].reverse();
      dispatch(setOrder(reversed));
    } catch (err) {
      console.error('❌ Error fetching orders:', err.message);
    }
  };

  fetchOrders(); // ⏱️ Initial fetch on mount

  const intervalId = setInterval(fetchOrders, 5000); // 🔁 Auto-refresh every 5s

  return () => clearInterval(intervalId); // 🔄 Clear interval on unmount
}, [effectiveUser]); // 🔍 Depend on user login state



  console.log("\ud83d\udcca Redux Orders in UI:", orders);

  return (
    <div>
      <div className='bg-white shadow-md p-3 font-semibold'>
        <h1>My Orders</h1>
      </div>

      {!orders || orders.length === 0 ? (
        <NoData />
      ) : (
        orders.map((order, index) => (
          <div
            key={order._id || index}
            className='order rounded p-4 text-sm border-b bg-white mb-4'
          >
            <p className='mb-1 font-medium text-gray-700'>
              Order No:{' '}
              <span className="text-black">{order.orderId || "N/A"}</span>
            </p>
            <p className='mb-1 text-gray-600'>
              Name: {order?.userId?.name || "N/A"}
            </p>
            <p className='mb-1 text-gray-600'>
              Email: {order?.userId?.email || "N/A"}
            </p>
            <p className='mb-1 font-medium text-gray-700'>
              Address:{' '}
              <span className="text-black">
                {order?.delivery_address?.address_line || "N/A"}
              </span>
            </p>
            <p className='mb-1 font-medium text-gray-700'>
              Phone:{' '}
              <span className="text-black">
                {order?.delivery_address?.mobile || "N/A"}
              </span>
            </p>

            {(Array.isArray(order.products) ? order.products : []).map((item, i) => {
              const qty =
                item?.product_details?.quantity ??
                item?.quantity ??
                item?.qty ??
                null;
              return (
                <div key={i} className='flex gap-3 mt-2 items-center'>
                  <img
                    src={item?.product_details?.image?.[0] || ''}
                    alt={item?.product_details?.name || 'Product'}
                    className='w-14 h-14 object-cover rounded border'
                  />
                  <div>
                    <p className='font-medium'>
                      {item?.product_details?.name || 'Unnamed Product'}
                    </p>
                    <p className='text-xs text-gray-500'>
                      Quantity: {qty ?? 'N/A'}{' '}
                      {item?.product_details?.unit || ''}
                    </p>
                  </div>
                </div>
              );
            })}

            {effectiveUser?.role === 'ADMIN' && (
  <button
    onClick={() => handleDelete(order._id)}
    className="mt-4 bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
  >
    Delete Order
  </button>
)}
          </div>
        ))
      )}
    </div>
  );
};

export default MyOrders;

