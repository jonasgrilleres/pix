const bookshelfToDomainConverter = require('../../../lib/infrastructure/utils/bookshelf-to-domain-converter');
const CertificationChallengeBookshelf = require('../../../lib/infrastructure/data/certification-challenge');
const KnowledgeElementBookshelf = require('../../../lib/infrastructure/data/knowledge-element');

const competenceRepository = require('../../../lib/infrastructure/repositories/competence-repository');
const tubeRepository = require('../../../lib/infrastructure/repositories/tube-repository');
const skillRepository = require('../../../lib/infrastructure/repositories/skill-repository');
const KnowledgeElement = require('../../../lib/domain/models/KnowledgeElement');
const { FRENCH_FRANCE } = require('../../../lib/domain/constants').LOCALE;

const _ = require('lodash');
// const Skill = require('../../../lib/domain/models/Skill');

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


function _getPositionnedSkillsFromKEs(KEs) {
  return Promise.all(_.map(KEs, async (KE) => {
    const allSkillsForThisCompetence = await skillRepository.findOperativeByCompetenceId(KE.competenceId);
    const skillFoundForThisKE = _.find((allSkillsForThisCompetence), (skill) => skill.id === KE.skillId);
    return {
      id: skillFoundForThisKE.id,
      name: skillFoundForThisKE.name,
      tubeId: skillFoundForThisKE.tubeId,
    };
  }));
}

function _tagTestedSkills({ skills, challengesTestedInCertif }) {
  return _.map(skills, (skill) => {
    skill.mbTestedChallenge = _.filter(
      challengesTestedInCertif,
      (challenge) => challenge.associatedSkillId === skill.id
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
  
  const tubesWithSkills = await _groupSkillsByTubes(positionnedAndTestedSkills)

  const competencesWithTubesAndSkills = await _groupTubesByCompetences(tubesWithSkills);

  return competencesWithTubesAndSkills;
}

async function mergeCompetencesWithReferentialInfos({ competences }) {
  const competencesInfos = await competenceRepository.listPixCompetencesOnly();

  // Ajout des infos pour les compétences
  let competencesWithInfos = await Promise.all(_.map((competences), async (competence) => {
    const competenceWithInfos = _.find((competencesInfos), (comp) => comp.id === competence.competenceId);
    competenceWithInfos.positionnedSkills = competence.skills;
    delete competenceWithInfos.description;
    delete competenceWithInfos.skillIds;
    delete competenceWithInfos.level;
    competenceWithInfos.activeSkillsIds = await skillRepository.findActiveByCompetenceId(competence.competenceId)
    competenceWithInfos.operativeSkillsIds = await skillRepository.findOperativeByCompetenceId(competence.competenceId)
    return competenceWithInfos;
  }));

  // Ajout des infos pour les skills
  competencesWithInfos = _.map((competencesWithInfos), (competence) => {
    const allSkillsForThisCompetence = competence.operativeSkillsIds;
    competence.positionnedSkills = _.map((competence.positionnedSkills), (positionnedSkill) => {
      const skillFound = _.find((allSkillsForThisCompetence), (skill) => skill.id === positionnedSkill.id);
      positionnedSkill.name = skillFound && skillFound.name;
      positionnedSkill.pixValue = skillFound && skillFound.pixValue;
      positionnedSkill.competenceId = skillFound && skillFound.competenceId;
      positionnedSkill.tutorialIds = skillFound && skillFound.tutorialIds;
      positionnedSkill.tubeId = skillFound && skillFound.tubeId;
      return positionnedSkill;
    });
    return competence;
  });

  // Tri de TOUS les operatives skills par tubes
  competencesWithInfos = _.map((competencesWithInfos), (competence) => {
    // Regroupement des skills par tubes
    competence.tubes = _.groupBy((competence.operativeSkillsIds), 'tubeId');
    // Tris des skills dans les tubes
    competence.tubes = _.map((competence.tubes), (tube) => {
      return _.sortBy(tube, 'name');
    });
    return competence;
  });

  // Ajout des infos pour les tubes
  competencesWithInfos = await Promise.all(_.map((competencesWithInfos), async (competence) => {
    competence.tubes = await Promise.all(_.map(competence.tubes, async (tube) => {
      const firstSkill = tube[0];
      const tubeId = firstSkill.tubeId; // tous les skills de ce tube on le même tubeId
      const tubeWithInfos = await tubeRepository.get(tubeId);
      delete tubeWithInfos.title;
      delete tubeWithInfos.practicalTitle;
      delete tubeWithInfos.description;
      delete tubeWithInfos.practicalDescription;
      tubeWithInfos.skills = tube;
      return tubeWithInfos;
    }));
    return competence;
  }));

  // Ajout du label positionned pour les skills
  competencesWithInfos = _.map((competencesWithInfos), (competence) => {
    const positionnedSkills = competence.positionnedSkills;
    competence.tubes = _.map(competence.tubes, (tube) => {
      tube.skills = _.map(tube.skills, (skill) => {
        const mbPositionnedSkill = _.find((positionnedSkills), skill);
        skill.isPositionned = Boolean(mbPositionnedSkill);
        skill.mbTestedChallenge = mbPositionnedSkill && mbPositionnedSkill.mbTestedChallenge;
        // TODO : rajouter skill.isActive
        return skill;
      });
      return tube;
    });
    return competence;
  });

  return competencesWithInfos;
}

module.exports = {
  findDirectAndHigherLevelKEs,
  getAllTestedChallenges,
  mergeTestedChallengesAndKEsByCompetences,
  mergeCompetencesWithReferentialInfos,
}