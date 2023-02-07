import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTable1671097197841 implements MigrationInterface {
  name = 'CreateTable1671097197841';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "false_verification_log" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "employeeId" character varying NOT NULL, "image" character varying NOT NULL, "createDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_58af3701ac8cb2c80d6322d3bb8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "verification" ("id" SERIAL NOT NULL, "employeeId" character varying, "image" character varying NOT NULL, "createDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_f7e3a90ca384e71d6e2e93bb340" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "employee" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "mobileNo" character varying NOT NULL, "employeeId" character varying NOT NULL, "image" character varying NOT NULL, "createDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updateDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_33bdf75dff45044c5bf80fa0ead" UNIQUE ("mobileNo"), CONSTRAINT "UQ_cd21151b14974c7a24e8c24df28" UNIQUE ("employeeId"), CONSTRAINT "PK_3c2bc72f03fd5abbbc5ac169498" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "employee"`);
    await queryRunner.query(`DROP TABLE "verification"`);
    await queryRunner.query(`DROP TABLE "false_verification_log"`);
  }
}
