const receiptProcessor = require("../middlewares/receiptProcessor");
const OCRdataPositioner = require("../middlewares/OCRdataPositioner");
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
        console.log(error)
        res.status(422);
        res.json({error});
        return;
    }
    receipt.NIP = positioner.metadata.NIP;
    receipt.sum = Number(positioner.metadata.sum);
    receipt.date = positioner.metadata.date;
    receipt.shop_name = positioner.metadata.shop_name;
    //receipt.NIP = "7791011327";
    console.log(rawReceipt)
    if (!positioner.metadata.isReceipt || typeof receipt.NIP === "undefined" || typeof receipt.sum === "undefined" || typeof positioner.metadata.productSectionEnd === "undefined") {
        res.status(422);
        res.json({'message': 'File is not a receipt!'});
        return;
    }
    let processorResult = receiptProcessor.validateProducts(rawReceipt, positioner.metadata.productSectionStart, positioner.metadata.productSectionEnd, receipt.NIP);
    receipt.products = processorResult.products;
    receipt.errors =  processorResult.errors;
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
        photoReceipt.mv('./photoReceipts/' + req.user.username.toLowerCase() + '/' + photoReceiptName, (err) => {
            if(err){
                res.status(500);
                res.send({
                    message: 'Receipt saving error. Please try again later!'
                })
            } else {
                res.status(201);
                res.send({
                    message: 'File is uploaded!',
                    photoReceiptName: photoReceiptName
                });
            }
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
}