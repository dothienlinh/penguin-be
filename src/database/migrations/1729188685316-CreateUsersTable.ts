import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1729188685316 implements MigrationInterface {
    name = 'CreateUsersTable1729188685316'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "share" DROP CONSTRAINT "FK_f0c7421fd77dd8e93b71c35699d"`);
        await queryRunner.query(`ALTER TABLE "share" RENAME COLUMN "postId" TO "post_id"`);
        await queryRunner.query(`ALTER TABLE "share" ADD CONSTRAINT "FK_c809c0947bf385079767aaec25f" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "share" DROP CONSTRAINT "FK_c809c0947bf385079767aaec25f"`);
        await queryRunner.query(`ALTER TABLE "share" RENAME COLUMN "post_id" TO "postId"`);
        await queryRunner.query(`ALTER TABLE "share" ADD CONSTRAINT "FK_f0c7421fd77dd8e93b71c35699d" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
