import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import { setBreakpoint } from 'ember-responsive/test-support';

describe('Integration | Component | Profile-content', function() {
  setupIntlRenderingTest();

  context('On component rendering', function() {
    let model;

    beforeEach(function() {
      class session extends Service {
        isAuthenticated = true;
      }

      this.owner.register('service:session', session);

      model = {
        profile: {
          pixScore: '34',
          areasCode: [0, 1],
          scorecards: [
            {
              id: 1,
              areaColor: 0,
              level: 3,
              name: 'Name',
              percentageAheadOfNextLevel: 0.5,
              area: {
                code: 0,
                title: 'Area title',
              },
            },
            {
              id: 2,
              areaColor: 1,
              level: 2,
              name: 'Name 2',
              percentageAheadOfNextLevel: 0.5,
              area: {
                code: 1,
                title: 'Area title 2',
              },
            },
          ],
        },
      };
    });

    context('When user is on tablet/desktop ', function() {
      it('should be rendered in tablet/desktop mode with big cards', async function() {
        // when
        setBreakpoint('tablet');
        this.set('model', model);
        await render(hbs`<ProfileContent @model={{this.model}} @media={{this.media}} />`);

        // then
        expect(find('.competence-card')).to.exist;
        expect(find('.score-label')).to.exist;
        expect(find('.competence-card__interactions')).to.exist;
      });
    });

    context('When user is on mobile', function() {
      it('should be rendered in mobile mode with small cards', async function() {
        // when
        setBreakpoint('mobile');
        this.set('model', model);
        await render(hbs`<ProfileContent @model={{this.model}} @media={{this.media}} />`);

        // then
        expect(find('.competence-card')).to.exist;
        expect(find('.score-label')).to.not.exist;
        expect(find('.competence-card__interactions')).to.not.exist;
      });
    });
  });
});
