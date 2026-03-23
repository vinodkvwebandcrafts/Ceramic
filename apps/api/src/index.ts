import app from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const port = env.API_PORT;

app.listen(port, () => {
  logger.info(`Ceramic API running on port ${port}`);
  logger.info(`Health check: http://localhost:${port}/health`);
  logger.info(`API base: http://localhost:${port}/api/v1`);
});
