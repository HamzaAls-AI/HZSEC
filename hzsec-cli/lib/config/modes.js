const MODE_DEFINITIONS = {
  quick: ['code', 'config', 'web'],
  full: ['code', 'config', 'secret', 'web', 'hardening'],
  config: ['config'],
  secret: ['secret'],
  web: ['web'],
  hardening: ['hardening'],
  custom: ['code', 'config', 'secret', 'web', 'hardening', 'custom']
};

module.exports = { MODE_DEFINITIONS };