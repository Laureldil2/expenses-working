# Expenses inspection

#### Required Software
* Node.js
* Vue.js
* PostgreSQL
* npm

#### How To
* Run backend `node server.js`
* Run development build frontend `npm run build`
* Run production build frontend `npm run build` and `npm install -g serve` and `serve -s dist`
* Run local DB `postgres -D datadir` datadir - specifies the file system location of the data directory or configuration file(s)

#### Database Setup
* Create new database expenses
* Connect to database expenses
* In query tool run script db.sql
* Default DB setup
```
user: postgres
password: postgres
database: expenses
host: localhost
port: 5432
```

#### Important notes
* Application need credentials to Google Cloud Platform with Vision API active
* Credentials are in `backend\config\googleKey.json`
* First 1000 requests per month are free
* Credentials template
```
  "type": "service_account",
  "project_id": "",
  "private_key_id": "",
  "private_key": "",
  "client_email": "",
  "client_id": "",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": ""
```


#### Useful links
* [Google Cloud Platform](https://cloud.google.com/)
* [Vue.js manual](https://vuejs.org/v2/guide/)
* [Node.js manual](https://nodejs.org/en/docs/)
* [PostgreSQL manual](https://www.postgresql.org/docs/)
* [npm manual](https://docs.npmjs.com/)
