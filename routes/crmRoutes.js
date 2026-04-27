const express = require('express');
const router = express.Router();
const crmController = require('../controllers/crmController');
const { verifyToken } = require('../controllers/authController');

router.get('/:module', verifyToken, crmController.getAll);
router.post('/:module', verifyToken, crmController.create);
router.put('/:module/:id', verifyToken, crmController.update);
router.delete('/:module/:id', verifyToken, crmController.remove);

module.exports = router;
