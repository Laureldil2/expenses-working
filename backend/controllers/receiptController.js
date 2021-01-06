const Receipt = require('../models/receipt');
const Product = require('../models/product');
const ProductType = require('../models/productType')
const {check, validationResult} = require('express-validator');
const Promise = require('bluebird')
const bookshelf = require('../config/bookshelf')
const fs = require('fs');
const {join} = require('path');
const moment = require('moment')

exports.validateReceipt = [
    check('shopName').not().isEmpty().withMessage('Shop name is required!'),
    check('NIP').isLength({min: 10, max: 10}).withMessage('NIP length must be equal 10!')
        .isInt().withMessage('NIP must contain only numbers!'),
    check('date').isDate().withMessage('Must be a date!')
        .custom(date => {
            return new Date(date) <= new Date(Date.now());
        }).withMessage('Must be a date from the past!'),
    check('sum').isFloat({gt: 0.0}).withMessage('Sum must be a number greater than 0!')
        .custom((sum, {req}) => {
            let tmpSum = 0;
            req.body.products.forEach(product => {
                tmpSum += product.normalPrice + product.discount
            })
            return Math.round(tmpSum * 100) / 100 === parseFloat(sum)
        }).withMessage("Price sum of all products (normal price + discount) are not equal to sum of receipt"),
    check('products.*.name').not().isEmpty().withMessage('Product name is required!'),
    check('products.*.productTypeId').not().isEmpty().withMessage('ProductTypeId is required!').custom((id, {req}) => {
        if (isNaN(parseInt(id))) return true;
        return ProductType.getById(id).then(productType => {
            if (parseInt(productType.attributes.user_id) !== parseInt(req.user.id)) {
                return Promise.reject()
            }
        })
    }).withMessage('Product type does not exist!'),
    check('products.*.quantity').isFloat({gt: 0.0}).withMessage('Quantity must be a number greater than 0!'),
    check('products.*.unitPrice').isFloat({gt: 0.0}).withMessage('Unit price must be a number greater than 0!'),
    check('products.*.discount').isFloat({max: 0.0}).withMessage('Discount must be a number smaller than or equal 0!'),
    check('products.*.normalPrice').isFloat({gt: 0.0}).withMessage('Normal price must be a number greater than 0!'),
    check('products.*').custom((product, {req}) => {
        return parseFloat(product.normalPrice) === Math.round(product.quantity * product.unitPrice * 100) / 100
    }).withMessage('Quantity * unit price is not equal to normal price')
];

exports.checkReceiptValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422);
        res.json(errors)
        return
    }
    next();
}

exports.addReceipt = async (req, res) => {
    console.log("file: " + req.body.receiptName)
    if (req.body.save)
        req.body.file = req.body.receiptName.substring(req.body.receiptName.lastIndexOf('.') + 1, req.body.receiptName.length)
    else
        req.body.file = null
    let products = req.body.products;
    delete req.body.products;
    req.body.numOfProducts = products.length;
    req.body.userId = req.user.id;
    return bookshelf.transaction((t) => {
        return Receipt.create(req.body, t).tap(receipt => {
            return Promise.map(products, product => {
                return Product.create(product, receipt.id, t);
            })
        })
    }).then(receipt => {
        console.log(receipt)
        if (receipt.attributes.file !== null) {
            //let receiptLoc = __dirname + '/../photoReceipts/'+ req.user.username + '/' + req.body.receiptName;
            let receiptLoc = join(__dirname, '../photoReceipts', req.user.username, req.body.receiptName);
            //let receiptDest = __dirname + '/../receipts/'+ receipt.id + '.' + receipt.attributes.file;
            let receiptDest = join(__dirname, '../receipts', receipt.id + '.' + receipt.attributes.file);
            fs.rename(receiptLoc, receiptDest, err => {
                if (err) {
                    const err = new Error('404 page not found');
                    err.status = 404;
                    throw err;
                }
            })
            console.log(receiptLoc)
            console.log(receiptDest)
        } else if(req.body.receiptName !== '') {
            fs.promises.unlink('./photoReceipts/' + req.user.username + '/' + req.body.receiptName)
        }
        return Receipt.getByID(receipt.id).then((receipt) => {
            res.status(201)
            res.send({message: 'Success!', receipt: receipt})
        })
    }).catch(error => {
        res.status(503);
        res.send({message: "DB write error"})
        console.log(error.toString())
    })
}

exports.getByID = async (req, res) => {
    return Receipt.getByID(req.params.id).then((receipt) => {
        if (receipt == null) {
            res.status(404)
            return res.json({message: "Receipt id=" + req.params.id + " not found"})
        }
        if (parseInt(receipt.attributes.user_id) !== parseInt(req.user.id) && req.user.admin === false) {
            res.status(403)
            return res.send({
                message: "Forbidden access to this receipt!"
            });
        }
        receipt.attributes.date = moment(receipt.attributes.date).format('yyyy-MM-DD')
        res.status(200)
        res.json(receipt)
    }).catch((error) => {
        res.status(503);
        res.send({message: "DB read error"})
        console.log(error.toString())
    })
}

