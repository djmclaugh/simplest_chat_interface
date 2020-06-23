import Vue, { VNode } from 'vue';
import Component from 'vue-class-component';

import ChatComponent from './chat';
import ContactsComponent from './contacts';

import { onError } from '../messages_service';

const RootProps = Vue.extend({
  props: {},
});

@Component({
  components: {
    chat: ChatComponent,
    contacts: ContactsComponent,
  },
})
export default class RootComponent extends RootProps {
  // Data
  private selectedContact: string = '';
  private error: string = '';

  // Computed

  // Methods
  onContactSelection(contact: string): void {
    this.selectedContact = contact;
  }

  // Hooks
  mounted(): void {
    onError((error) => {
      this.error = error;
    });
  }

  render(): VNode {
    const contacts = this.$createElement('contacts', {
      props: {
        selectedContact: this.selectedContact,
      },
      class: {
        'contacts-section': true,
      },
      on: {
        contactSelected: this.onContactSelection,
      },
    });
    const chat = this.$createElement('chat', {
      props: {
        selectedContact: this.selectedContact,
      },
      class: {
        'chat-section': true,
      },
    });
    const root = this.$createElement('div', {
      class: {
        'root': true,
      }
    }, [contacts, chat]);

    return this.$createElement('div', [root, this.$createElement('pre', this.error)]);
  }
}
