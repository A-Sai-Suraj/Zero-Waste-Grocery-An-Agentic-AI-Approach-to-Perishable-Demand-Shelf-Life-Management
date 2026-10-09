import 'dotenv/config';

if (
  process.env.DATABASE_ENV !== 'test' ||
  process.env.NODE_ENV !== 'test' ||
  process.env.ALLOW_DATABASE_INTEGRATION_TESTS !== 'true' ||
  process.env.DATABASE_TARGET_CONFIRMATION !== 'I_HAVE_VERIFIED_THIS_IS_NOT_PRODUCTION' ||
  process.env.DEMO_MODE === 'true'
) {
  throw new Error('Refusing integration tests without explicit test database labels and opt-in');
}
