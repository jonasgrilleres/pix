const { expect, databaseBuilder } = require('../../../../test-helper');
const certificationsOdsService = require('../../../../../lib/domain/services/certifications-ods-service');
const fs = require('fs');

describe('Integration | Services | extractCertificationsDataFromAttendanceSheet', () => {

  afterEach(async () => {
    await databaseBuilder.clean();
  });

  context('When attendance sheet is of version 1.0', () => {

    context('when the data contains rows with no last name', () => {

      it('should return the data without the rows with no last name', async () => {
        // given
        const odsFilePath = `${__dirname}/attendance_sheet_1-0_no_last_name_ok_test.ods`;
        const odsBuffer = fs.readFileSync(odsFilePath);
        const expectedData = [
          { lastName: 'Lantier',
            firstName: 'Étienne',
            birthdate: '04/01/1990',
            birthplace: 'Ajaccio',
            email: null,
            externalId: 'ELAN123',
            extraTimePercentage: null,
            signature: 'x',
            certificationId: '2',
            lastScreen: 'x',
            comments: null,
          },
          { lastName: 'Ranou',
            firstName: 'Liam',
            birthdate: '22/10/2000',
            birthplace: null,
            email: null,
            externalId: null,
            extraTimePercentage: null,
            signature: null,
            certificationId: '3',
            lastScreen: 'x',
            comments: 'Commentaire',
          }];

        // when
        const actualData =
          await certificationsOdsService.extractCertificationsDataFromAttendanceSheet({ odsBuffer });

        // then
        expect(actualData).to.deep.equal(expectedData);
      });

    });

    context('when data is regular', () => {

      it('should return expected data', async () => {
        // given
        const odsFilePath = `${__dirname}/attendance_sheet_1-0_ok_test.ods`;
        const odsBuffer = fs.readFileSync(odsFilePath);
        const expectedData = [{
          lastName: 'Baudu',
          firstName: null,
          birthdate: '25/12/2008',
          birthplace: 'Metz',
          email: null,
          externalId: null,
          extraTimePercentage: 0.3,
          signature: 'x',
          certificationId: '1',
          lastScreen: null,
          comments: null,
        },
        { lastName: 'Lantier',
          firstName: 'Étienne',
          birthdate: '04/01/1990',
          birthplace: 'Ajaccio',
          email: null,
          externalId: 'ELAN123',
          extraTimePercentage: null,
          signature: 'x',
          certificationId: '2',
          lastScreen: 'x',
          comments: null,
        },
        { lastName: 'Ranou',
          firstName: 'Liam',
          birthdate: '22/10/2000',
          birthplace: null,
          email: null,
          externalId: null,
          extraTimePercentage: null,
          signature: null,
          certificationId: '3',
          lastScreen: 'x',
          comments: 'Commentaire',
        }];

        // when
        const actualData =
          await certificationsOdsService.extractCertificationsDataFromAttendanceSheet({ odsBuffer });

        // then
        expect(actualData).to.deep.equal(expectedData);
      });
    });
  });

  context('When attendance sheet is of version 1.1', () => {

    context('when the data contains rows with no last name', () => {

      it('should return the data without the rows with no last name', async () => {
        // given
        const odsFilePath = `${__dirname}/attendance_sheet_1-1_no_last_name_ok_test.ods`;
        const odsBuffer = fs.readFileSync(odsFilePath);
        const expectedData = [
          { lastName: 'Lantier',
            firstName: 'Étienne',
            birthdate: '04/01/1990',
            birthplace: 'Ajaccio',
            externalId: 'ELAN123',
            extraTimePercentage: null,
            signature: 'x',
            certificationId: '2',
            lastScreen: 'x',
            comments: null,
          },
          { lastName: 'Ranou',
            firstName: 'Liam',
            birthdate: '22/10/2000',
            birthplace: null,
            externalId: null,
            extraTimePercentage: null,
            signature: null,
            certificationId: '3',
            lastScreen: 'x',
            comments: 'Commentaire',
          }];

        // when
        const actualData =
          await certificationsOdsService.extractCertificationsDataFromAttendanceSheet({ odsBuffer });

        // then
        expect(actualData).to.deep.equal(expectedData);
      });

    });

    context('when data is regular', () => {

      it('should return expected data', async () => {
        // given
        const odsFilePath = `${__dirname}/attendance_sheet_1-1_ok_test.ods`;
        const odsBuffer = fs.readFileSync(odsFilePath);
        const expectedData = [{
          lastName: 'Baudu',
          firstName: null,
          birthdate: '25/12/2008',
          birthplace: 'Metz',
          externalId: null,
          extraTimePercentage: 0.3,
          signature: 'x',
          certificationId: '1',
          lastScreen: null,
          comments: null,
        },
        { lastName: 'Lantier',
          firstName: 'Étienne',
          birthdate: '04/01/1990',
          birthplace: 'Ajaccio',
          externalId: 'ELAN123',
          extraTimePercentage: null,
          signature: 'x',
          certificationId: '2',
          lastScreen: 'x',
          comments: null,
        },
        { lastName: 'Ranou',
          firstName: 'Liam',
          birthdate: '22/10/2000',
          birthplace: null,
          externalId: null,
          extraTimePercentage: null,
          signature: null,
          certificationId: '3',
          lastScreen: 'x',
          comments: 'Commentaire',
        }];

        // when
        const actualData =
          await certificationsOdsService.extractCertificationsDataFromAttendanceSheet({ odsBuffer });

        // then
        expect(actualData).to.deep.equal(expectedData);
      });
    });
  });

});