const { injectDependencies } = require('../../infrastructure/utils/dependency-injection');

const dependencies = {
  answerRepository: require('../../infrastructure/repositories/answer-repository'),
  assessmentRepository: require('../../infrastructure/repositories/assessment-repository'),
  badgeAcquisitionRepository: require('../../infrastructure/repositories/badge-acquisition-repository'),
  assessmentResultRepository: require('../../infrastructure/repositories/assessment-result-repository'),
  badgeCriteriaService: require('../../domain/services/badge-criteria-service'),
  badgeRepository: require('../../infrastructure/repositories/badge-repository'),
  campaignCollectiveResultRepository: require('../../infrastructure/repositories/campaign-collective-result-repository'),
  campaignParticipationRepository: require('../../infrastructure/repositories/campaign-participation-repository'),
  campaignParticipationResultRepository: require('../../infrastructure/repositories/campaign-participation-result-repository'),
  campaignRepository: require('../../infrastructure/repositories/campaign-repository'),
  certificationCandidatesOdsService: require('../../domain/services/certification-candidates-ods-service'),
  certificationsOdsService: require('../../domain/services/certifications-ods-service'),
  campaignCsvExportService: require('../../domain/services/campaign-csv-export-service'),
  certificationCandidateRepository: require('../../infrastructure/repositories/certification-candidate-repository'),
  certificationReportRepository: require('../../infrastructure/repositories/certification-report-repository'),
  certificationChallengesService: require('../../domain/services/certification-challenges-service'),
  certificationCenterRepository: require('../../infrastructure/repositories/certification-center-repository'),
  certificationCenterMembershipRepository: require('../../infrastructure/repositories/certification-center-membership-repository'),
  certificationChallengeRepository: require('../../infrastructure/repositories/certification-challenge-repository'),
  certificationPartnerAcquisitionRepository: require('../../infrastructure/repositories/certification-partner-acquisition-repository'),
  certificationCourseRepository: require('../../infrastructure/repositories/certification-course-repository'),
  certificationRepository: require('../../infrastructure/repositories/certification-repository'),
  challengeRepository: require('../../infrastructure/repositories/challenge-repository'),
  competenceEvaluationRepository: require('../../infrastructure/repositories/competence-evaluation-repository'),
  competenceMarkRepository: require('../../infrastructure/repositories/competence-mark-repository'),
  competenceRepository: require('../../infrastructure/repositories/competence-repository'),
  competenceTreeRepository: require('../../infrastructure/repositories/competence-tree-repository'),
  correctionRepository: require('../../infrastructure/repositories/correction-repository'),
  courseRepository: require('../../infrastructure/repositories/course-repository'),
  encryptionService: require('../../domain/services/encryption-service'),
  improvementService: require('../../domain/services/improvement-service'),
  knowledgeElementRepository: require('../../infrastructure/repositories/knowledge-element-repository'),
  mailService: require('../../domain/services/mail-service'),
  membershipRepository: require('../../infrastructure/repositories/membership-repository'),
  organizationService: require('../../domain/services/organization-service'),
  organizationRepository: require('../../infrastructure/repositories/organization-repository'),
  organizationInvitationRepository: require('../../infrastructure/repositories/organization-invitation-repository'),
  pickChallengeService: require('../services/pick-challenge-service'),
  resetPasswordService: require('../../domain/services/reset-password-service'),
  reCaptchaValidator: require('../../infrastructure/validators/grecaptcha-validator'),
  scoringCertificationService: require('../../domain/services/scoring/scoring-certification-service'),
  scorecardService: require('../../domain/services/scorecard-service'),
  settings: require('../../config'),
  skillRepository: require('../../infrastructure/repositories/skill-repository'),
  smartPlacementAssessmentRepository: require('../../infrastructure/repositories/smart-placement-assessment-repository'),
  sessionAuthorizationService: require('../../domain/services/session-authorization-service'),
  sessionRepository: require('../../infrastructure/repositories/session-repository'),
  schoolingRegistrationRepository: require('../../infrastructure/repositories/schooling-registration-repository'),
  schoolingRegistrationsXmlService: require('../../domain/services/schooling-registrations-xml-service'),
  targetProfileRepository: require('../../infrastructure/repositories/target-profile-repository'),
  targetProfileShareRepository: require('../../infrastructure/repositories/target-profile-share-repository'),
  tokenService: require('../../domain/services/token-service'),
  tubeRepository: require('../../infrastructure/repositories/tube-repository'),
  tutorialRepository: require('../../infrastructure/repositories/tutorial-repository'),
  userOrgaSettingsRepository: require('../../infrastructure/repositories/user-orga-settings-repository'),
  userReconciliationService: require('../services/user-reconciliation-service'),
  userRepository: require('../../infrastructure/repositories/user-repository'),
  userService: require('../../domain/services/user-service'),
  userTutorialRepository: require('../../infrastructure/repositories/user-tutorial-repository'),
};

