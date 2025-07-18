import Stripe from "../config/stripe.js";
import CartProductModel from "../models/cartproduct.model.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import ProductModel from "../models/product.model.js";
import mongoose from "mongoose";

// ✅ Cash on Delivery
export async function CashOnDeliveryOrderController(request, response) {
  try {
    const userId = request.userId;
    const { list_items, totalAmt, addressId, subTotalAmt } = request.body;

    const orderId = `ORD-${new mongoose.Types.ObjectId()}`;

const products = list_items.map((el) => ({
  productId: new mongoose.Types.ObjectId(el.productId._id),
  product_details: {
    name: el.productId.name,
    image: el.productId.image,
    price: el.productId.price,
    quantity: el.quantity,
  },
}));


    const newOrder = await OrderModel.create({
      userId,
      orderId,
      products,
      paymentId: "",
      payment_status: "CASH ON DELIVERY",
      delivery_address: addressId,
      subTotalAmt,
      totalAmt,
    });

    // Inventory minus
    for (let el of list_items) {
      await ProductModel.findByIdAndUpdate(el.productId._id, {
        $inc: { quantity: -el.quantity },
      });
    }

    // Clear cart
    await CartProductModel.deleteMany({ userId });
    await UserModel.updateOne({ _id: userId }, { shopping_cart: [] });

    return response.json({
      message: "Order placed successfully",
      error: false,
      success: true,
      data: newOrder,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// ✅ Helper for price with discount
export const pricewithDiscount = (price, dis = 1) => {
  const discountAmout = Math.ceil((Number(price) * Number(dis)) / 100);
  const actualPrice = Number(price) - Number(discountAmout);
  return actualPrice;
};

// ✅ Stripe Payment Controller
export async function paymentController(request, response) {
  try {
    const userId = request.userId;
    const { list_items, totalAmt, addressId, subTotalAmt } = request.body;
    const user = await UserModel.findById(userId);

    const line_items = list_items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.productId.name,
          images: item.productId.image,
          metadata: {
            productId: item.productId._id,
          },
        },
        unit_amount:
          pricewithDiscount(item.productId.price, item.productId.discount) * 100,
      },
      adjustable_quantity: {
        enabled: true,
        minimum: 1,
      },
      quantity: item.quantity,
    }));

    const session = await Stripe.checkout.sessions.create({
      submit_type: "pay",
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email,
      metadata: {
        userId,
        addressId,
      },
      line_items,
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });

    return response.status(200).json(session);
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// ✅ Stripe Webhook Order Builder
const getOrderProductItems = async ({
  lineItems,
  userId,
  addressId,
  paymentId,
  payment_status,
}) => {
  const products = [];

  for (const item of lineItems.data) {
    const product = await Stripe.products.retrieve(item.price.product);

    products.push({
      productId: product.metadata.productId,
      product_details: {
        name: product.name,
        image: product.images,
        price: item.amount_total / 100,
        quantity: item.quantity || 1,
      },
    });
  }

  const orderPayload = {
    userId,
    orderId: `ORD-${new mongoose.Types.ObjectId()}`,
    products,
    paymentId,
    payment_status,
    delivery_address: addressId,
    subTotalAmt: products.reduce((sum, p) => sum + p.product_details.price * p.product_details.quantity, 0),
    totalAmt: products.reduce((sum, p) => sum + p.product_details.price * p.product_details.quantity, 0),
  };

  return orderPayload;
};

// ✅ Stripe Webhook Handler
export async function webhookStripe(request, response) {
  const event = request.body;

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const lineItems = await Stripe.checkout.sessions.listLineItems(session.id);
      const userId = session.metadata.userId;

      const orderData = await getOrderProductItems({
        lineItems,
        userId,
        addressId: session.metadata.addressId,
        paymentId: session.payment_intent,
        payment_status: session.payment_status,
      });

      const newOrder = await OrderModel.create(orderData);

      // Update Inventory
      for (let item of orderData.products) {
        await ProductModel.findByIdAndUpdate(item.productId, {
          $inc: { quantity: -item.product_details.quantity },
        });
      }

      // Clear cart
      await UserModel.findByIdAndUpdate(userId, {
        shopping_cart: [],
      });
      await CartProductModel.deleteMany({ userId });

      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  response.json({ received: true });
}

export async function getOrderDetailsController(request, response) {
  try {
    console.log("🔍 getOrderDetailsController called; request.userId =", request.userId);

    const userId = request.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error("❌ Invalid userId:", userId);
      return response.status(400).json({
        message: "Invalid user id",
        error: true,
        success: false
      });
    }

    const user = await UserModel.findById(userId);
    console.log("✅ Found user:", user?._id, "role:", user?.role);

    const isAdmin = user?.role === "ADMIN";
    const filter = isAdmin ? {} : { userId };
    let orders = await OrderModel.find(filter).sort({ createdAt: -1 }).lean();
    console.log("📦 Raw orders count:", orders.length);

    // Ensure productId is ObjectId
    orders = orders.filter(order =>
      order.products.every(p =>
        mongoose.Types.ObjectId.isValid(p.productId)
      )
    );
    console.log("✅ Orders after productId validation:", orders.length);

    const finalOrderList = await OrderModel.find({
      _id: { $in: orders.map(o => o._id) }
    })
      .sort({ createdAt: -1 })
      .populate('delivery_address', 'address_line city state pincode country mobile')
      .populate("userId", "name email")
      .populate("products.productId", "name image price discount quantity")
      .lean();

    console.log("🧾 FinalOrderList:", finalOrderList);

    return response.json({
      message: "Order list",
      data: finalOrderList,
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("🔥 Error in getOrderDetailsController:", error);
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}


