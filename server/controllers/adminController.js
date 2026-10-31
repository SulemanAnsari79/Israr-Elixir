import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import Notice from "../models/noticeModel.js";
import bcrypt from "bcrypt";
import { signAccessToken } from "../utils/jwt.js";
import { clearAuthCookie, setAuthCookie } from "../utils/authCookie.js";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
 
 
const toYmd = (dateInput) => {
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return null;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const addDays = (ymd, days) => {
  const d = new Date(ymd);
  d.setDate(d.getDate() + days);
  return toYmd(d);
};
 
//Email sending utility functions
const createEmailTransporter = () =>
  process.env.EMAIL_HOST
    ? nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === "true",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      })
    : nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const normalizeRecipients = (items = [], type = "") =>
  items
    .filter((item) => item?.email)
    .map((item) => ({
      id: String(item._id),
      name: item.name || "",
      email: item.email,
      type,
}));

const getRecipientsForGroup = async (group) => {
  if (group === "users") {
    const users = await User.find({ isActive: true }).select("name email");
    return normalizeRecipients(users, "users");
  }

  if (group === "doctors") {
    const doctors = await Doctor.find({}).select("name email");
    return normalizeRecipients(doctors, "doctors");
  }

  if (group === "delivery-men") {
    const deliveryMen = await DeliveryMan.find({ isActive: true }).select("name email");
    return normalizeRecipients(deliveryMen, "delivery-men");
  }

  return [];
};

const getNoticeTargetText = (scope, group, recipientType) => {
  if (scope === "all") return "All recipients";
  if (scope === "group") return `Group: ${group}`;
  if (scope === "individual") return `Individual (${recipientType})`;
  return "Unknown";
};

const normalizeRuleList = (input) => {
  const values = Array.isArray(input)
    ? input
    : String(input || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  return Array.from(new Set(values));
};


//Admin Authentication Controller functions
export const adminLogin = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({success:false, message:"Email and password required"});
    }

    if (email === process.env.ADMIN_EMAIL?.trim().toLowerCase() && password === process.env.ADMIN_PASSWORD) {
        const token = signAccessToken({ _id: "admin", role: "admin", email });
        setAuthCookie(res, token);
        res.status(200).json({
          success:true,
          message: "Admin logged in successfully",
          user: { id: "admin", email: email, role: "admin" }
        });
    }
    else{
        res.status(401).json({success:false, message:"Invalid credentials"});
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({success:false, message:"Server error" });
  }
};

