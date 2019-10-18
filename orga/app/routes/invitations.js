import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

export default Route.extend(UnauthenticatedRouteMixin, {

  session: service(),

  queryParams: {
    code: {}
  },

  model(params) {
    const organizationInvitationId = params.organization_invitation_id;
    const status = 'accepted';

    return this.store.createRecord('organization-invitation-response', {
      code: params.code,
      status
    })
      .save({ adapterOptions: { organizationInvitationId } })
      .finally(() => { this.transitionTo('login'); });
  },

});