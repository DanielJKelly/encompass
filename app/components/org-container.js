Encompass.OrgContainerComponent = Ember.Component.extend(Encompass.CurrentUserMixin, {
elementId: 'org-container',

activeOrg: null,
doIncludeTrashedOrgs: true,

modelOrgs: Ember.computed.alias('model.orgs'),
modelMeta: Ember.computed.alias('model.meta'),

filterOptions: {
  doIncludeTrashedOrgs: {
    label: 'Include Trashed Orgs',
    relatedProp: 'doIncludeTrashedOrgs',
    isChecked: false,
  },
},

actions: {
  setActiveOrg(org) {
    this.set('activeOrg', org);
  }
}
});