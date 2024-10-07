import { MigrationInterface, QueryRunner } from "typeorm";

export class CREATETABLEREPLYCOMMENT1728271532001 implements MigrationInterface {
    name = 'CREATETABLEREPLYCOMMENT1728271532001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" ADD "parentCommentIdId" integer`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_5d481d4a7aa0b40664bbc79a42d" FOREIGN KEY ("parentCommentIdId") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_5d481d4a7aa0b40664bbc79a42d"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP COLUMN "parentCommentIdId"`);
    }

}
