const ProductType = require('../models/productType');
const Product = require('../models/product')
const Category = require('../models/category');
const {check, validationResult} = require('express-validator');
const qs = require('qs');
const _ = require('lodash');

exports.validateCreate = [
    check('name').trim()
        .isLength({min: 3, max: 60}).withMessage('Product type name length must be from 3 to 60!')
        .not().isEmpty().withMessage('Product type name is required!')
        .custom((value, {req}) => {
            return ProductType.getByNameAndUserId(value, req.user.id).then((productType) => {
                if (productType !== null && (( typeof req.params.id !== "string")||(req.params.id === productType.attributes.id))) throw new Error('Product type ' + value + ' exists!');
            });
        }),
    check('categoryID')
        .custom((value, {req}) => {
        return Category.getById(value).then((category) => {
            if(category === null) throw new Error('Category not found!');
            if (parseInt(category.attributes.user_id) !== parseInt(req.user.id)) {
                throw new Error('Forbidden access to this category!');
            }
    })
    }),
]

exports.checkCreateValidaton = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422);
        return res.send(errors)
    }
    next();
}

exports.create = (req, res) => {
    req.body.userID = req.user.id;
    return ProductType.create(req.body).then((productType => {
        res.status(201);
        return res.send({
            message: "Success!",
            productType: productType
        })
    })).catch((error) => {
        res.status(503);
        console.log(error.toString())
        return res.send({message: "DB write error"})
    })
}

exports.getByID = (req, res) => {
    return ProductType.getById(req.params.id).then((productType) => {
        if (productType == null) {
            res.status(404)
            return res.json({message: "Product type id=" + req.params.id + " not found"})
        }
        if (parseInt(productType.attributes.user_id) !== parseInt(req.user.id) && req.user.admin === false) {
            res.status(403)
            return res.send({
                message: "Forbidden access to this product type!"
            });
        }
        res.status(200)
        return res.json(productType)
    }).catch((error) => {
        res.status(503);
        console.log(error.toString())
        return res.send({message: "DB read error"})
    })
}

exports.update = (req, res) => {
    return ProductType.getById(req.params.id).then((productType) => {
        if (productType == null) {
            res.status(404)
            return res.json({message: "Product type id=" + req.params.id + " not found"})
        }
        if (parseInt(productType.attributes.user_id) !== parseInt(req.user.id) && req.user.admin === false) {
            res.status(403)
            return res.send({
                message: "Forbidden access to this product type!"
            });
        }
        let params = {
            name: req.body.name,
            category_id: req.body.categoryID
        }
        return productType.save(params,{method:'update', patch:'true'}).then(productType => {
            res.status(200)
            return res.send({
                message: "Success!",
                productType: productType
            })
        })
    }).catch((error) => {
        res.status(503);
        console.log(error.toString())
        return res.send({message: "DB read error"})
    })
}

exports.delete = (req, res) => {
    return ProductType.getById(req.params.id).then((productType) => {
        if (productType == null) {
            res.status(404)
            return res.json({message: "Product type id=" + req.params.id + " not found"})
        }
        if (parseInt(productType.attributes.user_id) !== parseInt(req.user.id) && req.user.admin === false) {
            res.status(403)
            return res.send({
                message: "Forbidden access to this product type!"
            });
        }
        return Product.getByProductType(req.params.id).then((products) => {
            if(products.length !== 0) {
                res.status(422)
                return res.send({message: 'Can not delete: Product type is connected with at least one product!'})
            }
            return ProductType.deleteByID(req.params.id).then((productType) => {
                res.status(200);
                return res.send({message: 'Successfully removed product type id =' + req.params.id + '!'})

            })
        }).catch((error) => {
            res.status(503);
            console.log(error.toString())
            return res.send({message: "DB delete error"})
        })
    })
}

exports.getAll = async (req,res) => {
    const filtersRaw = qs.parse(req.query);
    const productTypeKeys = ['name','category_id','user_id']
    if(parseInt(req.query.user_id) !== parseInt(req.user.id) && req.user.admin === false){
        if(isNaN(parseInt(req.query.user_id))){
            res.status(422)
            return res.send({
                message: "User_id query param is missing!"
            });
        }
        res.status(403)
        return res.send({
            message: "Forbidden access to product types of other users!"
        });
    }
    const filters = _.pickBy(filtersRaw,(value, key) => productTypeKeys.indexOf(key) > -1)
    ProductType.findAll(filters).then(result => {
        return res.status(200).json(Object.assign(result, {message:'Success!'}))
    }).catch((error) => {
        res.status(503);
        console.log(error.toString())
        return res.send({message: "DB read error"})
    })
}