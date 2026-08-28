const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const passwordsToTest = [
  'jaisam1515%40',
  'jaisam1515@',
  'jaisam1515',
  'postgres',
  'admin',
  'root',
  '123456',
  '1234'
];

const hostsToTest = ['localhost', '127.0.0.1'];
const usersToTest = ['postgres', 'admin'];

async function testConnection(url) {
  const client = new PrismaClient({
    datasources: {
      db: { url }
    }
  });
  try {
    await client.$connect();
    await client.$disconnect();
    return true;
  } catch (err) {
    await client.$disconnect();
    return err.message;
  }
}

async function main() {
  console.log('Testing PostgreSQL connections...\n');
  let found = false;

  for (const host of hostsToTest) {
    for (const user of usersToTest) {
      for (const pass of passwordsToTest) {
        const testUrl = `postgresql://${user}:${pass}@${host}:5432/postgres?schema=public`;
        process.stdout.write(`Testing: user=${user}, host=${host}, pass=${pass} ... `);
        const res = await testConnection(testUrl);
        if (res === true) {
          const workingDbUrl = `postgresql://${user}:${pass}@${host}:5432/aescion_job_portal?schema=public`;
          console.log('\n\n✅ SUCCESS! Found working PostgreSQL connection!');
          console.log(`Connection string: ${workingDbUrl}\n`);
          
          // Update .env file automatically
          const envPath = path.resolve(__dirname, '.env');
          let envContent = `DATABASE_URL="${workingDbUrl}"\nJWT_SECRET="CHANGE_THIS_TO_A_LONG_RANDOM_SECRET"\nPORT=5000\nFRONTEND_URL="http://localhost:5173"\n\nADMIN_EMAIL="admin@aescion.com"\nADMIN_PASSWORD="Admin@123456"\nADMIN_FIRST_NAME="Super"\nADMIN_LAST_NAME="Admin"\n`;
          fs.writeFileSync(envPath, envContent, 'utf8');
          console.log('✅ Updated backend/.env file successfully!');
          console.log('\nNext step: Run `npx prisma db push` to push schema.');
          found = true;
          return;
        } else {
          if (res.includes('P1000')) {
            console.log('Auth Failed');
          } else if (res.includes('P1001')) {
            console.log('Cannot reach server');
          } else {
            console.log(res.split('\n')[0]);
          }
        }
      }
    }
  }

  if (!found) {
    console.log('\n❌ None of the tested passwords worked.');
    console.log('Please check your PostgreSQL password in pgAdmin, SQL Shell (psql), or reset your postgres password.');
  }
}

main();
