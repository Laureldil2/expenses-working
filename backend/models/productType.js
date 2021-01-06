const bookshelf = require('../config/bookshelf')
const Category = require('../models/category')

const ProductType = bookshelf.Model.extend({
    tableName: 'product_types',
    categories(){
        return this.belongsTo('Category', 'category_id')
    }
});

module.exports = bookshelf.model('ProductType',ProductType)

module.exports.create = (productType) => {
    return new ProductType({
        name: productType.name,
        category_id: productType.categoryID,
        user_id: productType.userID,
    }).save();
};

module.exports.getById = (id) => {
    return new ProductType({
        'id': id,
    }).fetch({require: false});
};

module.exports.getByCategoryId = (id) => {
    return new ProductType({
        'category_id': id
    }).fetch({require: false});
};

module.exports.deleteByID = (id) => {
    return ProductType.where({'id':id}).destroy()
}

module.exports.removeCategory = (id, t) => {
    return ProductType.where({'id':id}).save({'category_id':null}, { method:'update', patch:true, transacting: t})
}

module.exports.getByNameAndUserId = (name,user_id) => {
    return new ProductType({
        'name': name,
        'user_id': user_id
    }).fetch({require: false});
};

module.exports.findAll = async (filters) => {
    const quantity = await ProductType.where(filters).count();
    const productTypes = await ProductType.where(filters).fetchAll();
    return {productTypes: productTypes, quantity}
}


/*const quantity = await ProductType.where(filters).count();
const productTypes = await ProductType.where(filters).fetchAll();*/

/*
module.exports.editCategoryId = (id,categoryID) => {
    return ProductType.where({'id':id}).set('category_id',categoryID).save()
}*/
