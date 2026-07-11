import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  maxFileSize: 50 * 1024 * 1024, // 50MB
  batchSize: 25,
  maxRetries: 3,
};