export const adminLogout = async (req, res) => {
  try {
    clearAuthCookie(res);
    res.status(200).json({ success: true, message: "Admin logged out successfully" });
  }
  catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const adminDashboard = async (req, res) => {
  try {
    return res.status(200).json({success: true,message: "Welcome Admin"});
  } catch (error) {
    res.status(500).json({ success:false, message:"Server error" });
  }
};


//Admin Stats Controller function
export const sendNoticeEmails = async (req, res) => {
  try {
    const { scope, group, recipientType, recipientIds, subject, message } = req.body;

    if (!subject || !subject.trim()) {
      return res.status(400).json({ success: false, message: "Email subject is required" });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Email message is required" });
    }

    if (!["all", "group", "individual"].includes(scope)) {
      return res.status(400).json({ success: false, message: "Invalid scope" });
    }

    let recipients = [];

    if (scope === "all") {
      const [users, doctors, deliveryMen] = await Promise.all([
        getRecipientsForGroup("users"),
        getRecipientsForGroup("doctors"),
        getRecipientsForGroup("delivery-men"),
      ]);
      recipients = [...users, ...doctors, ...deliveryMen];
    }

    if (scope === "group") {
      if (!["users", "doctors", "delivery-men"].includes(group)) {
        return res.status(400).json({ success: false, message: "Invalid group" });
      }
      recipients = await getRecipientsForGroup(group);
    }

    if (scope === "individual") {
      if (!["users", "doctors", "delivery-men"].includes(recipientType)) {
        return res.status(400).json({ success: false, message: "Invalid recipient type" });
      }

      if (!Array.isArray(recipientIds) || recipientIds.length === 0) {
        return res.status(400).json({ success: false, message: "At least one recipient is required" });
      }

      const ids = recipientIds.map((id) => String(id));

      if (recipientType === "users") {
        const users = await User.find({ _id: { $in: ids } }).select("name email");
        recipients = normalizeRecipients(users, "users");
      }

      if (recipientType === "doctors") {
        const doctors = await Doctor.find({ _id: { $in: ids } }).select("name email");
        recipients = normalizeRecipients(doctors, "doctors");
      }

      if (recipientType === "delivery-men") {
        const deliveryMen = await DeliveryMan.find({ _id: { $in: ids } }).select("name email");
        recipients = normalizeRecipients(deliveryMen, "delivery-men");
      }
    }

    const uniqueRecipients = Array.from(
      new Map(recipients.map((recipient) => [recipient.email, recipient])).values()
    );

    if (uniqueRecipients.length === 0) {
      return res.status(404).json({ success: false, message: "No recipients found" });
    }

    const transporter = createEmailTransporter();

    const mailResults = await Promise.allSettled(
      uniqueRecipients.map((recipient) =>
        transporter.sendMail({
          from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
          to: recipient.email,
          subject: subject.trim(),
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #f9fafb; border-radius: 8px; overflow: hidden;">
              <div style="background: #2563eb; padding: 16px 20px; color: #fff;">
                <h2 style="margin: 0; font-size: 20px;">SehatRazz Notice</h2>
              </div>
              <div style="background: #fff; padding: 20px; color: #1f2937; line-height: 1.6;">
                <p style="margin-top: 0;">Hello ${recipient.name || "there"},</p>
                <p style="white-space: pre-wrap;">${message}</p>
                <p style="margin-bottom: 0; color: #6b7280; font-size: 13px;">This is an automated notice from SehatRazz Admin.</p>
              </div>
            </div>
          `,
        })
      )
    );

    const failedRecipients = [];
    mailResults.forEach((result, index) => {
      if (result.status === "rejected") {
        failedRecipients.push({
          email: uniqueRecipients[index].email,
          reason: result.reason?.message || "Failed to send",
        });
      }
    });

    const totalRecipients = uniqueRecipients.length;
    const sentCount = totalRecipients - failedRecipients.length;
    const failedCount = failedRecipients.length;

    await Notice.create({
      subject: subject.trim(),
      message: message.trim(),
      scope,
      group: group || "",
      recipientType: recipientType || "",
      recipientIds: Array.isArray(recipientIds)
        ? recipientIds.map((id) => String(id))
        : [],
      totalRecipients,
      sentCount,
      failedCount,
      createdBy: req.admin?.id || "admin",
    });

    return res.status(200).json({
      success: true,
      message: "Notice email sending completed",
      totalRecipients,
      sentCount,
      failedCount,
      failedRecipients,
    });
  } catch (error) {
    console.error("Send notice emails error:", error);
    return res.status(500).json({ success: false, message: "Failed to send notice emails" });
  }
};

export const getRecentNotices = async (req, res) => {
  try {
    const notices = await Notice.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select(
        "subject message scope group recipientType totalRecipients sentCount failedCount createdAt"
      );

    const normalized = notices.map((notice) => ({
      ...notice.toObject(),
      targetText: getNoticeTargetText(
        notice.scope,
        notice.group,
        notice.recipientType
      ),
    }));

    return res.status(200).json({ success: true, notices: normalized });
  } catch (error) {
    console.error("Get recent notices error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch recent notices" });
  }
};


//User Management Controller functions
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if(!name || !email || !password){
      return res.status(400).json({message:"All fields required"});
    }

    const exist = await User.findOne({ email });
    if(exist){
      return res.status(400).json({message:"User already exists"});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    res.status(201).json({success:true, user});
  } catch (error) {
    res.status(500).json({message:"Failed to create user"});
  }
};

const getUserById = async (req,res)=>{
  try{
    const user = await User.findById(req.params.id).select("-password");
    if(!user) return res.status(404).json({message:"User not found"});
    res.json(user);
  }catch(err){
    res.status(500).json({message:"Invalid ID"});
  }
};


//Product Management Controller functions
const createProduct = async (req, res) => {
    try {
      const { name, description, price, category, sizes, bestSeller, stock } = req.body;

      // Validate required fields
      if (!name || !description || !price || !category || !stock) {
        return res.status(400).json({ success: false, message: 'Name, description, price, category, and stock are required' });
      }

      if (price <= 0 || stock < 0) {
        return res.status(400).json({ success: false, message: 'Invalid price or stock value' });
      }

      const images = [];

      if (req.files.image1) images.push(req.files.image1[0]);
      if (req.files.image2) images.push(req.files.image2[0]);
      if (req.files.image3) images.push(req.files.image3[0]);
      if (req.files.image4) images.push(req.files.image4[0]);

      if (images.length === 0) {
        return res.status(400).json({ success: false, message: 'At least one product image is required' });
      }

      const imagesUrl = await Promise.all(
        images.map(async (item) => {
          const result = await cloudinary.uploader.upload(item.path, {
            resource_type: "image"
          });
          return result.secure_url;
        })
      );
    
      const productData = {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        images: imagesUrl,
        sizes: sizes ? JSON.parse(sizes) : [],
        category,
        bestSeller: bestSeller === "true",
        date: Date.now()
      };
    
      const product = new productModel(productData);
      await product.save();
    
      res.json({ success: true, message: "Product added" });
    
    }catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }

}

const getAllProducts = async (req,res)=>{
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
};

const getProductById = async (req,res)=>{
  const product = await Product.findById(req.params.id);
  if(!product) return res.status(404).json({message:"Not found"});
  res.json(product);
};

const updateProduct = async (req,res)=>{
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    {new:true}
  );
  res.json(product);
};

const deleteProduct = async (req,res)=>{
  await Product.findByIdAndDelete(req.params.id);
  res.json({message:"Product deleted"});
};


//Orders Management Controller functions
const getAllOrders = async (req,res)=>{
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json( {orders} ); 
}

const getOrderById = async (req,res)=>{
  const order = await Order.findById(req.params.id);
  if(!order) return res.status(404).json({message:"Not found"});
  res.json(order);
};

const updateOrderStatus = async (req,res)=>{
  const { status } = req.body;

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    {new:true}
  );

  res.json(order);
};

const deleteOrder = async (req,res)=>{
  await Order.findByIdAndDelete(req.params.id);
  res.json({message:"Order deleted"});
};

export const generateOrderInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const invoiceNumber = `INV-${String(order._id).slice(-8).toUpperCase()}`;
    const shipping = order.shippingDetails || {};
    const items = Array.isArray(order.items) ? order.items : [];
    const subtotal = items.reduce(
      (total, item) => total + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );
    const deliveryFee = Math.max(0, Number(order.totalAmount || 0) - subtotal);
    const sellerName = process.env.INVOICE_SELLER_NAME || "ISRAR ELIXIR";
    const sellerAddress = process.env.INVOICE_SELLER_ADDRESS || "";
    const sellerGst = process.env.INVOICE_SELLER_GST || "";
    const formatMoney = (value) => `INR ${Number(value || 0).toFixed(2)}`;
    const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const disposition = req.query.download === "true" ? "attachment" : "inline";

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `${disposition}; filename="${invoiceNumber}.pdf"`);

    const document = new PDFDocument({ size: "A4", margin: 38 });
    document.pipe(res);
    const left = document.page.margins.left;
    const right = document.page.width - document.page.margins.right;
    const contentWidth = right - left;
    const amountColumnX = right - 95;
    const priceColumnX = right - 205;
    const quantityColumnX = right - 310;

    document.roundedRect(left - 14, 24, contentWidth + 28, 748, 14)
      .lineWidth(0.8)
      .strokeColor("#d1d5db")
      .stroke();
    document.font("Helvetica-Bold").fontSize(18).fillColor("#1f2937").text(sellerName, left, 48);
    document.font("Helvetica-Bold").fontSize(9).fillColor("#6b7280").text("TAX INVOICE", left, 73);
    document.font("Helvetica").fontSize(9);
    if (sellerAddress) document.text(sellerAddress, left, 89, { width: 330 });
    if (sellerGst) document.text(`GSTIN: ${sellerGst}`, left, sellerAddress ? 104 : 89);
    document.font("Helvetica-Bold").fontSize(11).fillColor("#1f2937").text(invoiceNumber, right - 150, 48, { width: 150, align: "right" });
    document.font("Helvetica").fontSize(9).fillColor("#4b5563").text(orderDate, right - 150, 73, { width: 150, align: "right" });

    const headerBottom = Math.max(document.y, sellerAddress || sellerGst ? 122 : 104);
    document.strokeColor("#d1d5db").moveTo(left, headerBottom).lineTo(right, headerBottom).stroke();
    const customerNameY = headerBottom + 51;
    const addressY = customerNameY + 22;
    const customerAddress = [
      shipping.address,
      shipping.city,
      shipping.state,
      shipping.country,
      shipping.zip,
    ].filter(Boolean).join(", ");
    const addressHeight = document.heightOfString(customerAddress || " ", { width: 360 });
    const contactY = addressY + addressHeight + 10;
    document.font("Helvetica-Bold").fontSize(11).fillColor("#1f2937").text("Bill To", left, headerBottom + 25);
    document.font("Helvetica").fontSize(10).fillColor("#374151")
      .text(shipping.fullName || "Customer", left, customerNameY)
      .text(customerAddress, left, addressY, { width: 360 })
      .text([shipping.email, shipping.phone].filter(Boolean).join("  •  "), left, contactY);

    const tableTop = contactY + 32;
    document.strokeColor("#d1d5db").moveTo(left, tableTop).lineTo(right, tableTop).stroke();
    document.font("Helvetica-Bold").fontSize(10).fillColor("#374151")
      .text("Item", left, tableTop + 16)
      .text("Qty", quantityColumnX, tableTop + 16, { width: 35, align: "right" })
      .text("Price", priceColumnX, tableTop + 16, { width: 75, align: "right" })
      .text("Amount", amountColumnX, tableTop + 16, { width: 95, align: "right" });
    let rowY = tableTop + 42;
    document.font("Helvetica").fontSize(10);
    items.forEach((item) => {
      const quantity = Number(item.quantity || 0);
      const price = Number(item.price || 0);
      document.fillColor("#374151")
        .text(String(item.name || "Product").slice(0, 48), left, rowY, { width: 250 })
        .text(String(quantity), quantityColumnX, rowY, { width: 35, align: "right" })
        .text(formatMoney(price), priceColumnX, rowY, { width: 75, align: "right" })
        .text(formatMoney(price * quantity), amountColumnX, rowY, { width: 95, align: "right" });
      rowY += 24;
    });
    document.strokeColor("#d1d5db").moveTo(left, rowY).lineTo(right, rowY).stroke();
    rowY += 28;
    const summaryLabelX = right - 180;
    document.font("Helvetica-Bold").fontSize(10).fillColor("#374151")
      .text("Subtotal", summaryLabelX, rowY)
      .text(formatMoney(subtotal), amountColumnX, rowY, { width: 95, align: "right" });
    rowY += 24;
    document.text("Shipping", summaryLabelX, rowY)
      .text(formatMoney(deliveryFee), amountColumnX, rowY, { width: 95, align: "right" });
    rowY += 24;
    document.text("GST", summaryLabelX, rowY)
      .text("Calculated as applicable", left + contentWidth - 180, rowY, { width: 180, align: "right" });
    rowY += 28;
    document.strokeColor("#d1d5db").moveTo(left, rowY).lineTo(right, rowY).stroke();
    rowY += 28;
    document.font("Helvetica-Bold").fontSize(14).fillColor("#1f2937")
      .text("Grand Total", left, rowY)
      .text(formatMoney(order.totalAmount), left + contentWidth - 220, rowY, { width: 220, align: "right" });
    document.fontSize(9).fillColor("#6b7280")
      .text(`Payment: ${order.paymentMethod || "N/A"} (${order.paymentStatus || "Pending"})`, left, rowY + 31)
      .text(`Order status: ${order.status || "Pending"}`, left, rowY + 46)
      .text("Illustrative invoice layout. GST treatment depends on the product, seller, transaction and tax-inclusive pricing.", left, rowY + 76, { width: contentWidth });
    document.end();
  } catch (error) {
    console.error("Generate invoice error:", error);
    if (!res.headersSent) return res.status(500).json({ success: false, message: "Failed to generate invoice" });
    res.destroy(error);
  }
};

const getAdminStats = async (req,res)=>{
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Calculate total revenue from all orders
    const orders = await Order.find({});
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayOrders = await Order.find({ createdAt: { $gte: startOfToday } });
    const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    res.json({
      success: true,
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      todayOrders: todayOrders.length,
      todayRevenue,
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


//Delivery Location Management Controller functions
export const getDeliveryLocationRules = async (req, res) => {
  try {
    const rules = await DeliveryLocationRule.findOne({ singletonKey: "global" });

    return res.status(200).json({
      success: true,
      rules: {
        isEnabled: rules?.isEnabled || false,
        allowedCities: rules?.allowedCities || [],
        allowedStates: rules?.allowedStates || [],
        allowedCountries: rules?.allowedCountries || [],
        allowedPincodes: rules?.allowedPincodes || [],
      },
    });
  } catch (error) {
    console.error("Get delivery location rules error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch delivery location rules" });
  }
};

export const updateDeliveryLocationRules = async (req, res) => {
  try {
    const payload = req.body || {};
    const allowedCities = normalizeRuleList(payload.allowedCities);
    const allowedStates = normalizeRuleList(payload.allowedStates);
    const allowedCountries = normalizeRuleList(payload.allowedCountries);
    const allowedPincodes = normalizeRuleList(payload.allowedPincodes).map((item) => String(item).replace(/\D/g, ""));

    const hasAnyRule =
      allowedCities.length > 0 ||
      allowedStates.length > 0 ||
      allowedCountries.length > 0 ||
      allowedPincodes.length > 0;

    const isEnabled =
      typeof payload.isEnabled === "boolean"
        ? payload.isEnabled
        : hasAnyRule;

    const rules = await DeliveryLocationRule.findOneAndUpdate(
      { singletonKey: "global" },
      {
        singletonKey: "global",
        isEnabled,
        allowedCities,
        allowedStates,
        allowedCountries,
        allowedPincodes,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Delivery location rules updated",
      rules,
    });
  } catch (error) {
    console.error("Update delivery location rules error:", error);
    return res.status(500).json({ success: false, message: "Failed to update delivery location rules" });
  }
};

export const assignOrderToDelivery = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryManId } = req.body;

    if (!deliveryManId) {
      return res.status(400).json({ success: false, message: "deliveryManId is required" });
    }

    const dm = await DeliveryMan.findById(deliveryManId);
    if (!dm) return res.status(404).json({ success: false, message: "Delivery man not found" });

    const order = await Order.findByIdAndUpdate(
      orderId,
      { assignedTo: deliveryManId },
      { new: true }
    ).populate("assignedTo", "name email phone");

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    res.status(200).json({ success: true, message: "Order assigned to delivery man successfully", order });
  } catch (error) {
    console.error("Assign order error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { adminDashboard,
  createUser,
  getUserById,
  getAdminStats,
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
 };