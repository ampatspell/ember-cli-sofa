// `section: belongsTo('section')` where `section` has few implementations (document 'section:jxphpdcdt1xc' is expected to be 'section' not 'category'). `{ polymorphic: true}`

category: belongsTo('section', { polymorphic: true });
sections: hasMany('section', { query: 'foo-sections', polymorphic: true });

{
  _id: 'section:one',
  category: {
    _id: 'section:other',
    type: 'gallery'
  }
}
