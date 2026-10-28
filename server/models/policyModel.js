import mongoose from 'mongoose';

const policySchema = new mongoose.Schema({
  terms: { type: String, default: '' },
  privacy: { type: String, default: '' },
  refund: { type: String, default: '' },
  cancellation: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Policy', policySchema);
