import { PrimaryGeneratedColumn, Column, CreateDateColumn, Entity, UpdateDateColumn, BeforeInsert } from 'typeorm';
import bcrypt from 'bcryptjs';

@Entity('user')
export default class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    unique: true,
  })
  userName!: string;

  @Column({
    select: false,
  })
  password!: string;

  @Column()
  mobile!: string;

  @Column()
  email!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createDate!: Date;

  @UpdateDateColumn({
    nullable: true,
    type: 'timestamptz',
  })
  updateDate!: Date;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  // @BeforeUpdate()
  // async hash() {
  //   if (this.password) {
  //     this.password = await bcrypt.hash(this.password, 10);
  //   }
  // }
}
