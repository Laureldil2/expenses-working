const bookshelf = require('../config/bookshelf')
exports.home = async (req, res, next) => {
    await bookshelf.knex.client.raw('select 1+1 as result').catch(err => {
        console.log("Database error: "+ err.message)
        err.status = 500;
        err.message = "Internal server error: database error";
        throw err;
    });
    console.log('Connection has been established successfully.');
    res.status(200).json({
        'message' : 'REST API is available',
    });
};
