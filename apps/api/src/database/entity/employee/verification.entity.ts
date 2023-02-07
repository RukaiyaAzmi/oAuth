import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('verification')
export default class Verification {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  employeeId!: string;

  @Column()
  image!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createDate!: Date;
}
