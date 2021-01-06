const User = require('../models/user');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const key = require('../data/key.js');
const fs = require('fs');
const {check, validationResult} = require('express-validator');

exports.register = async (req, res) => {
    let newUser = {
        'username': req.body.username.toLowerCase(),
        'email': req.body.email,
    }
    newUser.password = await bcrypt.hash(req.body.password, 10);
    User.create(newUser).then(async (user) => {
        delete user.attributes.password;
        await fs.promises.mkdir('./photoReceipts/' + user.attributes.username.toLowerCase())
        let expirationTimeInSec = 10800;
        User.login(user.attributes.username)
        let token = jwt.sign({
            id: user.attributes.id,
            username: user.attributes.username,
            admin: user.attributes.admin,
        }, key.tokenKey, {expiresIn: expirationTimeInSec}); //1200
        user.attributes.token = token;
        user.attributes.expiresIn = expirationTimeInSec*1000;
        res.status(201);
        res.send({
            message: "Success!",
            user: user
        })
    }).catch((error) => {
        res.status(503);
        res.send({message: "DB write error"})
        console.log(error)
    })
}

exports.validateRegister = [
    check('username').trim()
        .isLength({min: 5, max: 30}).withMessage('Username length must be from 5 to 30!')
        .not().isEmpty().withMessage('Username is required!')
        .custom(async value => {
            return User.getByName(value.toLowerCase()).then(user => {
                if (user) {
                    return Promise.reject('User already in use')
                }
            })
        }),
    check('email').not().isEmpty().withMessage('Email is required!')
        .isEmail().normalizeEmail().withMessage('Value is not a email')
        .custom(value => {
            return User.getByEmail(value).then(user => {
                if (user) {
                    return Promise.reject('Email already in use')
                }
            })
        }),
    check('passwordConfirm').not().isEmpty().withMessage('Password confirm is required!')
        .custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Password confirmation does not match password!');
            }
            return true;
        }),
    check('password').isLength({min: 5}).withMessage('Password length must be minimum 5!')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase!')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase!')
        .matches(/[/@$.!%*#?&]/).withMessage('Password must contain at least one special: /@$.!%*#?& !')
        .matches(/[0-9]/).withMessage('Password must contain at least one number!')
]

exports.checkRegisterValidation = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422);
        res.send(errors)
        return
    }
    next();
}

exports.login = (req, res) => {
    User.getByName(req.body.username.toLowerCase()).then((user) => {
        bcrypt.compare(req.body.password, user.attributes.password, (err, result) => {
            if (!result) {
                res.status(404);
                res.json({
                    message: "Invalid username/password!"
                });
            } else {
                let expirationTimeInSec = 10800;
                User.login(req.body.username)
                let token = jwt.sign({
                    id: user.attributes.id,
                    username: user.attributes.username,
                    admin: user.attributes.admin,
                }, key.tokenKey, {expiresIn: expirationTimeInSec}); //1200
                user.attributes.token = token;
                user.attributes.expiresIn = expirationTimeInSec*1000;
                delete user.attributes.password;
                res.status(200)
                res.json({
                    message: "Success!",
                    user
                })
            }
        });
    }).catch(() => {
        res.status(404);
        res.json({
            message: "Invalid username/password!"
        });
    })
}

exports.getByID = (req, res) => {
    User.getByID(req.params.id).then((user) => {
        if(user == null){
            res.status(404)
            res.json({message:"User id="+req.params.id+" not found"})
            return
        }
        res.status(200)
        delete user.attributes.password;
        res.json(user)
    }).catch((error) => {
        res.status(503);
        res.send({message: "DB read error"})
        console.log(error.toString())
    })
}

exports.changePassword = async (req,res) => {
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

exports.validateChangePassword = [
    check('passwordConfirm').not().isEmpty().withMessage('Password confirm is required!')
        .custom((value, {req}) => {
            if (value !== req.body.newPassword) {
                throw new Error('Password confirmation does not match new password!');
            }
            return true;
        }),
    check('newPassword').isLength({min: 5}).withMessage('New password length must be minimum 5!')
        .matches(/[A-Z]/).withMessage('New password must contain at least one uppercase!')
        .matches(/[a-z]/).withMessage('New password must contain at least one lowercase!')
        .matches(/[/@$.!%*#?&]/).withMessage('New password must contain at least one special: /@$.!%*#?& !')
        .matches(/[0-9]/).withMessage('New password must contain at least one number!'),
]