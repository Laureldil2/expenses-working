const jwt = require('jsonwebtoken');
const key = require('../data/key.js');

exports.checkToken = (req,res,next) => {
    const token = req.headers['token'];
    if(token == null) return res.status(401).send({message: 'Authentication required!'})
    jwt.verify(token, key.tokenKey, (err, user) => {
            if (err) return res.status(401).send({message: 'Authentication failed!'})
            req.user = user
            next();
        })
}
