const bookshelf = require('../config/bookshelf')

const User = bookshelf.Model.extend({
    tableName: 'users'
});

module.exports = bookshelf.model('User', User);

module.exports.create = (user) => {
    return new User({
        username:user.username,
        email:user.email,
        password:user.password,
        created_on: new Date(Date.now())
    }).save();
};

module.exports.login = (username) => {
    User.where({
      'username': username,
    }).fetch().then(usr => usr.set('last_login', new Date(Date.now()))).then(usr => usr.update());
};

module.exports.getByName = (username) => {
    return new User({
        'username': username,
    }).fetch({require: false});
};

module.exports.getByID = (id) => {
    return new User({
        'id': id,
    }).fetch({require: false});
};

module.exports.getByEmail = (email) => {
    return new User({
        'email': email,
    }).fetch({require: false});
};