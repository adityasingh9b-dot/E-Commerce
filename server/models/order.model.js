import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User", // this must match your UserModel name
  required: true,
},
 
    orderId: {
        type: String,
        required: [true, "Provide orderId"],
        unique: true
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.ObjectId,
                ref: "product"
            },
            product_details: {
                name: String,
                image: [String],
                price: Number,
                quantity: Number
            }
        }
    ],
    paymentId: {
        type: String,
        default: ""
    },
    payment_status: {
        type: String,
        default: ""
    },

delivery_address: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "address",
  required: true,
},


   subTotalAmt: {
        type: Number,
        default: 0
    },
    totalAmt: {
        type: Number,
        default: 0
    },
    invoice_receipt: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

const OrderModel = mongoose.model('order', orderSchema);
export default OrderModel;

