const { expect, databaseBuilder } = require('../../test-helper');
const _ = require('lodash');
const sinon = require('sinon');

const KnowledgeElement = require('../../../lib/domain/models/KnowledgeElement');
const Skill = require('../../../lib/domain/models/Skill');
const Tube = require('../../../lib/domain/models/Tube');
const skillRepository = require('../../../lib/infrastructure/repositories/skill-repository');
const tubeRepository = require('../../../lib/infrastructure/repositories/tube-repository');
const competenceRepository = require('../../../lib/infrastructure/repositories/competence-repository');
const { FRENCH_FRANCE } = require('../../../lib/domain/constants').LOCALE;
const {
  findDirectAndHigherLevelKEs,
  getAllTestedChallenges,
  mergeTestedChallengesAndKEsByCompetences,
  // mergeCompetencesWithReferentialInfos,
} = require('../../../scripts/helpers/certif/positionned-and-tested-profile-helper');
const Competence = require('../../../lib/domain/models/Competence');

describe.only('Integration | Scripts | create-or-update-sco-organizations.js', () => {

  describe('#findDirectAndHigherLevelKEs', () => {

    it('should return only direct and higher level knowledge elements', async () => {
      // given
      const userId = databaseBuilder.factory.buildUser({}).id;
      const directKEs = createDirectAndValidKEs({ numberOfKe: 4, userId });
      createInferredAndValidKEs({ numberOfKe: 4, userId });

      await databaseBuilder.commit();

      // when
      const result = await findDirectAndHigherLevelKEs({ userId });

      // then
      const expectedKEs = directKEs;
      expect(result).to.deep.equal(expectedKEs);
    });
  });

  describe('#getAllTestedChallenges', () => {

    it('should return a certification course challenges', async () => {
      // given
      const courseId = databaseBuilder.factory.buildCertificationCourse({}).id;
      const challenges = createChallengesForCertificationCourse({ courseId: courseId, numberOfChallenges: 5 });

      await databaseBuilder.commit();

      // when
      const result = await getAllTestedChallenges({ courseId });

      // then
      const expectedChallenges = challenges.map((challenge) => {
        return {
          id: challenge.id,
          associatedSkillName: challenge.associatedSkillName,
          associatedSkillId: challenge.associatedSkillId,
          challengeId: challenge.challengeId,
          courseId: challenge.courseId,
          competenceId: challenge.competenceId,
        }
      });
      expect(result).to.deep.equal(expectedChallenges);
    });
  });

  describe('#mergeTestedChallengesAndKEsByCompetences', () => {

    it.only('should return positionned and tested skills sorted by competences', async () => {
      // given
      // referentiel
      const competence1 = new Competence({ id: 'competence1', name: 'competence orange', area: 'Orange' });
      const competence2 = new Competence({ id: 'competence2', name: 'competence verte', area: 'Vert' });
      const tube1 = new Tube({ id: 'tubeId1', name: '@remplir', competenceId: competence1.id });
      const tube2 = new Tube({ id: 'tubeId2', name: '@citation', competenceId: competence1.id });
      const tube3 = new Tube({ id: 'tubeId3', name: '@recherche', competenceId: competence2.id });
      const skillRemplir2 = new Skill({ id: 50, name: '@remplir2', competenceId: competence1.id, tubeId: tube1.id });
      const skillRemplir4 = new Skill({ id: 60, name: '@remplir4', competenceId: competence1.id, tubeId: tube1.id });
      const skillCitation4 = new Skill({ id: 10, name: '@citation4', competenceId: competence1.id, tubeId: tube2.id });
      const skillRecherche4 = new Skill({ id: 40, name: '@recherche4', competenceId: competence2.id, tubeId: tube3.id });
      const skillCollaborer4 = new Skill({ id: 20, name: '@collaborer4', competenceId: 'competenceId4', tubeId: 'tubeId4' });
      const skillMoteur3 = new Skill({ id: 30, name: '@moteur3', competenceId: 'competenceId5', tubeId: 'tubeId5' });

      // database
      const KE1 = databaseBuilder.factory.buildKnowledgeElement({
        source: KnowledgeElement.SourceType.DIRECT,
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId: skillRemplir2.id,
        competenceId: competence1.id,
      });
      const KE2 = databaseBuilder.factory.buildKnowledgeElement({
        source: KnowledgeElement.SourceType.DIRECT,
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId: skillRemplir4.id,
        competenceId: competence1.id,
      });
      const KE3 = databaseBuilder.factory.buildKnowledgeElement({
        source: KnowledgeElement.SourceType.DIRECT,
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId: skillCitation4.id,
        competenceId: competence1.id,
      });
      const KE4 = databaseBuilder.factory.buildKnowledgeElement({
        source: KnowledgeElement.SourceType.DIRECT,
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId: skillRecherche4.id,
        competenceId: competence2.id,
      });
      const userPositionnedKEs = [ KE1, KE2, KE3, KE4 ];

      const challengeTested1 = databaseBuilder.factory.buildCertificationChallenge({
        associatedSkillId: skillRemplir2.id,
        competenceId: competence1.id,
      });
      const challengeTested2 = databaseBuilder.factory.buildCertificationChallenge({
        associatedSkillId: skillRecherche4.id,
        competenceId: competence2.id,
      });
      const challengesTestedInCertif = [ challengeTested1, challengeTested2 ];

      // stubs
      sinon.stub(skillRepository, 'findOperativeByCompetenceId').resolves([
        skillRemplir2,
        skillRemplir4,
        skillCitation4,
        skillRecherche4,
        skillCollaborer4,
        skillMoteur3,
      ]);
      const tubeGetStub = sinon.stub(tubeRepository, 'get')
      tubeGetStub.withArgs(tube1.id).resolves(tube1);
      tubeGetStub.withArgs(tube2.id).resolves(tube2);
      tubeGetStub.withArgs(tube3.id).resolves(tube3);
      const competenceGetStub = sinon.stub(competenceRepository, 'get')
      competenceGetStub.withArgs({ id: competence1.id, locale: FRENCH_FRANCE }).resolves(competence1);
      competenceGetStub.withArgs({ id: competence2.id, locale: FRENCH_FRANCE }).resolves(competence2);

      // when
      const result = await mergeTestedChallengesAndKEsByCompetences({
        KEs: userPositionnedKEs,
        challengesTestedInCertif,
      });

      // then
      const expectedResult = [
        {
          id: competence1.id,
          name: competence1.name,
          area: competence1.area,
          tubes: [
            {
              id: tube1.id,
              name: tube1.name,
              competenceId: tube1.competenceId,
              skills: [
                {
                  id: skillRemplir2.id,
                  name: skillRemplir2.name,
                  mbTestedChallenge: [ challengeTested1 ],
                  tubeId: tube1.id,
                },
                {
                  id: skillRemplir4.id,
                  name: skillRemplir4.name,
                  mbTestedChallenge: [],
                  tubeId: tube1.id,
                },
              ],
            },
            {
              id: tube2.id,
              name: tube2.name,
              competenceId: tube2.competenceId,
              skills: [
                {
                  id: skillCitation4.id,
                  name: skillCitation4.name,
                  mbTestedChallenge: [],
                  tubeId: tube2.id,
                }
              ],
            },
          ],
        },
        {
          id: competence2.id,
          name: competence2.name,
          area: competence2.area,
          tubes: [
            {
              id: tube3.id,
              name: tube3.name,
              competenceId: tube3.competenceId,
              skills: [
                {
                  id: skillRecherche4.id,
                  name: skillRecherche4.name,
                  mbTestedChallenge: [ challengeTested2 ],
                  tubeId: tube3.id,
                },
              ],
            },
          ]
        },
      ];
      expect(result).to.deep.equal(expectedResult);
    });
  });

});

function createDirectAndValidKEs({ numberOfKe, userId }) {
  return createKEs({
    numberOfKe,
    userId,
    source: KnowledgeElement.SourceType.DIRECT,
    status: KnowledgeElement.StatusType.VALIDATED,
  });
}

function createInferredAndValidKEs({ numberOfKe, userId }) {
  return createKEs({
    numberOfKe,
    userId,
    source: KnowledgeElement.SourceType.INFERRED,
    status: KnowledgeElement.StatusType.VALIDATED,
  });
}

function createKEs({ numberOfKe, userId, source, status }) {
  const assessmentId = databaseBuilder.factory.buildAssessment({ userId }).id;
  return _.times(numberOfKe, (i) => databaseBuilder.factory.buildKnowledgeElement({
    source,
    status,
    skillId: `${i} skillId`,
    assessmentId,
    answerId: databaseBuilder.factory.buildAnswer().id,
    userId,
    competenceId: `${i} competenceId`,
  }));
}

function createChallengesForCertificationCourse({ courseId, numberOfChallenges }) {
  return _.times(numberOfChallenges, () => databaseBuilder.factory.buildCertificationChallenge({
    courseId,
  }));
}
