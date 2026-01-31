import { config } from './config/env';
import { connectDB } from './config/db';
import app from './app';

(async () => {
  await connectDB();
  const port = config.PORT;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
})();
