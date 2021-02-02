import { click, fillIn, visit } from '@ember/test-helpers';
import { module, test, setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { createAuthenticateSession } from '../../../helpers/test-init';

module('Acceptance | authenticated/targets-profile/target-profile/badges', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let currentUser;
  let targetProfile;

  hooks.beforeEach(async function() {
    currentUser = server.create('user');
    await createAuthenticateSession({ userId: currentUser.id });

    targetProfile = this.server.create('target-profile', { name: 'Profil cible du ghetto' });
    this.server.create('badge', { title: 'My badge' });
    this.server.create('badge', { title: 'My badge 2' });
  });

  test('should list badges', async function(assert) {
    await visit(`/target-profiles/${targetProfile.id}/badges`);

    assert.contains('My badge');
  });
});
