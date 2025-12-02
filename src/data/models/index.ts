import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import { UserRole } from "../../types";

@Entity()
@Index(["email"])
export class User {
	@PrimaryGeneratedColumn()
	id!: number;
	@Column({ unique: true, nullable: false })
	email!: string;
	@Column({ nullable: false })
	name!: string;
	@Column({ nullable: false })
	password!: string;
	@Column({ type: "enum", enum: UserRole, default: UserRole.USER })
	role!: string;
	@Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
	createdAt!: Date;
	@Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
	updatedAt!: Date;
}
