export default class EventSourceListener {

  constructor(url) {
    this.url = url;
    this.started = false;
    this.open = false;
    this.source = null;
    this.bound = {
      open: this.onOpen.bind(this),
      error: this.onError.bind(this),
      message: this.onMessage.bind(this),
      heartbeat: this.onHeartbeat.bind(this)
    };
  }

  start() {
    if(this.started) {
      return;
    }
    /* global EventSource */
    let source = new EventSource(this.url, { withCredentials: true });
    for(let key in this.bound) {
      source.addEventListener(key, this.bound[key], false);
    }
    this.source = source;
    this.started = true;
  }

  stop() {
    if(!this.started) {
      return;
    }
    let source = this.source;
    source.close();
    for(let key in this.bound) {
      source.removeEventListener(key, this.bound[key], false);
    }
    this.source = null;
    this.started = false;
    this.open = false;
  }

  onOpen() {
    this.open = true;
  }

  onError(e) {
    var state = e.target.readyState;
    if(state === e.target.OPEN) {
      return;
    }
    this.open = false;
  }

  onHeartbeat() {
    console.log('heartbeat');
  }

  onMessage(message) {
    console.log('*', message);
  }

}
