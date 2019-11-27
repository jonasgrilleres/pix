import Component from '@ember/component';
import { trySet } from '@ember/object';

export default Component.extend({
  classNames: ['challenge-illustration'],
  src: null,
  alt: null,

  hiddenClass: 'challenge-illustration__loaded-image--hidden',
  displayPlaceholder: true,

  actions: {
    onImageLoaded() {
      trySet(this, 'displayPlaceholder', false);
      trySet(this, 'hiddenClass', null);
    }
  },

});
