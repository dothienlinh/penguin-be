import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserTable1731610212623 implements MigrationInterface {
    name = 'UpdateUserTable1731610212623'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_categories" DROP CONSTRAINT "FK_becbe37977577e3eeb089b69fe1"`);
        await queryRunner.query(`ALTER TABLE "post_categories" DROP CONSTRAINT "FK_f6e2655c798334198182db6399b"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "is_published"`);
        await queryRunner.query(`ALTER TABLE "post_categories" ADD CONSTRAINT "FK_f6e2655c798334198182db6399b" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "post_categories" ADD CONSTRAINT "FK_becbe37977577e3eeb089b69fe1" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_categories" DROP CONSTRAINT "FK_becbe37977577e3eeb089b69fe1"`);
        await queryRunner.query(`ALTER TABLE "post_categories" DROP CONSTRAINT "FK_f6e2655c798334198182db6399b"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "is_published" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "post_categories" ADD CONSTRAINT "FK_f6e2655c798334198182db6399b" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "post_categories" ADD CONSTRAINT "FK_becbe37977577e3eeb089b69fe1" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
