import { MigrationInterface, QueryRunner } from "typeorm";

export class UPDATETABLECOMMENT1728272145762 implements MigrationInterface {
    name = 'UPDATETABLECOMMENT1728272145762'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_5d481d4a7aa0b40664bbc79a42d"`);
        await queryRunner.query(`ALTER TABLE "comment" RENAME COLUMN "parentCommentIdId" TO "parent_comment_id"`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_ac69bddf8202b7c0752d9dc8f32" FOREIGN KEY ("parent_comment_id") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_ac69bddf8202b7c0752d9dc8f32"`);
        await queryRunner.query(`ALTER TABLE "comment" RENAME COLUMN "parent_comment_id" TO "parentCommentIdId"`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_5d481d4a7aa0b40664bbc79a42d" FOREIGN KEY ("parentCommentIdId") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
