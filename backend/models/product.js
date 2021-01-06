const bookshelf = require('../config/bookshelf')
const Receipt = require('../models/receipt')

const Product = bookshelf.Model.extend({
    tableName: 'products',
    receipt(){ return this.belongsTo(Receipt)}
});

module.exports = bookshelf.model('Product',Product)

module.exports.create = (product,receiptId, t) => {
    return new Product({
        name: product.name,
        quantity: product.quantity,
        unit_price: product.unitPrice,
        discount: product.discount,
        product_type_id: product.productTypeId,
        normal_price: product.normalPrice
    }).save({'receipt_id':receiptId},{transacting: t});
};

module.exports.deleteByReceiptID = (receiptId) => {
    return Product.where({'receipt_id': receiptId}).destroy();
}

module.exports.getByProductType = (id) => {
    return Product.where({'product_type_id':id}).fetchAll({require:false});
}