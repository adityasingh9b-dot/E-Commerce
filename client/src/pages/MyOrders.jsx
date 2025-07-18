import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import NoData from '../components/NoData';
import axios from 'axios';
import { setOrder } from "../store/orderSlice";

const MyOrders = () => {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.orders?.order || []);
  const user = useSelector((state) => state.auth?.user);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('/api/order/order-list');
        console.log("✅ API Response:", res.data);

        // API returns { success, error, message, data: [...] }
        let fetchedOrders = Array.isArray(res.data.data) ? res.data.data : [];
        console.log("📦 Fetched Orders (before filter):", fetchedOrders);

        // 🔐 Normal user ko sirf apne hi orders dikhane hain
        if (user && user.role !== 'ADMIN') {
          fetchedOrders = fetchedOrders.filter((order) => {
            const orderUserId =
              typeof order.userId === 'string'
                ? order.userId
                : order.userId?._id;
            return orderUserId?.toString() === user?._id?.toString();
          });
          console.log("🔒 Filtered Orders for User:", fetchedOrders);
        }

        // reverse karke latest top pe
        const reversed = [...fetchedOrders].reverse();
        dispatch(setOrder(reversed));
        console.log("🚀 Orders stored in Redux:", reversed);
      } catch (err) {
        console.error('❌ Error fetching orders:', err);
      }
    };

    fetchOrders();
  }, [dispatch, user]);

  console.log("📊 Redux Orders in UI:", orders);

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
              // 🌟 Safe quantity extraction
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
          </div>
        ))
      )}
    </div>
  );
};

export default MyOrders;

