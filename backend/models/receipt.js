const bookshelf = require('../config/bookshelf')
const Product = require('../models/product')

const Receipt = bookshelf.Model.extend({
    tableName: 'receipts',
    products() {
        return this.hasMany(Product)
    }
});

module.exports = bookshelf.model('Receipt', Receipt);

module.exports.create = (receipt, t) => {
    return new Receipt({
        NIP: receipt.NIP,
        sum: receipt.sum,
        date: receipt.date,
        user_id: receipt.userId,
        num_of_products: receipt.numOfProducts,
        shop_name: receipt.shopName,
        file: receipt.file
    }).save(null, {transacting: t});
};

module.exports.getByID = (id) => {
    return new Receipt({
        'id': id,
    }).fetch({withRelated: ['products'],require: false});
};

module.exports.deleteByID = (id) => {
    return Receipt.where({'id':id}).destroy()
}

/*
module.exports.findAll = (offset, perPage) => {
    return Receipt.fetchPage({offset:offset, limit:perPage});
}*/
