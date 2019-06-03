/**
 * # Organizations Route
 * @description Route for dealing with all organization objects
 * @todo This is really the users_index route and should be named as such by convention
 * @author Amir Tahvildaran <amir@mathforum.org>
 * @since 1.0.0
 */
Encompass.OrganizationsRoute = Encompass.AuthenticatedRoute.extend({
  model: function() {
    let filterBy = {
      includeTrashed: 0
    };

    let sortBy = 'name';
    let sortDirection = 1;

    let queryHash = { filterBy, sortBy, sortDirection };

    return this.get('store')
      .query('organization', queryHash)
      .then(results => {
        return {
          orgs: results.toArray(),
          meta: results.get('meta')
        };
      });
  },

  renderTemplate: function() {
    this.render('organizations/organizations');
  },
  actions: {
    toHome() {
      this.transitionTo('organizations.home');
    },
    toOrg(orgId) {
      this.transitionTo('organization', orgId);
    }
  }
});
