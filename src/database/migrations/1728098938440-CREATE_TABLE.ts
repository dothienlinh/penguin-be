import { MigrationInterface, QueryRunner } from "typeorm";

export class CREATETABLE1728098938440 implements MigrationInterface {
    name = 'CREATETABLE1728098938440'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "image" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "url" character varying(255) NOT NULL, "post_id" integer, CONSTRAINT "PK_d6db1ab4ee9ad9dbe86c64e4cc3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "share" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "postId" integer, "user_id" integer, CONSTRAINT "PK_67a2b28d2cff31834bc2aa1ed7c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "post" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "content" text NOT NULL, "is_published" boolean NOT NULL DEFAULT false, "user_id" integer, CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."like_target_type_enum" AS ENUM('post', 'comment')`);
        await queryRunner.query(`CREATE TABLE "like" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "post_id" integer, "comment_id" integer, "target_type" "public"."like_target_type_enum" NOT NULL, "user_id" integer, CONSTRAINT "PK_eff3e46d24d416b52a7e0ae4159" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "comment" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "content" text NOT NULL, "user_id" integer, "post_id" integer, CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_gender_enum" AS ENUM('male', 'female', 'other')`);
        await queryRunner.query(`CREATE TYPE "public"."user_provider_enum" AS ENUM('email', 'facebook', 'google')`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('user', 'admin')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "email" character varying, "password" text, "last_name" character varying NOT NULL, "first_name" character varying NOT NULL, "avatar" text, "gender" "public"."user_gender_enum", "birth_date" date, "is_active" boolean NOT NULL DEFAULT false, "is_verified" boolean NOT NULL DEFAULT false, "is_published" boolean NOT NULL DEFAULT false, "provider" "public"."user_provider_enum" NOT NULL DEFAULT 'email', "facebook_id" character varying, "google_id" character varying, "refresh_token" text, "role" "public"."user_role_enum" NOT NULL DEFAULT 'user', CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_189473aaba06ffd667bb024e71a" UNIQUE ("facebook_id"), CONSTRAINT "UQ_7adac5c0b28492eb292d4a93871" UNIQUE ("google_id"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "followers" ("userId_1" integer NOT NULL, "userId_2" integer NOT NULL, CONSTRAINT "PK_cc1ee85045814d468b4d11ac9f9" PRIMARY KEY ("userId_1", "userId_2"))`);
        await queryRunner.query(`CREATE INDEX "IDX_36a4cf82ae396e4da6a9bcb28d" ON "followers" ("userId_1") `);
        await queryRunner.query(`CREATE INDEX "IDX_784d4f15d2d4c278a7769c43eb" ON "followers" ("userId_2") `);
        await queryRunner.query(`ALTER TABLE "image" ADD CONSTRAINT "FK_595c60d3e7e8edf1cc0912782bd" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "share" ADD CONSTRAINT "FK_f0c7421fd77dd8e93b71c35699d" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "share" ADD CONSTRAINT "FK_cb0f2a718c34d96af2fc0e31779" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_52378a74ae3724bcab44036645b" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "like" ADD CONSTRAINT "FK_4356ac2f9519c7404a2869f1691" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "like" ADD CONSTRAINT "FK_d41caa70371e578e2a4791a88ae" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "like" ADD CONSTRAINT "FK_307553e232b4620fde327c59eb5" FOREIGN KEY ("comment_id") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_bbfe153fa60aa06483ed35ff4a7" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_8aa21186314ce53c5b61a0e8c93" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "followers" ADD CONSTRAINT "FK_36a4cf82ae396e4da6a9bcb28db" FOREIGN KEY ("userId_1") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "followers" ADD CONSTRAINT "FK_784d4f15d2d4c278a7769c43eb9" FOREIGN KEY ("userId_2") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "followers" DROP CONSTRAINT "FK_784d4f15d2d4c278a7769c43eb9"`);
        await queryRunner.query(`ALTER TABLE "followers" DROP CONSTRAINT "FK_36a4cf82ae396e4da6a9bcb28db"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_8aa21186314ce53c5b61a0e8c93"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_bbfe153fa60aa06483ed35ff4a7"`);
        await queryRunner.query(`ALTER TABLE "like" DROP CONSTRAINT "FK_307553e232b4620fde327c59eb5"`);
        await queryRunner.query(`ALTER TABLE "like" DROP CONSTRAINT "FK_d41caa70371e578e2a4791a88ae"`);
        await queryRunner.query(`ALTER TABLE "like" DROP CONSTRAINT "FK_4356ac2f9519c7404a2869f1691"`);
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_52378a74ae3724bcab44036645b"`);
        await queryRunner.query(`ALTER TABLE "share" DROP CONSTRAINT "FK_cb0f2a718c34d96af2fc0e31779"`);
        await queryRunner.query(`ALTER TABLE "share" DROP CONSTRAINT "FK_f0c7421fd77dd8e93b71c35699d"`);
        await queryRunner.query(`ALTER TABLE "image" DROP CONSTRAINT "FK_595c60d3e7e8edf1cc0912782bd"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_784d4f15d2d4c278a7769c43eb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_36a4cf82ae396e4da6a9bcb28d"`);
        await queryRunner.query(`DROP TABLE "followers"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_provider_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_gender_enum"`);
        await queryRunner.query(`DROP TABLE "comment"`);
        await queryRunner.query(`DROP TABLE "like"`);
        await queryRunner.query(`DROP TYPE "public"."like_target_type_enum"`);
        await queryRunner.query(`DROP TABLE "post"`);
        await queryRunner.query(`DROP TABLE "share"`);
        await queryRunner.query(`DROP TABLE "image"`);
    }

}
