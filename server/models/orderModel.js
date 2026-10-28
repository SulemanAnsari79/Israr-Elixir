import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
  items:{type:Array,required:true},
  totalAmount:{type:Number,required:true},
  status:{type:String, default:"Pending"},
  paymentStatus:{type:String, enum:["Pending","Paid","Failed","Refund Pending","Refunded","Refund Rejected","Refund Failed"], default:"Pending"},
  paymentMethod:{type:String, required:true},
  notes:{type:String, default:""},
  razorpayOrderId: { type: String, default: '' },
  razorpayPaymentId: { type: String, default: '' },
  razorpaySignature: { type: String, default: '' },
  refund: {
    status: {
      type: String,
      enum: ['None', 'Initiated', 'Processed', 'Failed'],
      default: 'None'
    },
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    razorpayRefundId: { type: String, default: '' },
    reason: { type: String, default: '' },
    source: { type: String, enum: ['Cancellation', 'Return', ''], default: '' },
    initiatedAt: { type: Date, default: null },
    processedAt: { type: Date, default: null },
    failedAt: { type: Date, default: null },
    failureReason: { type: String, default: '' },
    webhookUpdatedAt: { type: Date, default: null }
  },
  paidAt: { type: Date },
  deliveredAt: { type: Date },
  cancelReason: { type: String, default: '' },
  cancelRequest: {
    status: { type: String, enum: ['None', 'Requested', 'Approved', 'Rejected'], default: 'None' },
    reason: { type: String, default: '' },
    requestDate: { type: Date, default: null },
    decisionDate: { type: Date, default: null },
    adminNotes: { type: String, default: '' },
    decidedBy: { type: String, default: '' }
  },
  returnRequest: {
    status: { type: String, enum: ['None', 'Requested', 'Approved', 'Rejected', 'Completed'], default: 'None' },
    reason: { type: String, default: '' },
    requestDate: { type: Date },
    approvalDate: { type: Date },
    adminNotes: { type: String, default: '' }
  },
  replaceRequest: {
    status: { type: String, enum: ['None', 'Requested', 'Approved', 'Rejected', 'Completed'], default: 'None' },
    reason: { type: String, default: '' },
    requestDate: { type: Date },
    approvalDate: { type: Date },
    adminNotes: { type: String, default: '' }
  },
  returnDeadlineDate: { type: Date },
  shippingDetails:{
    fullName:{type:String,required:true},
    email:{type:String,required:true},
    phone:{type:String,required:true},
    address:{type:String,required:true},
    city:{type:String,required:true},
    state:{type:String,required:true},
    country:{type:String,required:true},
    zip:{type:String,required:true}
  },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  deletedReason: { type: String, default: '' }
},{timestamps:true});

export default mongoose.model("Order",orderSchema);
