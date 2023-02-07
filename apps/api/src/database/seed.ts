/* eslint-disable no-console */
import AppDataSource from '@database/index';
import { EntityManager } from 'typeorm';
import User from './entity/user/user.entity';

export default class Seeder {
  static async run() {
    if (await Seeder.isDBEmpty()) {
      console.log('[INFO] Running db seeds');
      /**
       * Database seeding code
       */

      const manager: EntityManager = AppDataSource.manager;
      const newUser: User = await manager.getRepository(User).create({
        userName: 'admin',
        password: 'Era@1234',
        mobile: '01676050300',
        email: 'mithun@erainfotechbd.com',
      });

      await manager.getRepository(User).save(newUser);

      console.log('[INFO] Successfully completed the seeding');
    }
  }

  static async isDBEmpty() {
    /**
     * Provide the entities that need to checked empty before seeding
     */
    const entityList = [User];
    for (const e of entityList) if ((await AppDataSource.getRepository(e).count()) > 0) return false;
    return true;
  }
}
