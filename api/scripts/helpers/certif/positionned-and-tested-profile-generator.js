require('dotenv').config();

const fs = require('fs');
const _ = require('lodash');
const certificationCourseRepository = require('../../../lib/infrastructure/repositories/certification-course-repository');

const {
  findDirectAndHigherLevelKEs,
  getAllTestedChallenges,
  mergeTestedChallengesAndKEsByCompetences,
} = require('./positionned-and-tested-profile-helper');

const FILENAME = `${__dirname}/competence-details.html`;
const HEADCONTENT = `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8">
    <link rel="stylesheet" type="text/css" href="competence-details.css">
    <title>Cheat view</title>
    <script src="competence-details.js"></script>
  </head>
<body>\n`;
const ENDCONTENT = '\n</body>\n</html>\n';

function initializeDOM(dom) { return dom + HEADCONTENT; }
function setHeaderDOM({ dom, userId, firstName, lastName, certificationCourseId }) {
  return dom + `
  <section>
    <h1>Candidat de certification: ${firstName} ${lastName}, (userId: ${userId})</h1>
    <h1>CertificationCourseId: ${certificationCourseId}</h1>
  </section>
  `;
}
function finalizeDOM(dom) { return dom + ENDCONTENT; }
function createWebPageWithRowDom(dom) {
  fs.writeFile(FILENAME, dom, function (err) {
    if (err) throw err;
    console.log('Competence-detail page created !');
  });
}


async function completeUserCompetences({ dom, userId, certificationCourseId }) {
  const KEs = await findDirectAndHigherLevelKEs({ userId });
  const challengesTestedInCertif = await getAllTestedChallenges({ courseId: certificationCourseId });
  const competences = await mergeTestedChallengesAndKEsByCompetences({ KEs, challengesTestedInCertif });

  dom += drawCompetencesDivByKEs(competences);
  return dom;
}

function drawCompetencesDivByKEs(competences) {
  let acc = '';

  // Pour chaque compétence
  _.forIn(competences, (competence) => {
    acc += `<div class="competence ${competence.area.color}">`;
    acc += `<h2 onClick="showDetails(${competence.id})">
      ${competence.name}
      <span id=${competence.id}>CompetenceId: ${competence.id}</span>
    </h2>`;
    acc += '<div>'

    // Pour chaque tube (sujet)
    _.forIn(competence.tubes, (tube) => {
      acc += `<div class="tube">`;
      acc += `<h3 onClick="showDetails(${tube.id})">
        ${tube.name}
        <span id=${tube.id}>TubeId: ${tube.id}</span>
      </h3>`;
      _.map(tube.skills, (skill) => {
        const skillWasTestedInCertif = skill.mbTestedChallenge.length > 0;

        if (skillWasTestedInCertif) {
          acc += `<p class="skill--tested" onClick="showDetails(${skill.id})">
            ${skill.name}
            <span id=${skill.id}>
              SkillId: ${skill.id}<br>
              CertificationChallengeId: ${skill.mbTestedChallenge[0].id}<br>
              ChallengeId: ${skill.mbTestedChallenge[0].challengeId}<br>
            </span>
          </p>`;
        } else {
          acc += `<p class="skill" onClick="showDetails(${skill.id})"> ${skill.name} <span id=${skill.id}>SkillId: ${skill.id}</span></p>`;
        }
        
      });
      acc += '</div>';
    });

    acc +='</div>'
    acc +='</div>'
  });
  return acc;
}


// TODO : repérer les skill active VS opératives
async function main() {
  try {
    const certificationCourseId = parseInt(process.argv[2]);
    if(!certificationCourseId) throw Error('Please give a correct certificationCourseId !');

    const { userId, firstName, lastName } = await certificationCourseRepository.get(certificationCourseId);
  
    let dom = '';
    dom = initializeDOM(dom);
    dom = setHeaderDOM({ dom, userId, firstName, lastName, certificationCourseId });
    dom = await completeUserCompetences({ dom, userId, certificationCourseId });
    dom = finalizeDOM(dom);
  
    createWebPageWithRowDom(dom);
  } catch (error) {
    console.error(error);
  }
  
}

main();
