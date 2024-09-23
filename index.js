const app = require('./app');
const config = require('./utils/config');
const logger = require('./utils/logger').default;

const PORT = config.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
