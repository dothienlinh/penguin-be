import { DataSource, DataSourceOptions } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/database/migrations/*.js'],
  migrationsRun: true,
  synchronize: false,
  logging: true,
};

if (!process.env.DB_HOST) {
  throw new Error(
    'Environment variables are not loaded. Please check your .env file.',
  );
}

const dataSource = new DataSource(dataSourceOptions);

export async function initializeDataSource() {
  try {
    await dataSource.initialize();
    console.log('Connected to the database successfully');
    return dataSource;
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw error;
  }
}

export default dataSource;
