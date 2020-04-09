import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module.only('Unit | Model | campaign', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('campaign', {}));
    assert.ok(model);
  });

  test('it should return the right data in the campaign model', function(assert) {
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('campaign', {
      name: 'Fake name',
      code: 'ABC123'
    }));
    assert.equal(model.name, 'Fake name');
    assert.equal(model.code, 'ABC123');
  });

  test('it should construct the url to result of the campaign with type assessment', function(assert) {
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('campaign', {
      id: 1,
      name: 'Fake name',
      code: 'ABC123',
      tokenForCampaignResults: 'token',
      type: 'ASSESSMENT'
    }));
    assert.equal(model.urlToResult, 'http://localhost:3000/api/campaigns/1/csv-assessment-results?accessToken=token');
  });

  test('it should construct the url to result of the campaign with type profiles collection', function(assert) {
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('campaign', {
      id: 1,
      name: 'Fake name',
      code: 'ABC123',
      tokenForCampaignResults: 'token',
      type: 'PROFILES_COLLECTION'
    }));
    assert.equal(model.urlToResult, 'http://localhost:3000/api/campaigns/1/csv-profiles-collection-results?accessToken=token');
  });

  test('it should compute the isArchived property from the archivation date at creation', function(assert) {
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('campaign', {
      archivedAt: new Date('2010-10-10'),
    }));
    assert.equal(model.isArchived, true);
  });

  test('it should compute the isArchived property from the archivation date when set to null', function(assert) {
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('campaign', {
      archivedAt: new Date('2010-10-10'),
    }));
    model.set('archivedAt', null);
    assert.equal(model.isArchived, false);
  });

  module('#readableType', function(hooks) {
    let store;

    hooks.beforeEach(function() {
      store = this.owner.lookup('service:store');
    });

    test('it should compute the readableType property when type is ASSESSMENT', function(assert) {
      // when
      const model = store.createRecord('campaign', { type: 'ASSESSMENT' });

      // then
      assert.equal(model.readableType, 'Évaluation');
    });

    test('it should compute the readableType property when type is PROFILES_COLLECTION', function(assert) {
      // when
      const model = store.createRecord('campaign', { type: 'PROFILES_COLLECTION' });

      // then
      assert.equal(model.readableType, 'Collecte de profils');
    });
  });

  module('canBeArchived', function() {
    let store;

    hooks.beforeEach(function() {
      store = this.owner.lookup('service:store');
    });

    module('when type is ASSESSMENT', function() {
      module('when campaign is not archived', function() {
        test('it should return true', function(assert) {
          const campaign = store.createRecord('campaign', {
            type: 'ASSESSMENT',
            archivedAt: null,
          });

          assert.equal(campaign.canBeArchived, true);
        });
        module('when campaign is archived', function() {
          test('it should return false', function(assert) {
            const campaign = store.createRecord('campaign', {
              type: 'ASSESSMENT',
              archivedAt: new Date('2020-01-01'),
            });

            assert.equal(campaign.canBeArchived, false);
          });
        });
      });
    });
    module('when type is PROFILES_COLLECTION', function() {
      test('it should be false', function(assert) {
        const campaign = store.createRecord('campaign', {
          type: 'PROFILES_COLLECTION',
          archivedAt: null,
        });

        assert.equal(campaign.canBeArchived, false);
      });
    });
  });
});
