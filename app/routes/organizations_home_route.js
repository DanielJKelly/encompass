Encompass.OrganizationsHomeRoute = Encompass.AuthenticatedRoute.extend(Encompass.CurrentUserMixin, {
  beforeModel(params, transition) {
    let primaryOrgId = this.get('utils').getBelongsToId(this.get('currentUser'), 'organization');

    if (primaryOrgId) {
      this.transitionTo('organization', primaryOrgId);
    }
  }
});