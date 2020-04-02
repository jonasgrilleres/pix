const Bookshelf = require('../bookshelf');

require('./end-of-participation-badge-view-model');

module.exports = Bookshelf.model('BadgePartnerCompetence', {
  tableName: 'badge-partner-competences',

  badge() {
    return this.belongsTo('Badge');
  },
});
