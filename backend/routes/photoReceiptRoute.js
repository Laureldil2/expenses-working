const photoReceiptController = require('../controllers/photoReceiptController')
const express = require('express')
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken')
const {catchAsync} = require('../middlewares/errors')

router.post('/', authenticateToken.checkToken, catchAsync(photoReceiptController.uploadReceipt))
router.get('/file/:user-:filename',authenticateToken.checkToken, catchAsync(photoReceiptController.getPhotoReceiptFile))
router.get('/:user-:filename',authenticateToken.checkToken, catchAsync(photoReceiptController.process))
router.get('/:user',authenticateToken.checkToken, catchAsync(photoReceiptController.getPhotoReceiptsByUser))
router.delete('/:user-:filename', authenticateToken.checkToken, catchAsync(photoReceiptController.deletePhotoReceipt))

module.exports = router;