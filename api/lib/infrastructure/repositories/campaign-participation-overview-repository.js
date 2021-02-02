// eslint-disable no-restricted-syntax

const { knex } = require('../bookshelf');
const Assessment = require('../../domain/models/Assessment');
const CampaignParticipationOverview = require('../../domain/read-models/CampaignParticipationOverview');
const { fetchPage } = require('../utils/knex-utils');

module.exports = {

  async findByUserIdWithFilters({ userId, states, page }) {
    const queryBuilder = _findByUserId({ userId });

    if (states && states.length > 0) {
      _filterByStates(queryBuilder, states);
    }

    const { results, pagination } = await fetchPage(queryBuilder, page);
    const campaignParticipationOverviews = _toReadModel(results);

    return {
      campaignParticipationOverviews,
      pagination,
    };
  },
};

function _findByUserId({ userId }) {
  return knex
    .with('campaign-participation-overviews', (qb) => {
      qb.select([
        'campaign-participations.id AS id',
        'campaign-participations.createdAt AS createdAt',
        'campaign-participations.isShared AS isShared',
        'campaign-participations.sharedAt AS sharedAt',
        'campaign-participations.validatedSkillsCount AS validatedSkillsCount',
        'campaigns.code AS campaignCode',
        'campaigns.title AS campaignTitle',
        'campaigns.targetProfileId AS targetProfileId',
        'organizations.name AS organizationName',
        'assessments.state AS assessmentState',
        'assessments.createdAt AS assessmentCreatedAt',
        knex.raw(`${_computeCampaignParticipationState()} AS "participationState"`),
      ])
        .from('campaign-participations')
        .innerJoin('campaigns', 'campaign-participations.campaignId', 'campaigns.id')
        .innerJoin('organizations', 'organizations.id', 'campaigns.organizationId')
        .leftJoin('assessments', 'assessments.campaignParticipationId', 'campaign-participations.id')
        .modify(_filterMostRecentAssessments)
        .where('campaign-participations.userId', userId);
    })
    .from('campaign-participation-overviews')
    .orderByRaw(_computeCampaignParticipationOrder())
    .orderBy('sharedAt', 'DESC')
    .orderBy('assessmentCreatedAt', 'DESC');
}

function _computeCampaignParticipationState() {
  return `
  CASE
    WHEN assessments.state = '${Assessment.states.STARTED}'  THEN 'ONGOING'
    WHEN assessments.state = '${Assessment.states.COMPLETED}' AND ("archivedAt" IS NOT NULL OR "isShared" = true) THEN 'ENDED'
    WHEN assessments.state = '${Assessment.states.COMPLETED}' AND "archivedAt" IS NULL THEN 'TO_SHARE'
    ELSE NULL
  END`;
}

function _filterMostRecentAssessments(queryBuilder) {
  queryBuilder
    .leftJoin({ 'newerAssessments': 'assessments' }, function() {
      this.on('newerAssessments.campaignParticipationId', 'campaign-participations.id')
        .andOn('assessments.createdAt', '<', knex.ref('newerAssessments.createdAt'));
    })
    .whereNull('newerAssessments.id');
}

function _computeCampaignParticipationOrder() {
  return `
  CASE
    WHEN "participationState" = 'TO_SHARE' THEN 1
    WHEN "participationState" = 'ONGOING'  THEN 2
    WHEN "participationState" = 'ENDED'    THEN 3
    ELSE NULL
  END`;
}

function _filterByStates(queryBuilder, states) {
  queryBuilder.whereIn('participationState', states);
}

function _toReadModel(campaignParticipationOverviews) {
  return campaignParticipationOverviews.map((data) => {
    return new CampaignParticipationOverview(data);
  });
}
