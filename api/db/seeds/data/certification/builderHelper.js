const { status } = require('../../../../lib/domain/models/AssessmentResult');

function _createUser(databaseBuilder) {
  return databaseBuilder.factory.buildUser();
}

function _createSchoolingRegistration(databaseBuilder, userId, organizationId, student) {
  return databaseBuilder.factory.buildSchoolingRegistration(
    { userId, organizationId, ...student },
  );
}

function _buildCertificationData({ databaseBuilder, organizationId, isPublished, status, verificationCode, type, pixScore, sessionId, competenceMarks = [{}, {}], student }) {
  const userId = _createUser(databaseBuilder).id;

  const schoolingRegistration = _createSchoolingRegistration(databaseBuilder, userId, organizationId, student);

  const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
    userId,
    sessionId,
    isPublished,
    verificationCode,
  });

  databaseBuilder.factory.buildCertificationCourse({
    userId,
    sessionId: sessionId,
    isPublished: false,
  });

  const assessment = databaseBuilder.factory.buildAssessment({
    certificationCourseId: certificationCourse.id,
    userId,
    type,
  });

  const createdDate = new Date('2020-04-19');
  const beforeCreatedDate = new Date('2020-04-18');
  const beforeBeforeCreatedDate = new Date('2020-04-17');

  const assessmentResult = _createAssessmentResultWithCompetenceMarks({
    databaseBuilder,
    assessmentId: assessment.id,
    pixScore,
    status,
    createdAt: createdDate,
    competenceMarks,
  });

  _createAssessmentResultWithCompetenceMarks({
    databaseBuilder,
    assessmentId: assessment.id,
    pixScore,
    status,
    createdAt: beforeCreatedDate,
    competenceMarks: [{}, {}],
  });

  databaseBuilder.factory.buildAssessmentResult({
    assessmentId: assessment.id,
    pixScore,
    status,
    createdAt: beforeBeforeCreatedDate,
  });

  return {
    schoolingRegistration,
    certificationCourse,
    assessmentResult,
    competenceMarks: assessmentResult.competenceMarks,
  };
}

function _createAssessmentResultWithCompetenceMarks({
  databaseBuilder,
  assessmentId,
  pixScore,
  status,
  createdAt,
  competenceMarks,
}) {
  const assessmentResult = databaseBuilder.factory.buildAssessmentResult({
    assessmentId,
    pixScore,
    status,
    createdAt,
  });

  const createdCompetenceMarks = competenceMarks.forEach((cm) => {
    return databaseBuilder.factory.buildCompetenceMark({
      assessmentResultId: assessmentResult.id,
      competence_code: cm.code,
      level: cm.level,
    });
  });

  return { assessmentResult, competenceMarks: createdCompetenceMarks };
}

const buildValidatedPublishedCertificationData = function({ databaseBuilder, organizationId, verificationCode, type, pixScore, sessionId, competenceMarks, student }) {

  return _buildCertificationData({
    databaseBuilder,
    organizationId,
    verificationCode,
    type,
    pixScore,
    isPublished: true,
    status: status.VALIDATED,
    competenceMarks,
    sessionId,
    student,
  });
};

const buildRejectedPublishedCertificationData = function({ databaseBuilder, organizationId, verificationCode, type, pixScore, sessionId, student }) {
  return _buildCertificationData({ databaseBuilder, organizationId, verificationCode, type, pixScore, isPublished: true, status: status.REJECTED, sessionId, student });
};

const buildErrorUnpublishedCertificationData = function({ databaseBuilder, organizationId, verificationCode, type, pixScore, sessionId }) {
  return _buildCertificationData({ databaseBuilder, organizationId, verificationCode, type, pixScore, isPublished: false, status: status.ERROR, sessionId });
};

module.exports = {
  buildValidatedPublishedCertificationData,
  buildRejectedPublishedCertificationData,
  buildErrorUnpublishedCertificationData,
};
