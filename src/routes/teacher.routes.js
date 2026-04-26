const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacher.controller');
const upload = require('../middlewares/upload.middleware');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.post('/content', authenticate, authorize(['TEACHER']), upload.single('file'), teacherController.uploadContent);
router.get('/content', authenticate, authorize(['TEACHER']), teacherController.getMyContent);

module.exports = router;
