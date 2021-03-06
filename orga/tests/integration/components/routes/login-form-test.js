import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import EmberObject from '@ember/object';
import { render } from '@ember/test-helpers';
import fillInByLabel from '../../../helpers/extended-ember-test-helpers/fill-in-by-label';
import clickByLabel from '../../../helpers/extended-ember-test-helpers/click-by-label';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import { reject, resolve } from 'rsvp';

const errorMessages = {
  NOT_LINKED_ORGANIZATION_MSG: 'Vous ne pouvez pas vous connecter à PixOrga car vous n’êtes rattaché à aucune organisation. Contactez votre administrateur qui pourra vous inviter.',
  INVALID_CREDENTIEL_MSG: 'L\'adresse e-mail et/ou le mot de passe saisis sont incorrects.',
};

module('Integration | Component | routes/login-form', function(hooks) {
  setupRenderingTest(hooks);

  class SessionStub extends Service {}
  class StoreStub extends Service {}

  hooks.beforeEach(function() {
    this.owner.register('service:session', SessionStub);
    this.owner.unregister('service:store');
    this.owner.register('service:store', StoreStub);
  });

  test('it should ask for email and password', async function(assert) {
    // when
    await render(hbs`<Routes::LoginForm/>`);

    // then
    assert.dom('#login-email').exists();
    assert.dom('#login-password').exists();
  });

  test('it should not display error message', async function(assert) {
    // when
    await render(hbs`<Routes::LoginForm/>`);

    // then
    assert.dom('#login-form-error-message').doesNotExist();
  });

  module('When there is no invitation', function(hooks) {

    hooks.beforeEach(function() {
      SessionStub.prototype.authenticate = function(authenticator, email, password, scope) {
        this.authenticator = authenticator;
        this.email = email;
        this.password = password;
        this.scope = scope;
        return resolve();
      };
    });

    test('it should call authentication service with appropriate parameters', async function(assert) {
      // given
      const sessionServiceObserver = this.owner.lookup('service:session');
      await render(hbs`<Routes::LoginForm @organizationInvitationId=1 @organizationInvitationCode='C0D3'/>`);
      await fillInByLabel('Adresse e-mail', 'pix@example.net');
      await fillInByLabel('Mot de passe', 'JeMeLoggue1024');

      // when
      await clickByLabel('Je me connecte');

      // then
      assert.dom('.alert-input--error').doesNotExist();
      assert.equal(sessionServiceObserver.authenticator, 'authenticator:oauth2');
      assert.equal(sessionServiceObserver.email, 'pix@example.net');
      assert.equal(sessionServiceObserver.password, 'JeMeLoggue1024');
      assert.equal(sessionServiceObserver.scope, 'pix-orga');
    });
  });

  module('When there is an invitation', function(hooks) {

    hooks.beforeEach(function() {
      StoreStub.prototype.createRecord = () => {
        return EmberObject.create({
          save() {
            return resolve();
          },
        });
      };
      SessionStub.prototype.authenticate = function(authenticator, email, password, scope) {
        this.authenticator = authenticator;
        this.email = email;
        this.password = password;
        this.scope = scope;
        return resolve();
      };
    });

    test('it should be ok and call authentication service with appropriate parameters', async function(assert) {
      // given
      const sessionServiceObserver = this.owner.lookup('service:session');
      await render(hbs`<Routes::LoginForm @isWithInvitation=true @organizationInvitationId=1 @organizationInvitationCode='C0D3'/>`);
      await fillInByLabel('Adresse e-mail', 'pix@example.net');
      await fillInByLabel('Mot de passe', 'JeMeLoggue1024');

      //  when
      await clickByLabel('Je me connecte');

      // then
      assert.dom('.alert-input--error').doesNotExist();
      assert.equal(sessionServiceObserver.authenticator, 'authenticator:oauth2');
      assert.equal(sessionServiceObserver.email, 'pix@example.net');
      assert.equal(sessionServiceObserver.password, 'JeMeLoggue1024');
      assert.equal(sessionServiceObserver.scope, 'pix-orga');
    });
  });

  test('it should display an invalid credentiels message when authentication fails', async function(assert) {

    // given
    const msgErrorInvalidCredentiel = {
      'errors': [{ 'status': '401', 'title': 'Unauthorized', 'detail': errorMessages.INVALID_CREDENTIEL_MSG }],
    };

    SessionStub.prototype.authenticate = () => reject(msgErrorInvalidCredentiel);

    await render(hbs`<Routes::LoginForm/>`);
    await fillInByLabel('Adresse e-mail', 'pix@example.net');
    await fillInByLabel('Mot de passe', 'Mauvais mot de passe');

    //  when
    await clickByLabel('Je me connecte');

    // then
    assert.dom('#login-form-error-message').exists();
    assert.dom('#login-form-error-message').hasText(errorMessages.INVALID_CREDENTIEL_MSG);
  });

  test('it should display an not linked organisation message when authentication fails', async function(assert) {

    // given
    const msgErrorNotLinkedOrganization = {
      'errors': [{ 'status': '403', 'title': 'Unauthorized', 'detail': errorMessages.NOT_LINKED_ORGANIZATION_MSG }],
    };

    SessionStub.prototype.authenticate = () => reject(msgErrorNotLinkedOrganization);

    await render(hbs`<Routes::LoginForm/>`);
    await fillInByLabel('Adresse e-mail', 'pix@example.net');
    await fillInByLabel('Mot de passe', 'pix123');

    //  when
    await clickByLabel('Je me connecte');

    // then
    assert.dom('#login-form-error-message').exists();
    assert.dom('#login-form-error-message').hasText(errorMessages.NOT_LINKED_ORGANIZATION_MSG);
  });

  test('it should not display context message', async function(assert) {
    assert.dom('login-form__information').doesNotExist();
  });

  module('when password is hidden', function(hooks) {

    hooks.beforeEach(async function() {
      // given
      await render(hbs`<Routes::LoginForm/>);`);
    });

    test('it should display password when user click', async function(assert) {
      // when
      await clickByLabel('rendre le mot de passe lisible');

      // then
      assert.dom('#login-password').hasAttribute('type', 'text');
    });

    test('it should change icon when user click on it', async function(assert) {
      // when
      await clickByLabel('rendre le mot de passe lisible');

      // then
      assert.dom('.fa-eye').exists();
    });

    test('it should not change icon when user keeps typing his password', async function(assert) {
      // given
      await fillInByLabel('Mot de passe', 'début du mot de passe');

      // when
      await clickByLabel('rendre le mot de passe lisible');
      await fillInByLabel('Mot de passe', 'fin du mot de passe');

      // then
      assert.dom('.fa-eye').exists();
    });
  });
});
