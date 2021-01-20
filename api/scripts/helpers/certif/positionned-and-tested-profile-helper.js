const bookshelfToDomainConverter = require('../../../lib/infrastructure/utils/bookshelf-to-domain-converter');
const CertificationChallengeBookshelf = require('../../../lib/infrastructure/data/certification-challenge');
const KnowledgeElementBookshelf = require('../../../lib/infrastructure/data/knowledge-element');

const competenceRepository = require('../../../lib/infrastructure/repositories/competence-repository');
const tubeRepository = require('../../../lib/infrastructure/repositories/tube-repository');
const skillRepository = require('../../../lib/infrastructure/repositories/skill-repository');
const KnowledgeElement = require('../../../lib/domain/models/KnowledgeElement');
const { FRENCH_FRANCE } = require('../../../lib/domain/constants').LOCALE;

const _ = require('lodash');

async function findDirectAndHigherLevelKEs({ userId }) {
  const KEs = await KnowledgeElementBookshelf
    .where({
      userId,
      source: KnowledgeElement.SourceType.DIRECT,
      status: KnowledgeElement.StatusType.VALIDATED })
    .fetchAll();
  return KEs.map((ke) => bookshelfToDomainConverter.buildDomainObject(KnowledgeElementBookshelf, ke));
}

async function getAllTestedChallenges({ courseId }) {
  const challengeList = await CertificationChallengeBookshelf
    .where({ courseId })
    .fetchAll();
  return challengeList.map((challenge) => bookshelfToDomainConverter.buildDomainObject(CertificationChallengeBookshelf, challenge));
}

async function _getPositionnedSkillsFromKEs(KEs) {
  const positionnedSkills = await Promise.all(_.map(KEs, async (KE) => {
    const allSkillsForThisCompetence = await skillRepository.findOperativeByCompetenceId(KE.competenceId);
    const skillFoundForThisKE = _.find((allSkillsForThisCompetence), (skill) => skill.id === KE.skillId);
    return skillFoundForThisKE
      ? { id: skillFoundForThisKE.id, name: skillFoundForThisKE.name, tubeId: skillFoundForThisKE.tubeId }
      : undefined;
  }));

  return positionnedSkills.filter((positionnedSkill) => positionnedSkill !== undefined);
}

function _tagTestedSkills({ skills, challengesTestedInCertif }) {
  return _.map(skills, (skill) => {
    skill.mbTestedChallenge = _.filter(
      challengesTestedInCertif,
      (challenge) => challenge.associatedSkillId === skill.id,
    );
    return skill;
  });
}

async function _groupSkillsByTubes(skills) {
  const groupedSkillsByTubes = _.groupBy(skills, 'tubeId');
  const tubeIds = Object.keys(groupedSkillsByTubes);
  return Promise.all(_.map(tubeIds, async (tubeId) => {
    const skills = groupedSkillsByTubes[tubeId];
    const tubeWithInfos = await tubeRepository.get(tubeId);
    return {
      id: tubeId,
      name: tubeWithInfos.name,
      competenceId: tubeWithInfos.competenceId,
      skills,
    };
  }));
}

async function _groupTubesByCompetences(tubes) {
  const groupedTubesByCompetences = _.groupBy(tubes, 'competenceId');
  const competencesIds = Object.keys(groupedTubesByCompetences);
  return Promise.all(_.map(competencesIds, async (competenceId) => {
    const tubes = groupedTubesByCompetences[competenceId];
    const competenceWithInfo = await competenceRepository.get({ id: competenceId, locale: FRENCH_FRANCE });
    return {
      id: competenceId,
      name: competenceWithInfo.name,
      area: competenceWithInfo.area,
      tubes,
    };
  }));
}

async function mergeTestedChallengesAndKEsByCompetences({ KEs, challengesTestedInCertif }) {
  const positionnedSkills = await _getPositionnedSkillsFromKEs(KEs);

  const positionnedAndTestedSkills = _tagTestedSkills({ skills: positionnedSkills, challengesTestedInCertif });

  const tubesWithSkills = await _groupSkillsByTubes(positionnedAndTestedSkills);

  const competencesWithTubesAndSkills = await _groupTubesByCompetences(tubesWithSkills);

  return competencesWithTubesAndSkills;
}

module.exports = {
  findDirectAndHigherLevelKEs,
  getAllTestedChallenges,
  mergeTestedChallengesAndKEsByCompetences,
};
