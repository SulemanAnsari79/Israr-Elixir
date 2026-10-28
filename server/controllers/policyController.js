import Policy from '../models/policyModel.js';

const policyKeys = new Set(['terms', 'privacy', 'refund', 'cancellation']);

export const getPolicies = async (_req, res) => {
  try {
    const policies = await Policy.findOne().lean();
    res.json({
      success: true,
      policies: {
        terms: policies?.terms || '',
        privacy: policies?.privacy || '',
        refund: policies?.refund || '',
        cancellation: policies?.cancellation || '',
      },
    });
  } catch (error) {
    console.error('Get policies error:', error);
    res.status(500).json({ success: false, message: 'Could not load policies' });
  }
};

export const getPolicy = async (req, res) => {
  const { policyType } = req.params;
  if (!policyKeys.has(policyType)) {
    return res.status(404).json({ success: false, message: 'Policy not found' });
  }

  try {
    const policies = await Policy.findOne().lean();
    res.json({
      success: true,
      policy: {
        type: policyType,
        content: policies?.[policyType] || '',
      },
    });
  } catch (error) {
    console.error('Get policy error:', error);
    res.status(500).json({ success: false, message: 'Could not load policy' });
  }
};

export const updatePolicies = async (req, res) => {
  try {
    const updates = {};
    for (const key of policyKeys) {
      if (typeof req.body?.[key] !== 'string') {
        return res.status(400).json({ success: false, message: `${key} policy must be text` });
      }
      updates[key] = req.body[key].trim();
    }

    const policies = await Policy.findOneAndUpdate({}, updates, {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    });
    res.json({ success: true, policies, message: 'Policies updated' });
  } catch (error) {
    console.error('Update policies error:', error);
    res.status(500).json({ success: false, message: 'Could not save policies' });
  }
};
