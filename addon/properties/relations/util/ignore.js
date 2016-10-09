export default class Ignore {

  constructor() {
    this.value = 0;
  }

  inc() {
    this.value++;
  }

  dec() {
    this.value--;
  }

  with(cb) {
    this.inc();
    let ret = cb();
    this.dec();
    return ret;
  }

  ignore() {
    return this.value > 0;
  }

}
