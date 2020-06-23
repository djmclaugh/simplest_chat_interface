import Vue from 'vue';

import RootComponent from './components/root'

const v = new Vue({
  el: '#app',
  components: {
    root: RootComponent,
  },
  render: function(createElement) {
    return createElement('root');
  },
});

if (!v) {
  console.log('Error while bootstrapping Vue');
}
