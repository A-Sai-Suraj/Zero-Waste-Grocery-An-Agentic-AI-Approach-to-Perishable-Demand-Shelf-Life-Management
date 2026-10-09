import 'dotenv/config';

const databaseUrl = process.env.DATABASE_URL;
const databaseEnvironment = process.env.DATABASE_ENV;
const nodeEnvironment = process.env.NODE_ENV;
const confirmation = process.env.DATABASE_TARGET_CONFIRMATION;

if (!databaseUrl) {
  console.error('DATABASE_URL is required; no database command was run.');
  process.exit(1);
}

if (!['development', 'test'].includes(databaseEnvironment ?? '') || !['development', 'test'].includes(nodeEnvironment ?? '')) {
  console.error('Database commands require DATABASE_ENV and NODE_ENV to be development or test.');
  process.exit(1);
}

if (confirmation !== 'I_HAVE_VERIFIED_THIS_IS_NOT_PRODUCTION') {
  console.error('Set DATABASE_TARGET_CONFIRMATION only after verifying the configured database is not production.');
  process.exit(1);
}

console.log(`Database safety labels accepted (${databaseEnvironment}); target confirmation supplied by operator.`);
