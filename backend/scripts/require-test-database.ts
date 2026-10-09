import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required; integration tests did not run.');
  process.exit(1);
}

if (
  process.env.DATABASE_ENV !== 'test' ||
  process.env.NODE_ENV !== 'test' ||
  process.env.ALLOW_DATABASE_INTEGRATION_TESTS !== 'true' ||
  process.env.DATABASE_TARGET_CONFIRMATION !== 'I_HAVE_VERIFIED_THIS_IS_NOT_PRODUCTION' ||
  process.env.DEMO_MODE === 'true'
) {
  console.error('Integration writes require DATABASE_ENV=test, NODE_ENV=test, explicit integration opt-in and non-production target confirmation.');
  process.exit(1);
}

console.log('Test database labels accepted; verify DATABASE_URL points to a disposable test database.');
