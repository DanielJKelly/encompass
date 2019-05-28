Encompass.OrganizationRoute = Encompass.AuthenticatedRoute.extend({
  model(params) {
    return this.get('store').findRecord('organization', params.organizationId);
  },
  renderTemplate: function(){
    this.render('organizations/organization');
  }
});