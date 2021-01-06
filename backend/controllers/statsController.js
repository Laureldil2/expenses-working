const bookshelf = require('../config/bookshelf')


exports.get = async (req, res) => {
    let dateRangeRaw = ''
    if(Date.parse(req.query.date_from) && Date.parse(req.query.date_to)){
        dateRangeRaw = ' AND r.date >= \'' + req.query.date_from + '\' AND r.date <= \'' + req.query.date_to + '\' ';
    } else if(Date.parse(req.query.date_from)) {
        dateRangeRaw = ' AND r.date >= \'' + req.query.date_from + '\' ';
    } else if(Date.parse(req.query.date_to)) {
        dateRangeRaw = ' AND r.date <= \'' + req.query.date_to + '\' ';
    }

    let category = await bookshelf.knex.raw(
        'select c.name as category, sum(quantity) as quantity, sum(normal_price+discount) as total_price\n' +
        'from products p, product_types pt, categories c, receipts r\n' +
        `where r.user_id =`+req.user.id+` and c.id = pt.category_id and r.id = p.receipt_id  and p.product_type_id = pt.id`+dateRangeRaw+`\n`+
        'group by c.name'
    );
    let product = await bookshelf.knex.raw(
        'select pt.name, sum(p.quantity) as quantity, sum(p.normal_price + p.discount) as sum \n' +
        'from products p, product_types pt, receipts r \n' +
        'where r.user_id ='+req.user.id+' and p.product_type_id = pt.id'+dateRangeRaw+'\n' +
        'group by pt.name');
    let expensesYears = await bookshelf.knex.raw(
        'select sum(p.normal_price + p.discount) as sum, extract(year from r.date) as year, extract(month from r.date) as month \n' +
        'from products p, product_types pt, receipts r \n' +
        'where r.user_id ='+req.user.id+' and r.id = p.receipt_id and p.product_type_id = pt.id and r.id = p.receipt_id \n' +
        'group by year, month \n' +
        'order by year desc, month desc')
    res.status(200);
    res.send({
        message: 'Success!',
        categorySet: category.rows,
        productSet: product.rows,
        expensesYearsSet: expensesYears.rows
    })
}