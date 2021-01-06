const Category = require('../models/category');
const ProductType = require('../models/productType')
const {check, validationResult} = require('express-validator');
const bookshelf = require('../config/bookshelf')
const Promise = require('bluebird')
const qs = require('qs');
const _ = require('lodash');

exports.validateCreate = [
    check('name').trim()
        .isLength({min: 3, max: 60}).withMessage('Category name length must be from 3 to 60!')
        .not().isEmpty().withMessage('Category name is required!')
        .custom((value, {req}) => {
            return Category.getByNameAndUserId(value, req.user.id).then((category) => {
                /*if (category !== null) throw new Error('Category ' + value + ' exists!');*/
                if (category !== null && (( typeof req.params.id !== "string")||(req.params.id === category.attributes.id))) throw new Error('Category ' + value + ' exists!');
            });
        })
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
    return Category.create(req.body).then((category => {
        res.status(201);
        return res.send({
            message: "Success!",
            category: category
        })
    })).catch((error) => {
        res.status(503);
        console.log(error.toString())
        return res.send({message: "DB write error"})
    })
}

exports.update = (req, res) => {
    return Category.getById(req.params.id).then((category) => {
        if (category == null) {
            res.status(404)
            return res.json({message: "Category id=" + req.params.id + " not found"})
        }
        if (parseInt(category.attributes.user_id) !== parseInt(req.user.id) && req.user.admin === false) {
            res.status(403)
            return res.send({
                message: "Forbidden access to this category!"
            });
        }
        let params = {
            name: req.body.name,
        }
        return category.save(params,{method:'update', patch:'true'}).then(category => {
            res.status(200)
            return res.send({
                message: "Success!",
                category: category
            })
        })
    }).catch((error) => {
        res.status(503);
        console.log(error.toString())
        return res.send({message: "DB read error"})
    })
}

exports.getByID = (req, res) => {
    return Category.getById(req.params.id).then((category) => {
        if (category == null) {
            res.status(404)
            return res.json({message: "Category id=" + req.params.id + " not found"})
        }
        if (parseInt(category.attributes.user_id) !== parseInt(req.user.id) && req.user.admin === false) {
            res.status(403)
            return res.send({
                message: "Forbidden access to this category!"
            });
        }
        res.status(200)
        return res.json(category)
    }).catch((error) => {
        res.status(503);
        console.log(error.toString())
        return res.send({message: "DB read error"})
    })
}

exports.delete = (req, res) => {
    return Category.getById(req.params.id).then((category) => {
        if (category == null) {
            res.status(404)
            return res.json({message: "Category id=" + req.params.id + " not found"})
        }
        if (parseInt(category.attributes.user_id) !== parseInt(req.user.id) && req.user.admin === false) {
            res.status(403)
            return res.send({
                message: "Forbidden access to this category!"
            });
        }
        return bookshelf.transaction(async (t) => {
            await Promise.all(Promise.map(category.related('productTypes'), async productType => {
                await ProductType.removeCategory(productType.attributes.id, t)
            }))
            return await Category.deleteByID(req.params.id)
        }).then(() => {
            res.status(200);
            return res.send({message: 'Successfully removed category id =' + req.params.id + '!'})
        }).catch((error) => {
            res.status(503);
            console.log(error.toString())
            return res.send({message: "DB delete error"})
        })
    })
}

exports.getAll = async (req,res) => {
    const filtersRaw = qs.parse(req.query);
    const categoryKeys = ['name','user_id']
    if(parseInt(req.query.user_id) !== parseInt(req.user.id) && req.user.admin === false){
        if(isNaN(parseInt(req.query.user_id))){
            res.status(422)
            return res.send({
                message: "User_id query param is missing!"
            });
        }
        res.status(403)
        return res.send({
            message: "Forbidden access to categories of other users!"
        });
    }
    const filters = _.pickBy(filtersRaw,(value, key) => categoryKeys.indexOf(key) > -1)
    Category.findAll(filters).then(result => {
        return res.status(200).json(Object.assign(result, {message:'Success!'}))
    }).catch((error) => {
        res.status(503);
        console.log(error.toString())
        return res.send({message: "DB read error"})
    })
}