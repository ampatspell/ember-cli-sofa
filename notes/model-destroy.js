// Model isNew === true

let model = db.model('thing');
model.destroy();
next().then(() => {

  model.isDestroyed // => true
  model._internal // => null

  model.get('id') // getInternalModel throws
  model.get('database') // either cached or getInternalModel throws

  //

  // relations
  relation.onInternalDestroyed()

  // stop observing
  this.internal.removeObserver(this);
  this.internal = null;
  this.value.destroy(); // BelongsToProxied, HasMany
  this.value = null;

  // needs separate test for belongsTo proxied

  // attachments are destroyed too

});

// Model isNew === false
// for now just an assert on isNew===true
