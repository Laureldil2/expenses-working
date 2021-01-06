const vision = require('@google-cloud/vision')
const fs = require('fs')
const stringSimilarity = require('string-similarity')

exports.readWithOCR = async (filePath) => {
    const clientOptions = {
        apiEndpoint: 'eu-vision.googleapis.com',
        keyFilename: 'config/googleKey.json'
    };

    const options = {
        imageContext: {
            languageHints: ["pl"],
        }
    };

    const client = new vision.ImageAnnotatorClient(clientOptions);
    let result = await client.documentTextDetection(filePath, options);
    console.log("RAW OCR")
    console.log(result[0].textAnnotations[0].description)
    console.log("-----")
    return result[0].textAnnotations;
}

exports.validateProducts = (rawReceipt, startLine, endLine, NIP) => {
    console.log("Raw\n" + rawReceipt)
    let errors = [];
    let products = [];
    let productsNames = [];
    let firstWordOfProductsnames = []
    let productsLines = rawReceipt.split("\n").slice(startLine, endLine + 1);
    //console.log(productsLines);
    for (let i = 0; i < productsLines.length; i++) {
        //console.log(productsLines[i]);
        //console.log(productsLines[i].replace(/[^a-z0-9 żźćńółęąś]/gi, ""))
        let product = {}
        //console.log(productsLines[i])
        productsLines[i] = productsLines[i].replace(/-?[0-9].*/, productLine => {
            //console.log(productLine)
            productLine = productLine.replace(/..$/i, "");
            //productLine = productLine.slice(0,productLine.length-1);
            //productLine = productLine.substr(0,productLine.length-1)
            //console.log(productLine)
            if (productLine.search(/[^.][0-9]{2}$/i) !== -1) {
                if (productLine.charAt(productLine.length - 3) === " ")
                    productLine = productLine.substr(0, productLine.length - 3) + "." + productLine.substr(productLine.length - 2, productLine.length);
                else
                    productLine = productLine.substr(0, productLine.length - 2) + "." + productLine.substr(productLine.length - 2, productLine.length);
            }
            if (productLine.search(/[^[0-9]\.[0-9]{2}$/i) !== -1) {
                productLine = productLine.substr(0, productLine.length - 4) + productLine.substr(productLine.length - 3, productLine.length);
            }
            let position = productLine.search(/[^.][0-9]{2}(?= [0-9]*\.[0-9]{2}$)/i);
            if (position !== -1) {
                if (productLine.charAt(position) === " ")
                    productLine = productLine.substr(0, position) + "." + productLine.substr(position + 1, productLine.length);
                else
                    productLine = productLine.substr(0, position + 1) + "." + productLine.substr(position + 1, productLine.length);
            }
            position = productLine.search(/[^[0-9]\.[0-9]{2}(?= [0-9]*\.[0-9]{2}$)/i);
            if (position !== -1) {
                productLine = productLine.substr(0, position) + productLine.substr(position + 1, productLine.length);
            }
            return productLine
        })
        console.log(`Line:` +productsLines[i])
        if (productsLines[i].search(/rabat/i) !== -1) {
            let discount = Number(productsLines[i].match(/-[0-9]+.[0-9]{2}/gi)[0])
            if (NIP === "7791011327") { //receipts from Biedronka
                products[products.length - 1].discount = discount;
            } else {
/*                console.log(productsLines[i])*/
                let discountName = productsLines[i].match(/(?<=rabat )[^ ]+(?= .+ -[0-9]+.[0-9]{2})/gi)[0] //uwzgledniac tylko 1 slowo z rabatu
                discountName = discountName.replace(/ g/gi, "g");
                discountName = discountName.replace(/(?<=[0-9]{2})[89](?=$| )/gi, "g");
                discountName = discountName.replace(/[^a-z0-9 żźćńółęąś]/gi, "")
                discountName = discountName.replace(/ /gi, "");
                products[stringSimilarity.findBestMatch(discountName.toLowerCase(), firstWordOfProductsnames).bestMatchIndex].discount = discount; //productsNames as second parameter
/*                console.log(discountName)
                console.log(productsLines[i])
                console.log(stringSimilarity.findBestMatch(discountName.toLowerCase(), firstWordOfProductsnames))*/
            }
        } else {
            /*console.log(`Line:` +productsLines[i])*/
                let splitValues = productsLines[i].split(" ");
                try {
                    product.name = productsLines[i].match(/.*(?= (([0-9]+)|([0-9]+\.[0-9]{2,3}))( [0-9]+\.[0-9]{2}){2}$)/i)[0];
                    product.name = product.name.replace(/ g/gi, "g");
                    product.name = product.name.replace(/(?<=[0-9]{2})[89](?=$| )/gi, "g");
                    product.name = product.name.replace(/[^a-z0-9 żźćńółęąś.,/]/gi, "")
                    product.name = product.name.toLowerCase();
                } catch (e){
                    console.log("Problem with product name nr " + i+1.0 + ": " +e.toString())
                    errors.push({
                        id: i,
                        msg: "Problem with product nr " + i+1.0 + ": " +e.toString()
                    })
                    product.name = productsLines[i];
                }
                //product.name = product.name.replace(/ /gi,"");
                try {
                product.quantity = Number(splitValues[splitValues.length - 3]);
                } catch (e){
                    console.log("Problem with product quantity nr " + i+1.0 + ": " +e.toString())
                    product.quantity = 0;
                }
                try {
                product.unit_price = Number(splitValues[splitValues.length - 2]);
                } catch (e){
                    console.log("Problem with product unit price nr " + i+1.0 + ": " +e.toString())
                    product.unit_price = 0;
                }
                try {
                product.total_price = Number(splitValues[splitValues.length - 1]);
                } catch (e){
                    console.log("Problem with product total price " + i+1.0 + ": " +e.toString())
                    product.total_price = 0;
                }
                product.discount = 0;
                products.push(product)
                productsNames.push(product.name);
                firstWordOfProductsnames.push(product.name.split(" ")[0].toLowerCase())
            /*productsNames.push(product.name);*/ //<--check
        }

    }
    return {products: products, errors:errors}
}

exports.check = (receipt) => {
    let sum = 0;
    receipt.products.forEach(product => {
        product.isValid = Math.round(product.quantity * product.unit_price * 100) / 100 === product.total_price;
        sum += product.total_price + product.discount
        console.log(product.name+ " " +sum)
    })
    receipt.isValid = Math.round(sum* 100) / 100 === receipt.sum
    //console.log(sum+" ==="+receipt.sum)
    if (!receipt.isValid) {
        sum = 0;
        let copyProducts = JSON.parse(JSON.stringify(receipt.products));
        copyProducts.forEach(product => {
            if (!product.isValid) {
                product.total_price = product.quantity * product.unit_price;
                product.isValid = true;
            }
            sum += product.total_price + product.discount
        })
        if (Math.round(sum* 100) / 100 === receipt.sum) {
            receipt.products = copyProducts;
            receipt.isValid = true;
        }
    }
    return receipt
}