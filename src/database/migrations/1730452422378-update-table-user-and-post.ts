import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTableUserAndPost1730452422378 implements MigrationInterface {
    name = 'UpdateTableUserAndPost1730452422378'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_categories" DROP CONSTRAINT "FK_becbe37977577e3eeb089b69fe1"`);
        await queryRunner.query(`ALTER TABLE "post_categories" DROP CONSTRAINT "FK_f6e2655c798334198182db6399b"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "is_removed_by_admin" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user" ADD "removed_reason" text`);
        await queryRunner.query(`ALTER TABLE "user" ADD "removed_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "post" ADD "is_removed_by_admin" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "post" ADD "removed_reason" text`);
        await queryRunner.query(`ALTER TABLE "post" ADD "removed_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "post_categories" ADD CONSTRAINT "FK_f6e2655c798334198182db6399b" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "post_categories" ADD CONSTRAINT "FK_becbe37977577e3eeb089b69fe1" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_categories" DROP CONSTRAINT "FK_becbe37977577e3eeb089b69fe1"`);
        await queryRunner.query(`ALTER TABLE "post_categories" DROP CONSTRAINT "FK_f6e2655c798334198182db6399b"`);
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "removed_at"`);
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "removed_reason"`);
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "is_removed_by_admin"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "removed_at"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "removed_reason"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "is_removed_by_admin"`);
        await queryRunner.query(`ALTER TABLE "post_categories" ADD CONSTRAINT "FK_f6e2655c798334198182db6399b" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "post_categories" ADD CONSTRAINT "FK_becbe37977577e3eeb089b69fe1" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
