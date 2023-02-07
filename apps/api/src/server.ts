import 'reflect-metadata';
import appConfig from '@config/app.config';
import app from 'app';
import * as http from 'http';
import AppDataSource from './database';
import Seeder from '@database/seed';
// import { createConnection } from 'typeorm';

(async function () {
  // typeorm connection establish
  // await createConnection();
  await AppDataSource.initialize();
  await Seeder.run();
  const server: http.Server = http.createServer(app);

  server.listen(appConfig.port, () => {
    // eslint-disable-next-line no-console
    console.log('[INFO] Environment: ', appConfig.env);
    // eslint-disable-next-line no-console
    console.log(`[INFO] Server running at http://localhost:${appConfig.port}`);
  });
})();
