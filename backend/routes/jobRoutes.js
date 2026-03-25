const express = require('express');
const {
  createJob,
  getJobs,
  getJobById,
  applyForJob,
  getApplications,
  getFreelancerJobs,
  depositEscrow,
  releaseEscrow,
  disputeEscrow,
  resolveEscrow,
  getAgentDisputes
} = require('../controllers/jobController');
const router = express.Router();

// Escrow routes
router.get('/escrow/disputes/:agent_id', getAgentDisputes);
router.post('/:id/escrow/deposit', depositEscrow);
router.post('/:id/escrow/release', releaseEscrow);
router.post('/:id/escrow/dispute', disputeEscrow);
router.post('/:id/escrow/resolve', resolveEscrow);

// Client routes
router.post('/', createJob);
router.get('/', getJobs);
router.get('/:id', getJobById);
router.get('/:id/applications', getApplications);

// Freelancer routes
router.post('/:id/apply', applyForJob);
router.get('/freelancer/:id', getFreelancerJobs);

module.exports = router;
