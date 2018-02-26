if (process.env.NODE_ENV === 'prod') {
  module.exports = {
    secret: 'TEST_SECRET',
    db_uri: 'mongodb://riceucsclub:r1ce4pps$wag1@ds121945.mlab.com:21945/riceyak-dev',
    CASValidateURL: 'https://idp.rice.edu/idp/profile/cas/serviceValidate',
    thisServiceURL: 'http://speak.riceapps.org/auth',
    frontendURL: 'http://speak.riceapps.org'
  };
} else {
  module.exports = {
    secret: 'TEST_SECRET',
    db_uri: 'mongodb://riceucsclub:r1ce4pps$wag1@ds121945.mlab.com:21945/riceyak-dev',
    CASValidateURL: 'https://idp.rice.edu/idp/profile/cas/serviceValidate',
    thisServiceURL: 'http://localhost:4200/auth',
    frontendURL: 'http://localhost:4200'
  };
}
