const bcrypt = require('bcryptjs');
const hash = '$2b$12$6pjrWYv6iquTYJqWP5BOa.GmO40194n7ui7IAYHJwKqmUaKH84b0K';

bcrypt.compare('admin123', hash, (err, res) => {
  console.log('BCRYPT TEST (should be true):', res);
}); 