const express = require('express');
const homeController = require('../controllers/homeController');
const preferenceController = require('../controllers/preferenceController');
const authController = require('../controllers/authController');
const cartController = require('../controllers/cartController');
const adminController = require('../controllers/adminController');
const { requireClient, requireAdmin } = require('../middleware/locals');

const router = express.Router();

router.get('/', homeController.home);
router.get('/product/:id', homeController.productDetail);
router.post('/preferences', preferenceController.updatePreferences);
router.get('/register', authController.showRegister);
router.post('/register', authController.register);
router.get('/verify', authController.showVerify);
router.post('/verify', authController.verify);
router.get('/login', authController.showLogin);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.get('/cart', requireClient, cartController.cart);
router.post('/cart/add/:id', requireClient, cartController.addToCart);
router.get('/admin', requireAdmin, adminController.dashboard);

module.exports = router;
