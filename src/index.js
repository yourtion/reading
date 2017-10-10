module.exports = function(context, cb) {
  cb(null, { hello: context.body.name || 'Anonymous' });
};
