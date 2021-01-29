const buildAssessment = require('./build-assessment');
const buildCampaignParticipation = require('./build-campaign-participation');
const Assessment = require('../../../lib/domain/models/Assessment');

const _ = require('lodash');

module.exports = {
  build({
    userId,
    createdAt,
    sharedAt,
    assessmentCreatedAt,
    assessmentState,
    campaignId,
    id,
  } = {}) {

    const campaignParticipation = buildCampaignParticipation({
      userId,
      campaignId,
      createdAt: createdAt,
      sharedAt: sharedAt,
      isShared: sharedAt ? true : false,
    });

    buildAssessment({
      id,
      userId,
      campaignParticipationId: campaignParticipation.id,
      state: assessmentState,
      createdAt: assessmentCreatedAt,
    });

    return campaignParticipation;
  },

  buildOnGoing({
    userId,
    createdAt,
    assessmentCreatedAt,
  } = {}) {

    const campaignParticipation = buildCampaignParticipation({
      userId,
      createdAt: createdAt,
      sharedAt: null,
      isShared: false,
    });

    buildAssessment({
      userId,
      campaignParticipationId: campaignParticipation.id,
      state: Assessment.states.STARTED,
      createdAt: assessmentCreatedAt,
    });

    return campaignParticipation;
  },

  buildToShare({
    userId,
    createdAt,
    assessmentCreatedAt,
  } = {}) {

    const campaignParticipation = buildCampaignParticipation({
      userId,
      createdAt: createdAt,
      sharedAt: null,
      isShared: false,
    });

    buildAssessment({
      userId,
      campaignParticipationId: campaignParticipation.id,
      state: Assessment.states.COMPLETED,
      createdAt: assessmentCreatedAt,
    });

    return campaignParticipation;
  },

  buildEnded({
    userId,
    createdAt,
    sharedAt,
    assessmentCreatedAt,
  } = {}) {

    const campaignParticipation = buildCampaignParticipation({
      userId,
      createdAt: createdAt,
      sharedAt: sharedAt || createdAt,
      isShared: true,
    });

    buildAssessment({
      userId,
      campaignParticipationId: campaignParticipation.id,
      state: Assessment.states.COMPLETED,
      createdAt: assessmentCreatedAt,
    });

    return campaignParticipation;
  },
};