exports.deleteReceipt = async (req, res) => {
    return Receipt.getByID(req.params.id).then((receipt) => {
        if (receipt == null) {
            res.status(404)
            res.json({message: "Receipt id=" + req.params.id + " not found"})
            return
        }
        if (parseInt(receipt.attributes.user_id) !== parseInt(req.user.id) && req.user.admin === false) {
            res.status(403)
            res.send({
                message: "Forbidden access to this receipt!"
            });
            return
        }
        let file = receipt.attributes.file;
        return Receipt.deleteByID(req.params.id).then(() => {
            return Product.deleteByReceiptID(req.params.id).then(async () => {
                if(file!==null){
                    await fs.promises.unlink('./receipts/' + req.params.id + '.' + file)
                }
                res.status(200);
                res.send({message: 'Successfully removed receipt id =' + receipt.id + '!'})
            })
        })
    }).catch((error) => {
        res.status(503);
        res.send({message: "DB delete error"})
        console.log(error.toString())
    })
}

exports.getAll = async (req, res) => {
    let params = {user_id: req.query.user_id}
    if (parseInt(req.query.user_id) !== parseInt(req.user.id) && req.user.admin === false) {
        res.status(403)
        return res.send({
            message: "User_id param required!"
        });
    } else if (isNaN(parseInt(req.query.user_id))) {
        params = {}
    }
    return Receipt.where(params).fetchAll({require: false}).then(receipts => {
        receipts.forEach(receipt => {
            receipt.attributes.date = moment(receipt.attributes.date).format('yyyy-MM-DD')
        })
        let quantity = receipts.length;
        return res.status(200).send({receipts: receipts, quantity})
    }).catch(error => {
        res.status(503);
        console.log(error.toString())
        return res.send({message: "DB read error"})
    })
}

exports.getReceiptFile = async (req, res) => {
    return Receipt.getByID(req.params.id).then(async (receipt) => {
        if (receipt == null) {
            res.status(404)
            return res.json({message: "Receipt id=" + req.params.id + " not found"})
        }
        if (parseInt(receipt.attributes.user_id) !== parseInt(req.user.id) && req.user.admin === false) {
            res.status(403)
            return res.send({
                message: "Forbidden access to this receipt!"
            });
        }

        let filename = req.params.id + '.' + req.params.file;
        try {
            await fs.promises.access('./receipts/' + filename, fs.constants.R_OK)
        } catch (err) {
            res.status(422);
            res.send({
                message: req.params.filename + " not found!"
            });
            return
        }
        res.status(200);
        res.sendFile(`${process.cwd()}/receipts/` + filename)
    })
}


/*const offset = parseInt(req.query.offset)||0;
const perPage = parseInt(req.query.per_page)||1000;

const filters = qs.parse(req.query);
console.log(filters)
const receiptKeys = ['NIP','sum','date','user_id','num_of_products','shop_name']
const filters2 = _.pickBy(filters,(value, key) => receiptKeys.indexOf(key) > -1)
//const quantity = await Receipt.where('sum','>','20').where('sum','<','100').count();
let x = Receipt.where('sum','>','5');
x = x.where('sum','<', '10');
/!*let x = Receipt.whereBetween('sum',[5,10])*!/
//const receipts = await x.fetchPage({offset:offset, limit:perPage});
const quantity = await x.count();
const receipts = await Receipt.where('sum','>','5').orderBy('date','desc').fetchPage({offset:offset, limit:perPage});*/

/*    let products = req.body.products;
    delete req.body.products;
    req.body.num_of_products = products.length;
    bookshelf.transaction((t) => {
    Receipt.create(req.body, {transacting: t}).then(receipt => {
        Promise.map(products, product => receipt.related('products').create(product, {transacting: t})).then(products => {
            receipt.products = products
            res.status(201).send(receipt)
        }).catch(error => {
            res.status(500).send(error.message)
        })
    })}).catch(error => {
        res.status(500).send(error.message)
    })

}*/
/*    let newUser = {
        'username': req.body.username,
        'email': req.body.email,
    }
    newUser.password = await bcrypt.hash(req.body.password, 10);
    User.create(newUser).then(async (user) => {
        delete user.attributes.password;
        await fs.promises.mkdir('./photoReceipts/' + user.attributes.username.toLowerCase())
        res.status(201).json(user)
        res.send({
            message: "Success!",
            user: user
        })*/
