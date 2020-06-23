import { BaseEntity, Column, Entity, In, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['fqdn'])
export default class ContactModel extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text')
  fqdn!: string;

  @Column('datetime')
  lastRead: Date = new Date();

  static async getOrCreate(fqdn: string): Promise<ContactModel> {
    const foundContact = await ContactModel.findOne({fqdn: fqdn});
    if (foundContact) {
      return foundContact;
    } else {
      const newContact = new ContactModel();
      newContact.fqdn = fqdn;
      return newContact;
    }
  }
}
