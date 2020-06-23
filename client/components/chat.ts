import Vue, { VNode } from 'vue';
import Component from 'vue-class-component';

import { getAllMessages, onUpdate, MessageCollection, Message, sendMessage } from '../messages_service';

const ChatProps = Vue.extend({
  props: {
    selectedContact: String,
  },
});

@Component({
  components: {},
})
export default class ChatComponent extends ChatProps {
  // Data
  private allMessages: Map<string, MessageCollection> = getAllMessages();


  // Computed
  get messages(): Message[] {
    if (this.allMessages.has(this.selectedContact)) {
      return this.allMessages.get(this.selectedContact)!.messages;
    } else {
      return [];
    }
  }

  // Methods
  processInput(event: KeyboardEvent): void {
    const element: HTMLInputElement = <HTMLInputElement>this.$refs['chatInput'];
    if (event.key === 'Enter' && element.value.length > 0) {
      sendMessage(this.selectedContact, element.value);
      element.value = '';
    }
  }

  // Hooks
  mounted(): void {
    onUpdate((allMessages) => {
      this.allMessages = allMessages;
    });
  }

  updated(): void {
    const element = <Element>this.$refs['chatView'];
    element.scrollTop = element.scrollHeight;
  }

  render(): VNode {
    const chatArea = this.$createElement('div', {
      ref: 'chatView',
      class: {
        'chat-area': true,
      },
    }, this.messages.map(message => {
      return this.$createElement('p', {
        class: {
          'message-outgoing': message.isSender,
          'message-incoming': !message.isSender,
        },
      }, message.message);
    }));

    const inputArea = this.$createElement('input', {
      ref: 'chatInput',
      class: {
        'input-box': true,
      },
      attrs: {
        id: 'chat',
        type: 'text',
      },
      on: {
        keyup: this.processInput,
      },
    });
    return this.$createElement('div', [chatArea, inputArea]);
  }
}
