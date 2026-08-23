const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter the Access Key you want to hash: ', (key) => {
  if (!key) {
    console.error('Access Key cannot be empty.');
    rl.close();
    process.exit(1);
  }

  const salt = bcrypt.genSaltSync(12);
  const hash = bcrypt.hashSync(key, salt);

  console.log('\n==================================================');
  console.log('Access Key Hash successfully generated:');
  console.log('==================================================\n');
  console.log(hash);
  console.log('\n==================================================');
  console.log('Copy the hash above and paste it into your .env file:');
  console.log(`ADMIN_ACCESS_KEY_HASH="${hash}"`);
  console.log('==================================================\n');
  
  rl.close();
});
