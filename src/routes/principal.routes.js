const express = require('express');
const router = express.Router();
const principalController = require('../controllers/principal.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.use(authenticate, authorize(['PRINCIPAL']));

router.get('/content', principalController.getAllContent);
router.get('/content/pending', principalController.getPendingContent);
router.patch('/content/:id/approve', principalController.approveContent);
router.patch('/content/:id/reject', principalController.rejectContent);

module.exports = router;
