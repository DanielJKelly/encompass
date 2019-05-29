Encompass.OrgContainerComponent = Ember.Component.extend(Encompass.CurrentUserMixin, {
elementId: 'org-container',

activeOrg: null,

actions: {
  setActiveOrg(org) {
    this.set('activeOrg', org);
  }
}
});