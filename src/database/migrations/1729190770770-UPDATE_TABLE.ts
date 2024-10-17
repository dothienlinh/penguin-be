import { MigrationInterface, QueryRunner } from "typeorm";

export class UPDATETABLE1729190770770 implements MigrationInterface {
    name = 'UPDATETABLE1729190770770'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "message" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "content" character varying NOT NULL, "isRead" boolean NOT NULL DEFAULT false, "isDelivered" boolean NOT NULL DEFAULT true, "readAt" TIMESTAMP, "sender_id" integer, "receiver_id" integer, "chat_room_id" integer, CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "chat_room" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "avatar" character varying, "isGroup" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_8aa3a52cf74c96469f0ef9fbe3e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "chat_room_members" ("chat_room_id" integer NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "PK_56628fb4cec79f2a02f34caf339" PRIMARY KEY ("chat_room_id", "user_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cab77d6448846706ad9b0ba41c" ON "chat_room_members" ("chat_room_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_f7d4d1d255b71027906de8357f" ON "chat_room_members" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_c0ab99d9dfc61172871277b52f6" FOREIGN KEY ("sender_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_f4da40532b0102d51beb220f16a" FOREIGN KEY ("receiver_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_4404b7d229b7093872f40a87e7b" FOREIGN KEY ("chat_room_id") REFERENCES "chat_room"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_room_members" ADD CONSTRAINT "FK_cab77d6448846706ad9b0ba41c9" FOREIGN KEY ("chat_room_id") REFERENCES "chat_room"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "chat_room_members" ADD CONSTRAINT "FK_f7d4d1d255b71027906de8357f5" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat_room_members" DROP CONSTRAINT "FK_f7d4d1d255b71027906de8357f5"`);
        await queryRunner.query(`ALTER TABLE "chat_room_members" DROP CONSTRAINT "FK_cab77d6448846706ad9b0ba41c9"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_4404b7d229b7093872f40a87e7b"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_f4da40532b0102d51beb220f16a"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_c0ab99d9dfc61172871277b52f6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f7d4d1d255b71027906de8357f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cab77d6448846706ad9b0ba41c"`);
        await queryRunner.query(`DROP TABLE "chat_room_members"`);
        await queryRunner.query(`DROP TABLE "chat_room"`);
        await queryRunner.query(`DROP TABLE "message"`);
    }

}
