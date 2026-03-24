const express = require('express');
const {
  createJob,
  getJobs,
  getJobById,
  applyForJob,
  getApplications,
  getFreelancerJobs
} = require('../controllers/jobController');
const router = express.Router();

// Client routes
router.post('/', createJob);
router.get('/', getJobs);
router.get('/:id', getJobById);
router.get('/:id/applications', getApplications);

// Freelancer routes
router.post('/:id/apply', applyForJob);
router.get('/freelancer/:id', getFreelancerJobs);

module.exports = router;
