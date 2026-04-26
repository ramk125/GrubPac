const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.controller');

router.get('/live/:teacher_id', publicController.getLiveContent);

module.exports = router;
