//******
//routes
const indexRoute = require('./routes/indexRoute');
const {notFound, catchErrors, checkAvailability} = require('./middlewares/errors');
const userRoute = require('./routes/userRoute');
const photoReceiptRoute = require('./routes/photoReceiptRoute')
const receiptRoute = require('./routes/receiptRoute')
const categoryRoute = require('./routes/categoryRoute')
const productTypeRoute = require('./routes/productTypeRoute')
const statsRoute = require('./routes/statsRoute')
//******

const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const morgan = require('morgan')
const rfs = require('rotating-file-stream')
const fileUpload = require('express-fileupload')
const cors = require('cors')
require('dotenv').config()

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

/*const accessLogStream = rfs.createStream('access.log', {
    interval: '1h',
    path: './logs'
});*/

app.use(cors())
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTION, DELETE, PUT");
    next();
});
//app.use(morgan('common', { stream: accessLogStream }));
app.use(fileUpload({
    createParentPath: true
}));
console.log(process.env.off);


//******
//routes connections
app.use(checkAvailability);
app.use('/api', indexRoute);
app.use('/api/users',userRoute);
app.use('/api/photo-receipt',photoReceiptRoute);
app.use('/api/receipts',receiptRoute);
app.use('/api/categories', categoryRoute)
app.use('/api/product-types', productTypeRoute)
app.use('/api/stats',statsRoute);
app.use(notFound);
app.use(catchErrors);

module.exports = app;