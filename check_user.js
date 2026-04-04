const mongoose = require('mongoose');
const User = require('./server/models/User');
require('dotenv').config({path: './server/.env'});

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(async () => {
  const user = await User.findOne({ email: 'test@test.com' });
  console.log('User found:', user);
  process.exit(0);
})
.catch(err => {
  console.error(err);
  process.exit(1);
});
