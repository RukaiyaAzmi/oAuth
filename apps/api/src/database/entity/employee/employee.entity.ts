import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('employee')
export default class Employee {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  mobileNo!: string;

  @Column({ unique: true })
  employeeId!: string;

  @Column()
  image!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createDate!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updateDate!: Date;
}
