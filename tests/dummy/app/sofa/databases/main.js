import { Database, transient } from 'sofa';

export default Database.extend({

  root: transient('dummy-root', 'singleton')

});
