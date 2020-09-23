const { PassThrough } = require('stream');
const { expect, sinon, domainBuilder, streamToPromise, catchErr } = require('../../../test-helper');
const startWritingCampaignAssessmentResultsToStream = require('../../../../lib/domain/usecases/start-writing-campaign-assessment-results-to-stream');
const { UserNotAuthorizedToGetCampaignResultsError } = require('../../../../lib/domain/errors');
const campaignCsvExportService = require('../../../../lib/domain/services/campaign-csv-export-service');

describe('Unit | Domain | Use Cases | start-writing-campaign-assessment-results-to-stream', () => {
  const campaignRepository = { get: () => undefined };
  const userRepository = { getWithMemberships: () => undefined };
  const targetProfileWithLearningContentRepository = { get: () => undefined };
  const organizationRepository = { get: () => undefined };
  const campaignParticipationInfoRepository = { findByCampaignId: () => undefined };
  const knowledgeElementRepository = { findTargetedGroupedByCompetencesForUsers: () => undefined };
  let writableStream;
  let csvPromise;

  beforeEach(() => {
    writableStream = new PassThrough();
    csvPromise = streamToPromise(writableStream);
  });

  it('should throw a UserNotAuthorizedToGetCampaignResultsError when user is not authorized', async () => {
    // given
    const notAuthorizedUser = domainBuilder.buildUser({ memberships: [] });
    const campaign = domainBuilder.buildCampaign();
    sinon.stub(campaignRepository, 'get').withArgs(campaign.id).resolves(campaign);
    sinon.stub(userRepository, 'getWithMemberships').withArgs(notAuthorizedUser.id).resolves(notAuthorizedUser);
    sinon.stub(targetProfileWithLearningContentRepository, 'get').rejects();
    sinon.stub(organizationRepository, 'get').rejects();
    sinon.stub(campaignParticipationInfoRepository, 'findByCampaignId').rejects();
    sinon.stub(knowledgeElementRepository, 'findTargetedGroupedByCompetencesForUsers').rejects();

    // when
    const err = await catchErr(startWritingCampaignAssessmentResultsToStream)({
      userId: notAuthorizedUser.id,
      campaignId: campaign.id,
      writableStream,
      campaignRepository,
      userRepository,
      targetProfileWithLearningContentRepository,
      organizationRepository,
      campaignParticipationInfoRepository,
      knowledgeElementRepository,
      campaignCsvExportService,
    });

    // then
    expect(err).to.be.instanceOf(UserNotAuthorizedToGetCampaignResultsError);
    expect(err.message).to.equal(`User does not have an access to the organization ${campaign.organizationId}`);
  });

  it('should return common parts of header with appropriate info', async () => {
    // given
    const { user, campaign, organization } = _buildOrganizationAndUserWithMembershipAndCampaign();
    const skill1_1_1 = domainBuilder.buildTargetedSkill({ id: 'skill1_1_1', tubeId: 'tube1', name: '@acquis1' });
    const skill2_1_1 = domainBuilder.buildTargetedSkill({ id: 'skill2_1_1', tubeId: 'tube3', name: '@acquis2' });
    const tube1 = domainBuilder.buildTargetedTube({ id: 'tube1', skills: [skill1_1_1], competenceId: 'comp1_1' });
    const tube2 = domainBuilder.buildTargetedTube({ id: 'tube3', skills: [skill2_1_1], competenceId: 'comp2_1' });
    const competence1_1 = domainBuilder.buildTargetedCompetence({ id: 'comp1_1', tubes: [tube1], areaId: 'area1' });
    const competence2_1 = domainBuilder.buildTargetedCompetence({ id: 'comp2_1', tubes: [tube2], areaId: 'area2' });
    const area1 = domainBuilder.buildTargetedArea({ id: 'area1', competences: [competence1_1] });
    const area2 = domainBuilder.buildTargetedArea({ id: 'area2', competences: [competence2_1] });
    const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
      skills: [skill1_1_1, skill2_1_1],
      tubes: [tube1, tube2],
      competences: [competence1_1, competence2_1],
      areas: [area2, area1],
    });
    campaign.targetProfileId = targetProfile.id;
    sinon.stub(campaignRepository, 'get').withArgs(campaign.id).resolves(campaign);
    sinon.stub(userRepository, 'getWithMemberships').withArgs(user.id).resolves(user);
    sinon.stub(organizationRepository, 'get').withArgs(campaign.organizationId).resolves(organization);
    sinon.stub(targetProfileWithLearningContentRepository, 'get').withArgs({ id: campaign.targetProfileId }).resolves(targetProfile);
    sinon.stub(campaignParticipationInfoRepository, 'findByCampaignId').withArgs(campaign.id).resolves([]);
    sinon.stub(knowledgeElementRepository, 'findTargetedGroupedByCompetencesForUsers').rejects();
    const csvExpected = '\uFEFF"Nom de l\'organisation";' +
      '"ID Campagne";' +
      '"Nom de la campagne";' +
      '"Nom du Profil Cible";' +
      '"Nom du Participant";' +
      '"Prénom du Participant";' +
      '"% de progression";' +
      '"Date de début";' +
      '"Partage (O/N)";' +
      '"Date du partage";' +
      '"% maitrise de l\'ensemble des acquis du profil";' +
      `"% de maitrise des acquis de la compétence ${competence1_1.name}";` +
      `"Nombre d'acquis du profil cible dans la compétence ${competence1_1.name}";` +
      `"Acquis maitrisés dans la compétence ${competence1_1.name}";` +
      `"% de maitrise des acquis de la compétence ${competence2_1.name}";` +
      `"Nombre d'acquis du profil cible dans la compétence ${competence2_1.name}";` +
      `"Acquis maitrisés dans la compétence ${competence2_1.name}";` +
      `"% de maitrise des acquis du domaine ${area1.title}";` +
      `"Nombre d'acquis du profil cible du domaine ${area1.title}";` +
      `"Acquis maitrisés du domaine ${area1.title}";` +
      `"% de maitrise des acquis du domaine ${area2.title}";` +
      `"Nombre d'acquis du profil cible du domaine ${area2.title}";` +
      `"Acquis maitrisés du domaine ${area2.title}";` +
      `"'${skill1_1_1.name}";` +
      `"'${skill2_1_1.name}"\n`;

    // when
    startWritingCampaignAssessmentResultsToStream({
      userId: user.id,
      campaignId: campaign.id,
      writableStream,
      campaignRepository,
      userRepository,
      targetProfileWithLearningContentRepository,
      organizationRepository,
      campaignParticipationInfoRepository,
      knowledgeElementRepository,
      campaignCsvExportService,
    });
    const csv = await csvPromise;

    // then
    expect(csv).to.equal(csvExpected);
  });

  it('should contains idPixLabel in header if any setup in campaign', async () => {
    // given
    const idPixLabel = 'Numéro de carte bleue';
    const { user, campaign, organization } = _buildOrganizationAndUserWithMembershipAndCampaign({ idPixLabel });
    const skill = domainBuilder.buildTargetedSkill({ id: 'skill', tubeId: 'tube' });
    const tube = domainBuilder.buildTargetedTube({ id: 'tube', skills: [skill], competenceId: 'comp' });
    const competence = domainBuilder.buildTargetedCompetence({ id: 'comp', tubes: [tube], areaId: 'area' });
    const area = domainBuilder.buildTargetedArea({ id: 'area', competences: [competence] });
    const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
      skills: [skill],
      tubes: [tube],
      competences: [competence],
      areas: [area],
    });
    campaign.targetProfileId = targetProfile.id;
    sinon.stub(campaignRepository, 'get').withArgs(campaign.id).resolves(campaign);
    sinon.stub(userRepository, 'getWithMemberships').withArgs(user.id).resolves(user);
    sinon.stub(organizationRepository, 'get').withArgs(campaign.organizationId).resolves(organization);
    sinon.stub(targetProfileWithLearningContentRepository, 'get').withArgs({ id: campaign.targetProfileId }).resolves(targetProfile);
    sinon.stub(campaignParticipationInfoRepository, 'findByCampaignId').withArgs(campaign.id).resolves([]);
    sinon.stub(knowledgeElementRepository, 'findTargetedGroupedByCompetencesForUsers').rejects();
    const csvExpected = '\uFEFF"Nom de l\'organisation";' +
      '"ID Campagne";' +
      '"Nom de la campagne";' +
      '"Nom du Profil Cible";' +
      '"Nom du Participant";' +
      '"Prénom du Participant";' +
      `"${idPixLabel}";` +
      '"% de progression";' +
      '"Date de début";' +
      '"Partage (O/N)";' +
      '"Date du partage";' +
      '"% maitrise de l\'ensemble des acquis du profil";' +
      `"% de maitrise des acquis de la compétence ${competence.name}";` +
      `"Nombre d'acquis du profil cible dans la compétence ${competence.name}";` +
      `"Acquis maitrisés dans la compétence ${competence.name}";` +
      `"% de maitrise des acquis du domaine ${area.title}";` +
      `"Nombre d'acquis du profil cible du domaine ${area.title}";` +
      `"Acquis maitrisés du domaine ${area.title}";` +
      `"${skill.name}"\n`;

    // when
    startWritingCampaignAssessmentResultsToStream({
      userId: user.id,
      campaignId: campaign.id,
      writableStream,
      campaignRepository,
      userRepository,
      targetProfileWithLearningContentRepository,
      organizationRepository,
      campaignParticipationInfoRepository,
      knowledgeElementRepository,
      campaignCsvExportService,
    });
    const csv = await csvPromise;

    // then
    expect(csv).to.equal(csvExpected);
  });

  it('should contains Numéro Étudiant header when orga is SUP and managing students', async () => {
    // given
    const { user, campaign, organization } = _buildOrganizationAndUserWithMembershipAndCampaign({ isManagingStudents: true, type: 'SUP' });
    const skill = domainBuilder.buildTargetedSkill({ id: 'skill', tubeId: 'tube' });
    const tube = domainBuilder.buildTargetedTube({ id: 'tube', skills: [skill], competenceId: 'comp' });
    const competence = domainBuilder.buildTargetedCompetence({ id: 'comp', tubes: [tube], areaId: 'area' });
    const area = domainBuilder.buildTargetedArea({ id: 'area', competences: [competence] });
    const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
      skills: [skill],
      tubes: [tube],
      competences: [competence],
      areas: [area],
    });
    campaign.targetProfileId = targetProfile.id;
    sinon.stub(campaignRepository, 'get').withArgs(campaign.id).resolves(campaign);
    sinon.stub(userRepository, 'getWithMemberships').withArgs(user.id).resolves(user);
    sinon.stub(organizationRepository, 'get').withArgs(campaign.organizationId).resolves(organization);
    sinon.stub(targetProfileWithLearningContentRepository, 'get').withArgs({ id: campaign.targetProfileId }).resolves(targetProfile);
    sinon.stub(campaignParticipationInfoRepository, 'findByCampaignId').withArgs(campaign.id).resolves([]);
    sinon.stub(knowledgeElementRepository, 'findTargetedGroupedByCompetencesForUsers').rejects();
    const csvExpected = '\uFEFF"Nom de l\'organisation";' +
      '"ID Campagne";' +
      '"Nom de la campagne";' +
      '"Nom du Profil Cible";' +
      '"Nom du Participant";' +
      '"Prénom du Participant";' +
      '"Numéro Étudiant";' +
      '"% de progression";' +
      '"Date de début";' +
      '"Partage (O/N)";' +
      '"Date du partage";' +
      '"% maitrise de l\'ensemble des acquis du profil";' +
      `"% de maitrise des acquis de la compétence ${competence.name}";` +
      `"Nombre d'acquis du profil cible dans la compétence ${competence.name}";` +
      `"Acquis maitrisés dans la compétence ${competence.name}";` +
      `"% de maitrise des acquis du domaine ${area.title}";` +
      `"Nombre d'acquis du profil cible du domaine ${area.title}";` +
      `"Acquis maitrisés du domaine ${area.title}";` +
      `"${skill.name}"\n`;

    // when
    startWritingCampaignAssessmentResultsToStream({
      userId: user.id,
      campaignId: campaign.id,
      writableStream,
      campaignRepository,
      userRepository,
      targetProfileWithLearningContentRepository,
      organizationRepository,
      campaignParticipationInfoRepository,
      knowledgeElementRepository,
      campaignCsvExportService,
    });
    const csv = await csvPromise;

    // then
    expect(csv).to.equal(csvExpected);
  });

  it('should process result for each participation and add it to csv', async () => {
    // given
    const { user: admin, campaign, organization } = _buildOrganizationAndUserWithMembershipAndCampaign();
    const skill = domainBuilder.buildTargetedSkill({ id: 'skill', tubeId: 'tube' });
    const tube = domainBuilder.buildTargetedTube({ id: 'tube', skills: [skill], competenceId: 'comp' });
    const competence = domainBuilder.buildTargetedCompetence({ id: 'comp', tubes: [tube], areaId: 'area' });
    const area = domainBuilder.buildTargetedArea({ id: 'area', competences: [competence] });
    const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
      skills: [skill],
      tubes: [tube],
      competences: [competence],
      areas: [area],
    });
    const participantInfo = domainBuilder.buildCampaignParticipationInfo({ createdAt: new Date('2020-01-01'), sharedAt: new Date('2020-02-01') });
    const knowledgeElement = domainBuilder.buildKnowledgeElement({
      status: 'validated',
      skillId: skill.id,
      competenceId: competence.id,
    });
    campaign.targetProfileId = targetProfile.id;
    sinon.stub(campaignRepository, 'get').withArgs(campaign.id).resolves(campaign);
    sinon.stub(userRepository, 'getWithMemberships').withArgs(admin.id).resolves(admin);
    sinon.stub(organizationRepository, 'get').withArgs(campaign.organizationId).resolves(organization);
    sinon.stub(targetProfileWithLearningContentRepository, 'get').withArgs({ id: campaign.targetProfileId }).resolves(targetProfile);
    sinon.stub(campaignParticipationInfoRepository, 'findByCampaignId').withArgs(campaign.id).resolves([participantInfo]);
    sinon.stub(knowledgeElementRepository, 'findTargetedGroupedByCompetencesForUsers').resolves({
      [participantInfo.userId] : {
        [competence.id] : [knowledgeElement],
      },
    });
    const csvHeaderExpected = '\uFEFF"Nom de l\'organisation";' +
      '"ID Campagne";' +
      '"Nom de la campagne";' +
      '"Nom du Profil Cible";' +
      '"Nom du Participant";' +
      '"Prénom du Participant";' +
      '"% de progression";' +
      '"Date de début";' +
      '"Partage (O/N)";' +
      '"Date du partage";' +
      '"% maitrise de l\'ensemble des acquis du profil";' +
      `"% de maitrise des acquis de la compétence ${competence.name}";` +
      `"Nombre d'acquis du profil cible dans la compétence ${competence.name}";` +
      `"Acquis maitrisés dans la compétence ${competence.name}";` +
      `"% de maitrise des acquis du domaine ${area.title}";` +
      `"Nombre d'acquis du profil cible du domaine ${area.title}";` +
      `"Acquis maitrisés du domaine ${area.title}";` +
      `"${skill.name}"`;
    const csvParticipantResultExpected = `"${organization.name}";` +
      `${campaign.id};` +
      `"${campaign.name}";` +
      `"${targetProfile.name}";` +
      `"${participantInfo.participantLastName}";` +
      `"${participantInfo.participantFirstName}";` +
      '1;' +
      '2020-01-01;' +
      '"Oui";' +
      '2020-02-01;' +
      '1;' +
      '1;' +
      '1;' +
      '1;' +
      '1;' +
      '1;' +
      '1;' +
      '"OK"';

    // when
    startWritingCampaignAssessmentResultsToStream({
      userId: admin.id,
      campaignId: campaign.id,
      writableStream,
      campaignRepository,
      userRepository,
      targetProfileWithLearningContentRepository,
      organizationRepository,
      campaignParticipationInfoRepository,
      knowledgeElementRepository,
      campaignCsvExportService,
    });
    const csv = await csvPromise;

    // then
    const csvLines = csv.split('\n');

    // then
    expect(csvLines).to.have.length(3);
    expect(csvLines[0]).equal(csvHeaderExpected);
    expect(csvLines[1]).equal(csvParticipantResultExpected);
    expect(csvLines[2]).equal('');
  });

});

function _buildOrganizationAndUserWithMembershipAndCampaign({ idPixLabel = null, type = 'SCO', isManagingStudents = false } = {}) {
  const organization = domainBuilder.buildOrganization({ type, isManagingStudents });
  const user = domainBuilder.buildUser();
  const membership = domainBuilder.buildMembership({ user, organization });
  user.memberships = [membership];
  const campaign = domainBuilder.buildCampaign({ organizationId: organization.id, idPixLabel });

  return {
    user,
    campaign,
    organization,
  };
}
