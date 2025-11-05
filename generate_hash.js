const bcrypt = require('bcryptjs');
const plain = process.argv[2] || 'admin123';
bcrypt.hash(plain, 10).then(hash => console.log(hash)).catch(err => console.error(err));
