import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";

// Define role type to avoid repetition and ensure type safety
export type UserRole = "user" | "vendor" | "admin";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true, nullable: false })
  @Index()
  clerkId: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  firstName: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  lastName: string;

  @Column({ unique: true, nullable: false })
  @Index()
  email: string;

  @Column({
    type: "enum",
    enum: ["user", "vendor", "admin"],
    default: "user",
    nullable: false
  })
  role: UserRole;

  @Column({ nullable: true, type: 'varchar', length: 255 })
  avatarUrl?: string;

  @Column({ nullable: true, type: 'varchar', length: 20 })
  phoneNumber?: string;

  @Column({ default: true, nullable: false })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // Virtual property for full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Lifecycle hooks for data sanitization
  @BeforeInsert()
  @BeforeUpdate()
  sanitizeData() {
    if (this.email) {
      this.email = this.email.toLowerCase().trim();
    }
    if (this.firstName) {
      this.firstName = this.firstName.trim();
    }
    if (this.lastName) {
      this.lastName = this.lastName.trim();
    }
    if (this.phoneNumber) {
      this.phoneNumber = this.phoneNumber.trim();
    }
  }

  // Optional: Method to transform the entity to a safe object (removing sensitive data)
  toJSON() {
    const { ...user } = this;
    return user;
  }
}