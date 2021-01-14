const Assessment = require('../../../../lib/domain/models/Assessment');
const { buildValidatedPublishedCertificationData, buildErrorUnpublishedCertificationData, buildRejectedPublishedCertificationData } = require('./builderHelper');
const faker = require('faker');
const times = require('lodash/times');

function _generateValidatedPublishedCertifData(databaseBuilder, organizationId, type, sessionId) {
  buildValidatedPublishedCertificationData({
    databaseBuilder,
    organizationId,
    validationCode: null,
    type,
    pixScore: faker.random.number(300, 600),
    sessionId,
    competenceMarks: _generateCompetenceMarks(),
  });
}

function _generateRejectedPublishedCertifData(databaseBuilder, organizationId, type, sessionId) {
  buildRejectedPublishedCertificationData({
    databaseBuilder,
    organizationId,
    validationCode: null,
    type,
    pixScore: faker.random.number(0, 500),
    sessionId,
    competenceMarks: _generateCompetenceMarks(),
  });
}

function _generateUnpublishedCertifData(databaseBuilder, organizationId, type, sessionId) {
  buildErrorUnpublishedCertificationData({
    databaseBuilder,
    organizationId,
    validationCode: null,
    type,
    pixScore: faker.random.number(0, 500),
    sessionId,
    competenceMarks: _generateCompetenceMarks(),
  });
}

function generateCertifs(count, chunkSize, generator, databaseBuilder, organizationId, type, certificationCenter) {
  const chunks = count / chunkSize ;
  times(chunkSize, () => {
    const session = databaseBuilder.factory.buildSession({
      certificationCenterId: certificationCenter.id,
      certificationCenter: certificationCenter.name,
      publishedAt: new Date('2020-02-21T14:23:56Z'),
    });

    times(chunks, () => generator(databaseBuilder, organizationId, type, session.id));
  });
}

module.exports = function livretScolaireCertificationBuilder({ databaseBuilder }) {
  {
    const NB_VALIDATED = 1500;
    const NB_REJECTED = 1500;
    const NB_UNPUBLISHED = 1500;
    const chunkSize = 25;
    const uai = '0070029U';
    const { id: organizationId } = databaseBuilder.factory.buildOrganization({ externalId: uai, type: 'SCO' });
    const certificationCenter = databaseBuilder.factory.buildCertificationCenter({ name: 'Certif College' });
    const type = Assessment.types.CERTIFICATION;

    generateCertifs(NB_VALIDATED, chunkSize, _generateValidatedPublishedCertifData, databaseBuilder, organizationId, type, certificationCenter);
    generateCertifs(NB_REJECTED, chunkSize, _generateRejectedPublishedCertifData, databaseBuilder, organizationId, type, certificationCenter);
    generateCertifs(NB_UNPUBLISHED, chunkSize, _generateUnpublishedCertifData, databaseBuilder, organizationId, type, certificationCenter);
  }
  {
    const NB_VALIDATED = 1;
    const NB_REJECTED = 1;
    const NB_UNPUBLISHED = 1;
    const chunkSize = 1;
    const uai = '0382495F';
    const { id: organizationId } = databaseBuilder.factory.buildOrganization({ externalId: uai, type: 'SCO' });
    const certificationCenter = databaseBuilder.factory.buildCertificationCenter({ name: 'Certif College' });
    const type = Assessment.types.CERTIFICATION;

    generateCertifs(NB_VALIDATED, chunkSize, _generateValidatedPublishedCertifData, databaseBuilder, organizationId, type, certificationCenter);
    generateCertifs(NB_REJECTED, chunkSize, _generateRejectedPublishedCertifData, databaseBuilder, organizationId, type, certificationCenter);
    generateCertifs(NB_UNPUBLISHED, chunkSize, _generateUnpublishedCertifData, databaseBuilder, organizationId, type, certificationCenter);
  }
};

function _generateCompetenceMarks() {
  return [
    { code: '1.1', level: faker.random.number(1, 6) },
    { code: '1.2', level: faker.random.number(1, 6) },
    { code: '1.3', level: faker.random.number(1, 6) },
    { code: '2.1', level: faker.random.number(1, 6) },
    { code: '2.2', level: faker.random.number(1, 6) },
    { code: '2.3', level: faker.random.number(1, 6) },
    { code: '2.4', level: faker.random.number(1, 6) },
    { code: '3.1', level: faker.random.number(1, 6) },
    { code: '3.2', level: faker.random.number(1, 6) },
    { code: '3.3', level: faker.random.number(1, 6) },
    { code: '3.4', level: faker.random.number(1, 6) },
    { code: '4.1', level: faker.random.number(1, 6) },
    { code: '4.2', level: faker.random.number(1, 6) },
    { code: '4.3', level: faker.random.number(1, 6) },
    { code: '5.1', level: faker.random.number(1, 6) },
    { code: '5.2', level: faker.random.number(1, 6) },
  ];
}
