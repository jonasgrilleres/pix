const { expect, databaseBuilder, airtableBuilder, knex } = require('../../../test-helper');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');
const campaignAssessmentParticipationResultRepository = require('../../../../lib/infrastructure/repositories/campaign-assessment-participation-result-repository');

describe('Integration | Repository | Campaign Assessment Participation Result', () => {

  describe('#getByCampaignIdAndCampaignParticipationId', () => {

    beforeEach(() => {
      const learningContent = [
        {
          id: 'recArea0',
          color: 'orange',
          competences: [
            {
              id: 'rec1',
              index: '1.1',
              name: 'Compétence 1',
              tubes: [
                {
                  id: 'recTube1',
                  skills: [
                    {
                      id: 'skill1',
                      nom: '@acquis1',
                      challenges: [],
                    },
                  ],
                },
              ],
            },
            {
              id: 'rec2',
              index: '1.2',
              name: 'Compétence 2',
              tubes: [
                {
                  id: 'recTube2',
                  skills: [
                    {
                      id: 'skill2',
                      nom: '@acquis2',
                      challenges: [],
                    },
                    {
                      id: 'skill3',
                      nom: '@autreAcquis',
                      challenges: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];
      const airTableObjects = airtableBuilder.factory.buildLearningContent(learningContent);
      airtableBuilder.mockLists(airTableObjects);
    });

    afterEach(() => {
      airtableBuilder.cleanAll();
      cache.flushAll();
      return knex('knowledge-element-snapshots').delete();
    });

    let campaignId, campaignParticipationId;

    context('When campaign participation is shared', () => {
      beforeEach(async () => {
        campaignId = databaseBuilder.factory.buildAssessmentCampaignForSkills({}, [{ id: 'skill1' }, { id: 'skill2' }]).id;
        const userId = databaseBuilder.factory.buildUser().id;
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          isShared: true,
          sharedAt: new Date('2020-01-02'),
        }).id;

        databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId });

        databaseBuilder.factory.buildKnowledgeElement({
          userId,
          skillId: 'skill1',
          competenceId: 'rec1',
          createdAt: new Date('2020-01-01'),
          status: KnowledgeElement.StatusType.VALIDATED,
        });
        databaseBuilder.factory.buildKnowledgeElement({
          userId,
          skillId: 'skill2',
          competenceId: 'rec2',
          createdAt: new Date('2020-01-01'),
          status: KnowledgeElement.StatusType.INVALIDATED,
        });
        databaseBuilder.factory.buildKnowledgeElement({
          userId,
          skillId: 'skill3',
          competenceId: 'rec2',
          createdAt: new Date('2020-01-01'),
          status: KnowledgeElement.StatusType.VALIDATED,
        });
        await databaseBuilder.commit();
      });

      it('fills competenceResults', async () => {
        const expectedResult = [
          {
            areaColor: 'orange',
            id: 'rec1',
            index: '1.1',
            name: 'Compétence 1',
            targetedSkillsCount: 1,
            validatedSkillsCount: 1,
          },
          {
            areaColor: 'orange',
            id: 'rec2',
            index: '1.2',
            name: 'Compétence 2',
            targetedSkillsCount: 1,
            validatedSkillsCount: 0,
          },
        ];

        const campaignAssessmentParticipationResult = await campaignAssessmentParticipationResultRepository.getByCampaignIdAndCampaignParticipationId({ campaignId, campaignParticipationId });

        expect(campaignAssessmentParticipationResult.isShared).to.equal(true);
        expect(campaignAssessmentParticipationResult.competenceResults.length).to.equal(2);
        expect(campaignAssessmentParticipationResult.competenceResults).to.deep.equal(expectedResult);
      });
    });
  });
});