// For development and unittests only

class SofaGlobalOptions {
  constructor() {
    this.autoload = {
      internalModel: true,
      persistedArray: true
    };
  }
}

const instance = new SofaGlobalOptions();

export default instance;
