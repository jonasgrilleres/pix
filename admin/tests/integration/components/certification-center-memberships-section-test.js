import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | certification-center-memberships-section', function(hooks) {

  setupRenderingTest(hooks);

  test('it should display certification center memberships details', async function(assert) {
    // given
    const user1 = EmberObject.create({ id: 123, firstName: 'Jojo', lastName: 'La Gringue', email: 'jojo@lagringue.fr' });
    const certificationCenterMembership1 = EmberObject.create({ id: 1, user: user1, createdAt: new Date('2018-02-15T05:06:07Z') });
    const certificationCenterMemberships = [certificationCenterMembership1];
    this.set('certificationCenterMemberships', certificationCenterMemberships);

    // when
    await render(hbs`<CertificationCenterMembershipsSection @certificationCenterMemberships={{certificationCenterMemberships}} />`);

    // then
    assert.dom('[aria-label="Membre"]').exists();
    assert.dom('[data-test-membership-id]').hasText('1');
    assert.dom('[data-test-user-id]').hasText('123');
    assert.dom('[data-test-user-first-name]').hasText('Jojo');
    assert.dom('[data-test-user-last-name]').hasText('La Gringue');
    assert.dom('[data-test-user-email]').hasText('jojo@lagringue.fr');
    assert.dom('[data-test-membership-created-at]').hasText('15/02/2018 05:06:07');
  });

  test('it should display a list of certification center memberships', async function(assert) {
    // given
    const user1 = EmberObject.create({ firstName: 'Jojo', lastName: 'La Gringue', email: 'jojo@lagringue.fr' });
    const user2 = EmberObject.create({ firstName: 'Froufrou', lastName: 'Le froussard', email: 'froufrou@lefroussard.fr' });
    const certificationCenterMembership1 = EmberObject.create({ id: 1, user: user1 });
    const certificationCenterMembership2 = EmberObject.create({ id: 1, user: user2 });
    const certificationCenterMemberships = [certificationCenterMembership1, certificationCenterMembership2];
    this.set('certificationCenterMemberships', certificationCenterMemberships);

    // when
    await render(hbs`<CertificationCenterMembershipsSection @certificationCenterMemberships={{certificationCenterMemberships}} />`);

    // then
    assert.dom('[aria-label="Membre"]').exists({ count: 2 });
  });

  test('it should display a message when there is no membership', async function(assert) {
    // when
    await render(hbs`<CertificationCenterMembershipsSection />`);

    // then
    assert.dom('[data-test-empty-message]').hasText('Aucun résultat');
  });
});
