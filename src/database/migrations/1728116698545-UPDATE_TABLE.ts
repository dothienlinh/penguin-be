import { MigrationInterface, QueryRunner } from "typeorm";

export class UPDATETABLE1728116698545 implements MigrationInterface {
    name = 'UPDATETABLE1728116698545'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "followers" DROP CONSTRAINT "FK_784d4f15d2d4c278a7769c43eb9"`);
        await queryRunner.query(`CREATE TABLE "following" ("userId_1" integer NOT NULL, "userId_2" integer NOT NULL, CONSTRAINT "PK_a5a9b5a1c612b20d94e2c8c8ac2" PRIMARY KEY ("userId_1", "userId_2"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b772585338fe497109e2f2c857" ON "following" ("userId_1") `);
        await queryRunner.query(`CREATE INDEX "IDX_74b5dd36aa2f8ee36e209c2eab" ON "following" ("userId_2") `);
        await queryRunner.query(`ALTER TABLE "followers" ADD CONSTRAINT "FK_784d4f15d2d4c278a7769c43eb9" FOREIGN KEY ("userId_2") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "following" ADD CONSTRAINT "FK_b772585338fe497109e2f2c857b" FOREIGN KEY ("userId_1") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "following" ADD CONSTRAINT "FK_74b5dd36aa2f8ee36e209c2eab2" FOREIGN KEY ("userId_2") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "following" DROP CONSTRAINT "FK_74b5dd36aa2f8ee36e209c2eab2"`);
        await queryRunner.query(`ALTER TABLE "following" DROP CONSTRAINT "FK_b772585338fe497109e2f2c857b"`);
        await queryRunner.query(`ALTER TABLE "followers" DROP CONSTRAINT "FK_784d4f15d2d4c278a7769c43eb9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_74b5dd36aa2f8ee36e209c2eab"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b772585338fe497109e2f2c857"`);
        await queryRunner.query(`DROP TABLE "following"`);
        await queryRunner.query(`ALTER TABLE "followers" ADD CONSTRAINT "FK_784d4f15d2d4c278a7769c43eb9" FOREIGN KEY ("userId_2") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
