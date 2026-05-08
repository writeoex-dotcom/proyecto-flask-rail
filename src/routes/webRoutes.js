const express = require('express');
const homeController = require('../controllers/homeController');
const preferenceController = require('../controllers/preferenceController');
const authController = require('../controllers/authController');
const cartController = require('../controllers/cartController');
const adminController = require('../controllers/adminController');
const { requireClient, requireAdmin } = require('../middleware/locals');
const { asyncHandler } = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(homeController.home));
router.get('/product/:id', asyncHandler(homeController.productDetail));
router.post('/preferences', asyncHandler(preferenceController.updatePreferences));
router.get('/register', authController.showRegister);
router.post('/register', asyncHandler(authController.register));
router.get('/verify', authController.showVerify);
router.post('/verify', asyncHandler(authController.verify));
router.get('/login', authController.showLogin);
router.post('/login', asyncHandler(authController.login));
router.get('/logout', authController.logout);
router.get('/cart', requireClient, asyncHandler(cartController.cart));
router.post('/cart/add/:id', requireClient, asyncHandler(cartController.addToCart));
router.get('/admin', requireAdmin, asyncHandler(adminController.dashboard));

module.exports = router;