/*    .catch((error) => {
        res.status(503);
        res.send({message: "DB write error"})
        console.log(error)
    })
}*/
/*
const fs = require('fs');

exports.process = async (req, res) => {
    if (req.params.user.toLowerCase() !== req.user.username.toLowerCase()) {
        res.status(403)
        res.send({
            message: "Forbidden access to " + req.params.user + "'s receipts"
        });
        return
    }
    let filePath = "photoReceipts/" + req.params.user + "/" + req.params.filename;
    try {
        await fs.promises.access(filePath, fs.constants.R_OK)
    } catch (error) {
        res.status(422);
        res.json({'message': 'PhotoReceipt ' + req.params.filename + ' not found!'});
        return;
    }
    let receipt = {};
    let rawReceipt;
    let rawData;
    try {
        rawData = await receiptProcessor.readWithOCR(filePath);
    } catch (error) {
        res.status(503);
        res.json({'message': 'Error Google Vision API: '+ error.message});
        return;
    }
    let positioner = new OCRdataPositioner.OCRdataPositioner();
    try {
        rawReceipt = positioner.process(rawData);
    } catch (error) {
        res.status(422);
        res.json({error});
        return;
    }
    receipt.NIP = positioner.metadata.NIP;
    receipt.sum = Number(positioner.metadata.sum);
    receipt.date = positioner.metadata.date;
    receipt.shopName = positioner.metadata.shopName;
    if (!positioner.metadata.isReceipt || typeof receipt.NIP === "undefined" || typeof receipt.sum === "undefined" || typeof positioner.metadata.productSectionEnd === "undefined") {
        res.status(422);
        res.json({'message': 'File is not a receipt!'});
        return;
    }
    receipt.products = receiptProcessor.validateProducts(rawReceipt, positioner.metadata.productSectionStart, positioner.metadata.productSectionEnd, receipt.NIP);
    receipt = receiptProcessor.check(receipt);
    res.status(200);
    res.json({receipt})
}

exports.uploadReceipt = async (req, res) => {
    if (!req.files || !req.files.photoReceipt) {
        res.status(422);
        res.send({
            message: 'No file uploaded! Required image field: photoReceipt'
        });
    } else {
        let photoReceipt = req.files.photoReceipt;
        let photoReceiptName = new Date().toISOString().replace(/[:\-.Z]/gi, "").replace(/T/gi, "_") + photoReceipt.name.match(/\..+$/gi)[0];
        photoReceipt.mv('./photoReceipts/' + req.user.username.toLowerCase() + '/' + photoReceiptName);
        res.status(201);
        res.send({
            message: 'File is uploaded!',
            /!*                data: {
                                name: photoReceipt.name,
                                mimetype: photoReceipt.mimetype,
                                size: photoReceipt.size
                            }*!/
        });
    }
};

exports.deletePhotoReceipt = async (req, res) => {
    if (req.params.user.toLowerCase() !== req.user.username.toLowerCase()) {
        res.status(403)
        res.send({
            message: "Forbidden access to " + req.params.user + "'s files"
        });
        return
    }
    try {
        await fs.promises.unlink('./photoReceipts/' + req.params.user + '/' + req.params.filename)
    } catch (err) {
        res.status(422);
        res.send({
            message: req.params.filename + " not found!"
        });
        return
    }
    res.status(200);
    res.send({
        message: req.params.filename + " successfully deleted!"
    })
}

exports.getPhotoReceiptsByUser = async (req, res) => {
    if (req.params.user.toLowerCase() !== req.user.username.toLowerCase()) {
        res.status(403)
        res.send({
            message: "Forbidden access to " + req.params.user + "'s files"
        });
        return
    }
    try {
        await fs.promises.access('./photoReceipts/' + req.params.user, fs.constants.R_OK)
    } catch (err) {
        res.status(202);
        res.send({
            message: req.params.user + "'s receipt's directory not found",
            photoReceiptNames: []
        });
        return
    }
    let photoReceiptNames = await fs.promises.readdir('./photoReceipts/' + req.params.user);
    res.status(200);
    res.send({
        message: "Success!",
        photoReceiptNames: JSON.stringify(photoReceiptNames)
    })
}

exports.getPhotoReceiptFile = async (req, res) => {
    if (req.params.user.toLowerCase() !== req.user.username.toLowerCase()) {
        res.status(403)
        res.send({
            message: "Forbidden access to " + req.params.user + "'s files"
        });
        return
    }
    try {
        await fs.promises.access('./photoReceipts/' + req.params.user + '/' + req.params.filename, fs.constants.R_OK)
    } catch (err) {
        res.status(422);
        res.send({
            message: req.params.filename + " not found!"
        });
        return
    }
    res.status(200);
    res.sendFile(`${process.cwd()}/photoReceipts/`+req.params.user+`/`+req.params.filename)
}*/
