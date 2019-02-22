if (process.env.NODE_ENV === 'production') {
  console.log("production!!")
  module.exports = {
    secret: 'TEST_SECRET',
    salt: 'TEST_SALT',
    db_uri: 'mongodb://riceucsclub:r1ce4pps$wag1@ds121945.mlab.com:21945/riceyak-dev',
    CASValidateURL: 'https://idp.rice.edu/idp/profile/cas/serviceValidate',
    thisServiceURL: 'https://speak.riceapps.org/auth',
    frontendURL: 'https://speak.riceapps.org',
    appFrontEndURL: 'beakspeak://'
  };
} else {
  console.log("development!!")
  ip = "10.208.178.196"
  module.exports = {
    secret: 'TEST_SECRET',
    salt: 'TEST_SALT',
    db_uri: 'mongodb://riceucsclub:r1ce4pps$wag1@ds121945.mlab.com:21945/riceyak-dev',
    CASValidateURL: 'https://idp.rice.edu/idp/profile/cas/serviceValidate',
    thisServiceURL: 'http://'+ip+':3000/api/auth/app',
    frontendURL: 'http://localhost:4200',
    appFrontEndURL: 'exp://127.0.0.1:19000'
  };
}
