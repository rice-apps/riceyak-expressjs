if (process.env.NODE_ENV === 'prod') {
  console.log("production!!")
  module.exports = {
    secret: 'TEST_SECRET',
    salt: 'TEST_SALT',
    db_uri: 'mongodb://riceucsclub:r1ce4pps$wag1@ds121945.mlab.com:21945/riceyak-dev',
    CASValidateURL: 'https://idp.rice.edu/idp/profile/cas/serviceValidate',
    thisServiceURL: 'https://speak.riceapps.org/auth',
    frontendURL: 'https://speak.riceapps.org'
  };
} else {
  module.exports = {
    secret: 'TEST_SECRET',
    salt: 'TEST_SALT',
    db_uri: 'mongodb://riceucsclub:r1ce4pps$wag1@ds121945.mlab.com:21945/riceyak-dev',
    CASValidateURL: 'https://idp.rice.edu/idp/profile/cas/serviceValidate',
    thisServiceURL: 'http://localhost:4200/auth',
    frontendURL: 'http://localhost:4200'
  };
}
