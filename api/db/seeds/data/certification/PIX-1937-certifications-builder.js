const Assessment = require('../../../../lib/domain/models/Assessment');
const { buildValidatedPublishedCertificationData, buildRejectedPublishedCertificationData } = require('./builderHelper');
const faker = require('faker');
const times = require('lodash/times');
const moment = require('moment');

function _generateValidatedPublishedCertifData(databaseBuilder, organizationId, type, sessionId, student) {
  buildValidatedPublishedCertificationData({
    databaseBuilder,
    organizationId,
    validationCode: null,
    type,
    pixScore: faker.random.number(300, 600),
    sessionId,
    competenceMarks: _generateCompetenceMarks(),
    student,
  });
}

function _generateRejectedPublishedCertifData(databaseBuilder, organizationId, type, sessionId, student) {
  buildRejectedPublishedCertificationData({
    databaseBuilder,
    organizationId,
    validationCode: null,
    type,
    pixScore: faker.random.number(0, 500),
    sessionId,
    competenceMarks: _generateCompetenceMarks(),
    student,
  });
}

function generateCertifs(count, chunkSize, generator, databaseBuilder, organizationId, type, certificationCenter, student) {
  const chunks = count / chunkSize ;
  times(chunkSize, () => {
    const session = databaseBuilder.factory.buildSession({
      certificationCenterId: certificationCenter.id,
      certificationCenter: certificationCenter.name,
      publishedAt: new Date('2020-02-21T14:23:56Z'),
    });

    times(chunks, () => generator(databaseBuilder, organizationId, type, session.id, student));
  });
}

function _generateCertificationsForLSU(databaseBuilder) {
  {
    const NB_VALIDATED = 1;
    const NB_REJECTED = 1;
    const chunkSize = 1;
    const uai = '0070029U';
    const { id: organizationId } = databaseBuilder.factory.buildOrganization({ externalId: uai, type: 'SCO' });
    const certificationCenter = databaseBuilder.factory.buildCertificationCenter({ name: 'Certif College LSU' });
    const type = Assessment.types.CERTIFICATION;

    generateCertifs(NB_VALIDATED, chunkSize, _generateValidatedPublishedCertifData, databaseBuilder, organizationId, type, certificationCenter, { nationalStudentId: '071299654AC' });
    generateCertifs(NB_VALIDATED, chunkSize, _generateValidatedPublishedCertifData, databaseBuilder, organizationId, type, certificationCenter, { nationalStudentId: '050155657DG' });
    generateCertifs(NB_REJECTED, chunkSize, _generateRejectedPublishedCertifData, databaseBuilder, organizationId, type, certificationCenter, { nationalStudentId: '071414935FE' });
  }
}

function _generateCertificationsForLSL(databaseBuilder) {
  {
    const NB_VALIDATED = 1;
    const NB_REJECTED = 1;
    const chunkSize = 1;
    const uai = '0382495F';
    const { id: organizationId } = databaseBuilder.factory.buildOrganization({ externalId: uai, type: 'SCO' });
    const certificationCenter = databaseBuilder.factory.buildCertificationCenter({ name: 'Certif College LSL' });
    const type = Assessment.types.CERTIFICATION;

    const student1 = {
      nationalStudentId: '072169904DG',
      firstName: 'Elisa',
      preferredLastName: '',
      lastName: 'ALESSANDRINI_USAGE',
      middleName: '',
      thirdName: '',
      birthdate: new moment('2005-06-22').format('YYYY-MM-DD'),
    };
    generateCertifs(NB_VALIDATED, chunkSize, _generateValidatedPublishedCertifData, databaseBuilder, organizationId, type, certificationCenter, student1);
    const student2 = {
      nationalStudentId: '080741169HK',
      firstName: 'Nathalie',
      preferredLastName: '',
      lastName: 'ARRIEU-STOICA',
      middleName: 'Aurora',
      thirdName: '',
      birthdate: new moment('2005-06-11').format('YYYY-MM-DD'),
    };
    generateCertifs(NB_VALIDATED, chunkSize, _generateValidatedPublishedCertifData, databaseBuilder, organizationId, type, certificationCenter, student2);
    const student3 = {
      nationalStudentId: '080465891HB',
      firstName: 'Millie',
      preferredLastName: '',
      lastName: 'BARRAUD',
      middleName: 'Maria',
      thirdName: '',
      birthdate: new moment('2005-03-02').format('YYYY-MM-DD'),
    };
    generateCertifs(NB_VALIDATED, chunkSize, _generateValidatedPublishedCertifData, databaseBuilder, organizationId, type, certificationCenter, student3);
    const student4 = {
      nationalStudentId: '080053062GJ',
      firstName: 'Alexandre',
      preferredLastName: '',
      lastName: 'CIRAMI',
      middleName: 'Jérémy',
      thirdName: 'Florian',
      birthdate: new moment('2005-09-20').format('YYYY-MM-DD'),
    };
    generateCertifs(NB_VALIDATED, chunkSize, _generateValidatedPublishedCertifData, databaseBuilder, organizationId, type, certificationCenter, student4);
    const student5 = {
      nationalStudentId: '080583536JH',
      firstName: 'Islam',
      preferredLastName: '',
      lastName: 'BOUTABLA',
      middleName: '',
      thirdName: '',
      birthdate: new moment('2004-11-12').format('YYYY-MM-DD'),
    };
    generateCertifs(NB_REJECTED, chunkSize, _generateRejectedPublishedCertifData, databaseBuilder, organizationId, type, certificationCenter, student5);
    const student6 = {
      nationalStudentId: '080525355GJ',
      firstName: 'Sonam',
      preferredLastName: '',
      lastName: 'CRUMIERE',
      middleName: '',
      thirdName: '',
      birthdate: new moment('2008-08-02').format('YYYY-MM-DD'),
    };
    generateCertifs(NB_REJECTED, chunkSize, _generateRejectedPublishedCertifData, databaseBuilder, organizationId, type, certificationCenter, student6);
  }
}

module.exports = function livretScolaireCertificationBuilder({ databaseBuilder }) {
  _generateCertificationsForLSL(databaseBuilder);
  _generateCertificationsForLSU(databaseBuilder);
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
