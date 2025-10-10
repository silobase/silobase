import dotenv from 'dotenv'
dotenv.config()

const defaultMaskedFields = [
  'password',
  'salt',
  /pass/,
  /secret/,
  /hash/,
  /security.*stamp/,
];


const maskEnvFields: RegExp[] = (process.env.MASK_FIELDS || '')
  .split(',')
  .map(f => f.trim().toLowerCase())
  .filter(Boolean)
  .map(f => new RegExp(f)); 

export default {
  dbClient: process.env.DB_CLIENT || 'pg',
  dbHost: process.env.DB_HOST || 'localhost',
  dbUser: process.env.DB_USER || 'postgres',
  dbPassword: process.env.DB_PASSWORD || 'password',
  dbPort: Number(process.env.DB_PORT) || 5432,
  dbName: process.env.DB_NAME || 'mydatabase',

  
  port: Number(process.env.PORT) || 3000,
  apiKeys: {
    read: process.env.API_KEY_READ || '',
    write: process.env.API_KEY_WRITE || '',
    full: process.env.API_KEY_FULL || '',
  },
  maskFields: [...defaultMaskedFields, ...maskEnvFields]
}