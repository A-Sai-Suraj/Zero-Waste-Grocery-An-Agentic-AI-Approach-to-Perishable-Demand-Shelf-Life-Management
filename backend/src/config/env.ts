import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 5000),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/zerowaste_ai?schema=public',
  jwtSecret: process.env.JWT_SECRET || 'development-secret',
  mlServiceUrl: process.env.ML_SERVICE_URL || 'http://localhost:8000',
  nodeEnv: process.env.NODE_ENV || 'development',
};
