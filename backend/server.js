const app = require('./app.js');
const config = require('./config/config');

app.set('port', config.port);

const server = app.listen(app.get('port'), () => {
    console.log(`Service started on port ${server.address().port}!`);
});