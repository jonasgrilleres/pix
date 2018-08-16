const SkillReview = require('./SkillReview');

const SmartPlacementAssessmentState = Object.freeze({
  COMPLETED: 'completed',
  STARTED: 'started',
});

/**
 * Traduction: Évaluation
 * Context: Objet existant dans le cadre d'un smart placement hors calcul de la réponse suivante
 */
class SmartPlacementAssessment {

  constructor({
    id,
    // attributes
    state,
    createdAt,
    type,
    // includes
    answers = [], // of type SmartPlacementAnswers
    knowledgeElements = [], // of type SmartKnowledgeElements
    targetProfile,
    // references
    userId,
  }) {
    this.id = id;
    // attributes
    this.state = state;
    this.createdAt = createdAt;
    this.type = type;
    // includes
    this.answers = answers;
    this.knowledgeElements = knowledgeElements;
    this.targetProfile = targetProfile;
    // references
    this.userId = userId;
  }

  get isCompleted() {
    return this.state === SmartPlacementAssessmentState.COMPLETED;
  }

  get isStarted() {
    return this.state === SmartPlacementAssessmentState.STARTED;
  }

  getValidatedSkills() {

    return this.knowledgeElements
      .filter((knowledgeElement) => knowledgeElement.isValidated)
      .map((knowledgeElement) => knowledgeElement.skillId)
      .map((skillId) => this.targetProfile.skills.find((skill) => skill.name === skillId));
  }

  getFailedSkills() {

    return this.knowledgeElements
      .filter((knowledgeElement) => knowledgeElement.isInvalidated)
      .map((knowledgeElement) => knowledgeElement.skillId)
      .map((skillId) => this.targetProfile.skills.find((skill) => skill.name === skillId));
  }

  getUnratableSkills() {
    if(this.state !== SmartPlacementAssessment.State.COMPLETED) {
      return [];
    }

    return this.targetProfile.skills.filter((skillInProfile) => {

      const foundKnowledgeElementForTheSkill = this.knowledgeElements.find((knowledgeElement) => {
        return knowledgeElement.skillId === skillInProfile.name;
      });

      return (!foundKnowledgeElementForTheSkill);
    });
  }

  generateSkillReview() {
    return new SkillReview({
      id: SkillReview.generateIdFromAssessmentId(this.id),
      targetedSkills: this.targetProfile.skills,
      validatedSkills: this.getValidatedSkills(),
      failedSkills: this.getFailedSkills(),
      unratableSkills: this.getUnratableSkills(),
    });
  }
}

SmartPlacementAssessment.State = SmartPlacementAssessmentState;

module.exports = SmartPlacementAssessment;
