Encompass.OrganizationsNewRoute = Encompass.AuthenticatedRoute.extend({
  actions: {
    toHome() {
      this.transitionTo('organizations.home');
    },
    toOrg(orgId) {
     this.transitionTo('organization', orgId);
    }
  }
});