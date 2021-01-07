require('dotenv').config();

const fs = require('fs');
const _ = require('lodash');

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
  </head>
<body>\n`;
const ENDCONTENT = '\n</body>\n</html>\n';

function initializeDOM(dom) { return dom + HEADCONTENT; }
function setHeaderDOM({ dom, userId, certificationCourseId }) {
  return dom + `
    <h1>UserID: ${userId}</h1>
    <h1>CertificationCourseId: ${certificationCourseId}</h1>
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
  console.log({competences});
  console.log(competences[0].tubes);

  dom += drawCompetencesDivByKEs(competences);
  return dom;
}

function drawCompetencesDivByKEs(competences) {
  let acc = '';

  // Pour chaque compétence
  _.forIn(competences, (competence) => {
    acc += `<div class="competence" id=${competence.id} >`;
    acc += '<h2>' + competence.name + ' <span>(' + competence.id + ')</span></h2>';
    acc += '<div>'

    // Pour chaque tube (sujet)
    _.forIn(competence.tubes, (tube) => {
      acc += `<div class="tube" id=${tube.id}>`;
      acc += '<h3>' + tube.name + ' <span>(' + tube.id + ')</span></h3>';
      _.map(tube.skills, (skill) => {
        const skillWasTestedInCertif = Boolean(skill.mbTestedChallenge);
        let skillClass = '';
        if (skillWasTestedInCertif)
          skillClass += ' skill--tested';
        if (skill.isPositionned)
          skillClass += ' skill--positionned';
        
        acc += `<p class="${skillClass}"> ${skill.name} <span>${skill.id}</span></p>`;
      });
      acc += '</div>';
    });

    acc +='</div>'
    acc +='</div>'
  });
  return acc;
}


// TODO : enlever le userId des params (ne prendre que le certifCourse en entrée)
// TODO : repérer les skill active VS opératives
// TODO : trier les skills dans les tubes (certains sont dans l'odre décroissant au lieu de croissant)
async function main() {
  try {
    const userId = parseInt(process.argv[2]);
    if(!userId) throw Error('Please give a correct userId !');

    const certificationCourseId = parseInt(process.argv[3]);
    if(!certificationCourseId) throw Error('Please give a correct certificationCourseId !');
  
    let dom = '';
    dom = initializeDOM(dom);
    dom = setHeaderDOM({ dom, userId, certificationCourseId });
    dom = await completeUserCompetences({ dom, userId, certificationCourseId });
    dom = finalizeDOM(dom);
  
    createWebPageWithRowDom(dom);
  } catch (error) {
    console.error(error);
  }
  
}

main();
