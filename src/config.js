if (process.env.NODE_ENV === 'production') {
  console.log("production!!")
  module.exports = {
    secret: 'TEST_SECRET',
    salt: 'TEST_SALT',
    db_uri: 'mongodb://USERNAME:PASSWORD@ds121945.mlab.com:21945/riceyak-dev',
    CASValidateURL: 'https://idp.rice.edu/idp/profile/cas/serviceValidate',
    thisServiceURL: 'https://beakspeak-backend-232019.appspot.com/api/auth/app',
    frontendURL: 'https://speak.riceapps.org',
    posts_collection: 'prod_posts',
    num_post_limit: 500
  };
} else {
  console.log("development!!")
  ip = "YOUR IP ADDRES"
  module.exports = {
    secret: 'TEST_SECRET',
    salt: 'TEST_SALT',
    db_uri: 'mongodb://USERNAME:PASSWORD@ds121945.mlab.com:21945/riceyak-dev',
    CASValidateURL: 'https://idp.rice.edu/idp/profile/cas/serviceValidate',
    thisServiceURL: 'http://'+ip+':3000/api/auth/app',
    frontendURL: 'http://localhost:4200',
    posts_collection: 'dev_posts',
    num_post_limit: 500
  };
}
