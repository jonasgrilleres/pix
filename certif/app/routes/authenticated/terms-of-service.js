import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({

  currentUser: service(),

  renderTemplate() {
    this.render('authenticated.terms-of-service', {
    into: 'application'
    })
  },

  beforeModel() {
    this.currentUser.load()
      .then((user) => {
        if (user.pixCertifTermsOfServiceAccepted) {
          return this.transitionTo('authenticated.sessions.list');
        }
      });
  }
});
