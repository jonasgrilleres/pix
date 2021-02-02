import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class UserDashboard extends Component {
  @service currentUser

  get userFirstname() {
    return this.currentUser.user.firstName;
  }

  get hasUserSeenNewDashboardInfo() {
    return this.currentUser.user.hasSeenNewDashboardInfo;
  }

  @action
  async closeInformationAboutNewDashboard() {
    await this.currentUser.user.save({ adapterOptions: { rememberUserHasSeenNewDashboardInfo: true } });
  }
}
