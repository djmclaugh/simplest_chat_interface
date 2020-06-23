import {
  AfterLoad,
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';

import ContactModel from './contact_model';

@Entity()
export default class MessageModel extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(type => ContactModel, {
    cascade: ['insert'],
    eager: true,
    onDelete: 'RESTRICT',
    nullable: false,
  })
  @JoinColumn()
  contact!: ContactModel;

  @Column('text')
  message!: string;

  @CreateDateColumn()
  timestamp!: string;

  @Column('boolean')
  isSender!: boolean;
}
