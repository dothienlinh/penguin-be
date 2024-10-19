import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTable1729317210500 implements MigrationInterface {
    name = 'CreateTable1729317210500'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "message" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "content" character varying NOT NULL, "isRead" boolean NOT NULL DEFAULT false, "isDelivered" boolean NOT NULL DEFAULT true, "readAt" TIMESTAMP, "sender_id" integer, "receiver_id" integer, "chat_room_id" integer, CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "chat_room" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "avatar" character varying, "isGroup" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_8aa3a52cf74c96469f0ef9fbe3e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "image" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "url" character varying(255) NOT NULL, "post_id" integer, CONSTRAINT "PK_d6db1ab4ee9ad9dbe86c64e4cc3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "share" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "post_id" integer, "user_id" integer, CONSTRAINT "PK_67a2b28d2cff31834bc2aa1ed7c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "post" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "content" text NOT NULL, "is_published" boolean NOT NULL DEFAULT false, "user_id" integer, CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."like_target_type_enum" AS ENUM('post', 'comment')`);
        await queryRunner.query(`CREATE TABLE "like" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "post_id" integer, "comment_id" integer, "target_type" "public"."like_target_type_enum" NOT NULL, "user_id" integer, CONSTRAINT "PK_eff3e46d24d416b52a7e0ae4159" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "comment" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "content" text NOT NULL, "parent_comment_id" integer, "user_id" integer, "post_id" integer, CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."permission_name_enum" AS ENUM('read_user', 'write_user', 'delete_user', 'read_post', 'write_post', 'delete_post', 'read_comment', 'write_comment', 'delete_comment', 'read_role', 'write_role', 'delete_role', 'read_share', 'write_share', 'delete_share', 'read_chat', 'write_chat', 'delete_chat', 'read_image', 'write_image', 'delete_image', 'read_permission', 'write_permission', 'delete_permission')`);
        await queryRunner.query(`CREATE TABLE "permission" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" "public"."permission_name_enum" NOT NULL, CONSTRAINT "UQ_240853a0c3353c25fb12434ad33" UNIQUE ("name"), CONSTRAINT "PK_3b8b97af9d9d8807e41e6f48362" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."role_name_enum" AS ENUM('super_admin', 'admin', 'user')`);
        await queryRunner.query(`CREATE TABLE "role" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" "public"."role_name_enum" NOT NULL, CONSTRAINT "UQ_ae4578dcaed5adff96595e61660" UNIQUE ("name"), CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_gender_enum" AS ENUM('male', 'female', 'other')`);
        await queryRunner.query(`CREATE TYPE "public"."user_provider_enum" AS ENUM('email', 'facebook', 'google')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "email" character varying, "password" text, "last_name" character varying NOT NULL, "first_name" character varying NOT NULL, "avatar" text, "gender" "public"."user_gender_enum", "birth_date" date, "is_active" boolean NOT NULL DEFAULT false, "is_verified" boolean NOT NULL DEFAULT false, "is_published" boolean NOT NULL DEFAULT false, "provider" "public"."user_provider_enum" NOT NULL DEFAULT 'email', "facebook_id" character varying, "google_id" character varying, "refresh_token" text, "roleId" integer, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_189473aaba06ffd667bb024e71a" UNIQUE ("facebook_id"), CONSTRAINT "UQ_7adac5c0b28492eb292d4a93871" UNIQUE ("google_id"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "members_chat_rooms" ("chat_room_id" integer NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "PK_fa5ea4feb6e324af1f69ba87127" PRIMARY KEY ("chat_room_id", "user_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d1eea909b9ee72b9972c49375f" ON "members_chat_rooms" ("chat_room_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_95a85053e8f89e6ae64e273143" ON "members_chat_rooms" ("user_id") `);
        await queryRunner.query(`CREATE TABLE "user_permissions" ("user_id" integer NOT NULL, "permission_id" integer NOT NULL, CONSTRAINT "PK_a537c48b1f80e8626a71cb56589" PRIMARY KEY ("user_id", "permission_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3495bd31f1862d02931e8e8d2e" ON "user_permissions" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_8145f5fadacd311693c15e41f1" ON "user_permissions" ("permission_id") `);
        await queryRunner.query(`CREATE TABLE "user_follows" ("follower_id" integer NOT NULL, "following_id" integer NOT NULL, CONSTRAINT "PK_abc657d7ff1282910784b819171" PRIMARY KEY ("follower_id", "following_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f7af3bf8f2dcba61b4adc10823" ON "user_follows" ("follower_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_5a71643cec3110af425f92e76e" ON "user_follows" ("following_id") `);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_c0ab99d9dfc61172871277b52f6" FOREIGN KEY ("sender_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_f4da40532b0102d51beb220f16a" FOREIGN KEY ("receiver_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_4404b7d229b7093872f40a87e7b" FOREIGN KEY ("chat_room_id") REFERENCES "chat_room"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "image" ADD CONSTRAINT "FK_595c60d3e7e8edf1cc0912782bd" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "share" ADD CONSTRAINT "FK_c809c0947bf385079767aaec25f" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "share" ADD CONSTRAINT "FK_cb0f2a718c34d96af2fc0e31779" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_52378a74ae3724bcab44036645b" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "like" ADD CONSTRAINT "FK_4356ac2f9519c7404a2869f1691" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "like" ADD CONSTRAINT "FK_d41caa70371e578e2a4791a88ae" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "like" ADD CONSTRAINT "FK_307553e232b4620fde327c59eb5" FOREIGN KEY ("comment_id") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_ac69bddf8202b7c0752d9dc8f32" FOREIGN KEY ("parent_comment_id") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_bbfe153fa60aa06483ed35ff4a7" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_8aa21186314ce53c5b61a0e8c93" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_c28e52f758e7bbc53828db92194" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "members_chat_rooms" ADD CONSTRAINT "FK_d1eea909b9ee72b9972c49375fc" FOREIGN KEY ("chat_room_id") REFERENCES "chat_room"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "members_chat_rooms" ADD CONSTRAINT "FK_95a85053e8f89e6ae64e2731436" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_permissions" ADD CONSTRAINT "FK_3495bd31f1862d02931e8e8d2e8" FOREIGN KEY ("user_id") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_permissions" ADD CONSTRAINT "FK_8145f5fadacd311693c15e41f10" FOREIGN KEY ("permission_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_follows" ADD CONSTRAINT "FK_f7af3bf8f2dcba61b4adc108239" FOREIGN KEY ("follower_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_follows" ADD CONSTRAINT "FK_5a71643cec3110af425f92e76e5" FOREIGN KEY ("following_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_follows" DROP CONSTRAINT "FK_5a71643cec3110af425f92e76e5"`);
        await queryRunner.query(`ALTER TABLE "user_follows" DROP CONSTRAINT "FK_f7af3bf8f2dcba61b4adc108239"`);
        await queryRunner.query(`ALTER TABLE "user_permissions" DROP CONSTRAINT "FK_8145f5fadacd311693c15e41f10"`);
        await queryRunner.query(`ALTER TABLE "user_permissions" DROP CONSTRAINT "FK_3495bd31f1862d02931e8e8d2e8"`);
        await queryRunner.query(`ALTER TABLE "members_chat_rooms" DROP CONSTRAINT "FK_95a85053e8f89e6ae64e2731436"`);
        await queryRunner.query(`ALTER TABLE "members_chat_rooms" DROP CONSTRAINT "FK_d1eea909b9ee72b9972c49375fc"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_c28e52f758e7bbc53828db92194"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_8aa21186314ce53c5b61a0e8c93"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_bbfe153fa60aa06483ed35ff4a7"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_ac69bddf8202b7c0752d9dc8f32"`);
        await queryRunner.query(`ALTER TABLE "like" DROP CONSTRAINT "FK_307553e232b4620fde327c59eb5"`);
        await queryRunner.query(`ALTER TABLE "like" DROP CONSTRAINT "FK_d41caa70371e578e2a4791a88ae"`);
        await queryRunner.query(`ALTER TABLE "like" DROP CONSTRAINT "FK_4356ac2f9519c7404a2869f1691"`);
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_52378a74ae3724bcab44036645b"`);
        await queryRunner.query(`ALTER TABLE "share" DROP CONSTRAINT "FK_cb0f2a718c34d96af2fc0e31779"`);
        await queryRunner.query(`ALTER TABLE "share" DROP CONSTRAINT "FK_c809c0947bf385079767aaec25f"`);
        await queryRunner.query(`ALTER TABLE "image" DROP CONSTRAINT "FK_595c60d3e7e8edf1cc0912782bd"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_4404b7d229b7093872f40a87e7b"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_f4da40532b0102d51beb220f16a"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_c0ab99d9dfc61172871277b52f6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5a71643cec3110af425f92e76e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f7af3bf8f2dcba61b4adc10823"`);
        await queryRunner.query(`DROP TABLE "user_follows"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8145f5fadacd311693c15e41f1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3495bd31f1862d02931e8e8d2e"`);
        await queryRunner.query(`DROP TABLE "user_permissions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_95a85053e8f89e6ae64e273143"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d1eea909b9ee72b9972c49375f"`);
        await queryRunner.query(`DROP TABLE "members_chat_rooms"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_provider_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_gender_enum"`);
        await queryRunner.query(`DROP TABLE "role"`);
        await queryRunner.query(`DROP TYPE "public"."role_name_enum"`);
        await queryRunner.query(`DROP TABLE "permission"`);
        await queryRunner.query(`DROP TYPE "public"."permission_name_enum"`);
        await queryRunner.query(`DROP TABLE "comment"`);
        await queryRunner.query(`DROP TABLE "like"`);
        await queryRunner.query(`DROP TYPE "public"."like_target_type_enum"`);
        await queryRunner.query(`DROP TABLE "post"`);
        await queryRunner.query(`DROP TABLE "share"`);
        await queryRunner.query(`DROP TABLE "image"`);
        await queryRunner.query(`DROP TABLE "chat_room"`);
        await queryRunner.query(`DROP TABLE "message"`);
    }

}
