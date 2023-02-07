import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('false_verification_log')
export default class FalseVerification {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  employeeId!: string;

  @Column()
  image!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createDate!: Date;
}
