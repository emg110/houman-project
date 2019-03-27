// Initializes the `instaLocations` service on path `/instagram/locations`
const createService = require('feathers-nedb');
const createModel = require('../../models/insta-locations.model');
const hooks = require('./insta-locations.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/instagram/locations', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('instagram/locations');

  service.hooks(hooks);
};