module.exports = injectDependencies({
  acceptPixCertifTermsOfService: require('./accept-pix-certif-terms-of-service'),
  acceptPixOrgaTermsOfService: require('./accept-pix-orga-terms-of-service'),
  addCertificationCandidateToSession: require('./add-certification-candidate-to-session'),
  addTutorialToUser: require('./add-tutorial-to-user'),
  analyzeAttendanceSheet: require('./analyze-attendance-sheet'),
  answerToOrganizationInvitation: require('./answer-to-organization-invitation'),
  attachTargetProfilesToOrganization: require('./attach-target-profiles-to-organization'),
  archiveCampaign: require('./archive-campaign'),
  assignCertificationOfficerToSession: require('./assign-certification-officer-to-session'),
  authenticateUser: require('./authenticate-user'),
  beginCampaignParticipationImprovement: require('./begin-campaign-participation-improvement'),
  completeAssessment: require('./complete-assessment'),
  computeCampaignAnalysis: require('./compute-campaign-analysis'),
  computeCampaignCollectiveResult: require('./compute-campaign-collective-result'),
  computeCampaignParticipationAnalysis: require('./compute-campaign-participation-analysis'),
  correctAnswerThenUpdateAssessment: require('./correct-answer-then-update-assessment'),
  createAndAssociateUserToSchoolingRegistration: require('./create-and-associate-user-to-schooling-registration'),
  createAssessmentForCampaign: require('./create-assessment-for-campaign'),
  createCampaign: require('./create-campaign'),
  createCertificationCenterMembership: require('./create-certification-center-membership'),
  createMembership: require('./create-membership'),
  createOrganization: require('./create-organization'),
  createOrganizationInvitations: require('./create-organization-invitations'),
  createSession: require('./create-session'),
  createUser: require('./create-user'),
  createUserOrgaSettings: require('./create-user-orga-settings'),
  deleteUnlinkedCertificationCandidate: require('./delete-unlinked-certification-candidate'),
  finalizeSession: require('./finalize-session'),
  findAnswerByChallengeAndAssessment: require('./find-answer-by-challenge-and-assessment'),
  findAnswerByAssessment: require('./find-answer-by-assessment'),
  findAssociationBetweenUserAndSchoolingRegistration: require('./find-association-between-user-and-schooling-registration'),
  findCampaignParticipationsRelatedToAssessment: require('./find-campaign-participations-related-to-assessment'),
  findCampaignParticipationsWithResults: require('./find-campaign-participations-with-results'),
  findCompetenceEvaluations: require('./find-competence-evaluations'),
  findCompletedUserCertifications: require('./find-completed-user-certifications'),
  findLatestOngoingUserCampaignParticipations: require('./find-latest-ongoing-user-campaign-participations'),
  findPaginatedFilteredCertificationCenters: require('./find-paginated-filtered-certification-centers'),
  findPaginatedFilteredOrganizationCampaigns: require('./find-paginated-filtered-organization-campaigns'),
  findPaginatedFilteredOrganizations: require('./find-paginated-filtered-organizations'),
  findPaginatedFilteredSessions: require('./find-paginated-filtered-sessions'),
  findPaginatedFilteredUsers: require('./find-paginated-filtered-users'),
  findPendingOrganizationInvitations: require('./find-pending-organization-invitations'),
  findSessionsForCertificationCenter: require('./find-sessions-for-certification-center'),
  findSmartPlacementAssessments: require('./find-smart-placement-assessments'),
  findTutorials: require('./find-tutorials'),
  findUserTutorials: require('./find-user-tutorials'),
  findUserWithSchoolingRegistrations: require('./find-user-with-schooling-registrations'),
  flagSessionResultsAsSentToPrescriber: require('./flag-session-results-as-sent-to-prescriber'),
  generateUsername: require('./generate-username'),
  getAnswer: require('./get-answer'),
  getAssessment: require('./get-assessment'),
  getAttendanceSheet: require('./get-attendance-sheet'),
  getCampaign: require('./get-campaign'),
  getCampaignParticipation: require('./get-campaign-participation'),
  getCampaignParticipationResult: require('./get-campaign-participation-result'),
  getCampaignReport: require('./get-campaign-report'),
  getCertificationCenter: require('./get-certification-center'),
  getCertificationCourse: require('./get-certification-course'),
  getCorrectionForAnswer: require('./get-correction-for-answer'),
  getCurrentUser: require('./get-current-user'),
  getNextChallengeForCertification: require('./get-next-challenge-for-certification'),
  getNextChallengeForCompetenceEvaluation: require('./get-next-challenge-for-competence-evaluation'),
  getNextChallengeForDemo: require('./get-next-challenge-for-demo'),
  getNextChallengeForPreview: require('./get-next-challenge-for-preview'),
  getNextChallengeForSmartPlacement: require('./get-next-challenge-for-smart-placement'),
  getOrCreateSamlUser: require('./get-or-create-saml-user'),
  getOrganizationDetails: require('./get-organization-details'),
  getOrganizationInvitation: require('./get-organization-invitation'),
  getOrganizationMemberships: require('./get-organization-memberships'),
  getProgression: require('./get-progression'),
  getScorecard: require('./get-scorecard'),
  getSession: require('./get-session'),
  getSessionCertificationCandidates: require('./get-session-certification-candidates'),
  getSessionCertificationReports: require('./get-session-certification-reports'),
  getSessionCertifications: require('./get-session-certifications'),
  getUserCampaignParticipationToCampaign: require('./get-user-campaign-participation-to-campaign'),
  getUserCertificationCenterMemberships: require('./get-user-certification-center-memberships'),
  getUserCertificationWithResultTree: require('./get-user-certification-with-result-tree'),
  getUserCurrentCertificationProfile: require('./get-user-current-certification-profile'),
  getUserDetailForAdmin: require('./get-user-detail-for-admin'),
  getUserPixScore: require('./get-user-pix-score'),
  getUserScorecards: require('./get-user-scorecards'),
  getUserWithMemberships: require('./get-user-with-memberships'),
  getUserWithOrgaSettings: require('./get-user-with-orga-settings'),
  importCertificationCandidatesFromAttendanceSheet: require('./import-certification-candidates-from-attendance-sheet'),
  importSchoolingRegistrationsFromSIECLE: require('./import-schooling-registrations-from-siecle'),
  linkUserToSchoolingRegistrationData: require('./link-user-to-schooling-registration-data'),
  linkUserToSessionCertificationCandidate: require('./link-user-to-session-certification-candidate'),
  rememberUserHasSeenAssessmentInstructions: require('./remember-user-has-seen-assessment-instructions'),
  resetScorecard: require('./reset-scorecard'),
  retrieveCampaignInformation: require('./retrieve-campaign-information'),
  retrieveLastOrCreateCertificationCourse: require('./retrieve-last-or-create-certification-course'),
  saveCertificationCenter: require('./save-certification-center'),
  shareCampaignResult: require('./share-campaign-result'),
  startCampaignParticipation: require('./start-campaign-participation'),
  startOrResumeCompetenceEvaluation: require('./start-or-resume-competence-evaluation'),
  startWritingCampaignAssessmentResultsToStream: require('./start-writing-campaign-assessment-results-to-stream'),
  startWritingCampaignProfilesCollectionResultsToStream: require('./start-writing-campaign-profiles-collection-results-to-stream'),
  unarchiveCampaign: require('./unarchive-campaign'),
  updateCampaign: require('./update-campaign'),
  updateExpiredPassword: require('./update-expired-password'),
  updateMembershipRole: require('./update-membership-role'),
  updateOrganizationInformation: require('./update-organization-information'),
  updatePublicationSession: require('./update-publication-session'),
  updateSession: require('./update-session'),
  updateSchoolingRegistrationDependentUserPassword: require('./update-schooling-registration-dependent-user-password'),
  updateUserOrgaSettings: require('./update-user-orga-settings'),
  updateUserPassword: require('./update-user-password')
}, dependencies);
