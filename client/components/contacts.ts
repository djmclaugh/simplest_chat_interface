import Vue, { VNode } from 'vue';
import Component from 'vue-class-component';

import { getAllMessages, onUpdate, MessageCollection, addContact } from '../messages_service';

const ContactsProps = Vue.extend({
  props: {
    selectedContact: String,
  },
});

@Component({
  components: {},
})
export default class ContactsComponent extends ContactsProps {
  // Data
  private messages: Map<string, MessageCollection> = getAllMessages();
  private contacts: string[] = Array.from(this.messages.keys());

  // Computed

  // Methods
  onContactClick(event: MouseEvent): void {
    const element = <HTMLLIElement>event.target!
    this.$emit('contactSelected', element.textContent);
  }

  onAddContactClick(event: MouseEvent): void {
    const element: HTMLInputElement = <HTMLInputElement>this.$refs['addContactInput'];
    if (element.value.length > 0) {
      addContact(element.value);
      element.value = '';
    }
  }

  // Hooks
  mounted(): void {
    onUpdate((allMessages) => {
      this.messages = allMessages;
      this.contacts = Array.from(this.messages.keys());
      this.contacts.sort();
    });
  }

  render(): VNode {
    const header = this.$createElement('h2', 'contacts');
    const addContactInput = this.$createElement('input', {
      ref: 'addContactInput',
    });
    const addContactButton = this.$createElement('button', {
      on: {
        click: this.onAddContactClick,
      }
    }, 'Add Contact');
    const addContact = this.$createElement('div', [addContactInput, addContactButton]);
    const contactsList = this.$createElement('ul', {
      class: {
        'contacts-list': true,
      },
    }, this.contacts.map(contact => {
      return this.$createElement('li', {
        on: {
          click: this.onContactClick,
        },
        class: {
          selected: contact === this.selectedContact,
        }
      }, contact)
    }));
    return this.$createElement('div', [header, addContact, contactsList]);
  }
}
