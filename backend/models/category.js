const bookshelf = require('../config/bookshelf')
const ProductType = require('../models/productType')

const Category = bookshelf.Model.extend({
    tableName: 'categories',
    productTypes(){
        return this.hasMany('ProductType')
    }
});

module.exports = bookshelf.model('Category',Category)

module.exports.create = (category) => {
    return new Category({
        name: category.name,
        user_id: category.userID,
    }).save();
};

module.exports.getById = (id) => {
    return new Category({
        'id': id,
    }).fetch({withRelated: ['productTypes'],require: false});
};

module.exports.getByName = (name) => {
    return new Category({
        'name': name,
    }).fetch({require: false});
};

module.exports.getByNameAndUserId = (name,user_id) => {
    return new Category({
        'name': name,
        'user_id': user_id
    }).fetch({require: false});
};

module.exports.deleteByID = (id) => {
    return Category.where({'id':id}).destroy()
}

module.exports.findAll = async (filters) => {
    const quantity = await Category.where(filters).count();
    const categories = await Category.where(filters).fetchAll();
    return {categories: categories, quantity}
}

/*
module.exports.deleteByID = (id) => {
    return Category.forge({ id: id }).fetch({ withRelated: ['productTypes'] }).then(function (category) {
        category.productTypes().detach();
        return category.destroy();
    })
}*/
