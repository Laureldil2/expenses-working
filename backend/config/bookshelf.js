const knex = require('knex')(require('./knexfile'));
const bookshelf = require('bookshelf')(knex);
bookshelf.plugin('bookshelf-update');

module.exports = bookshelf;