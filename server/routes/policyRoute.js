import express from 'express';
import { adminAuth } from '../middlewares/adminAuth.js';
import { getPolicies, getPolicy, updatePolicies } from '../controllers/policyController.js';

const policyRouter = express.Router();

policyRouter.get('/', getPolicies);
policyRouter.get('/:policyType', getPolicy);
policyRouter.put('/', adminAuth, updatePolicies);

export default policyRouter;
