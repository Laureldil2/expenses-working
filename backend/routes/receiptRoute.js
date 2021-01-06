const receiptController = require('../controllers/receiptController')
const express = require('express')
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken')
const {catchAsync} = require('../middlewares/errors')

router.post('/', authenticateToken.checkToken,receiptController.validateReceipt,receiptController.checkReceiptValidation,catchAsync(receiptController.addReceipt))
router.get('/',authenticateToken.checkToken, catchAsync(receiptController.getAll))
router.get('/:id',authenticateToken.checkToken, catchAsync(receiptController.getByID));
router.delete('/:id',authenticateToken.checkToken, catchAsync(receiptController.deleteReceipt));
router.get('/:id/file/:file',authenticateToken.checkToken, receiptController.getReceiptFile);
/*router.get('/file/:user-:filename',authenticateToken.checkToken, catchAsync(photoReceiptController.getPhotoReceiptFile))
router.get('/:user-:filename',authenticateToken.checkToken, catchAsync(photoReceiptController.process))
router.get('/:user',authenticateToken.checkToken, catchAsync(photoReceiptController.getPhotoReceiptsByUser))
router.delete('/:user-:filename', authenticateToken.checkToken, catchAsync(photoReceiptController.deletePhotoReceipt))*/

module.exports = router;