import RemotePeer from "./remote_peer";
import * as Listeners from "./listeners";
import * as Const from "../constants";
import Peer from "peerjs";
import _ from "lodash";

const Host = window.location.hostname;
const Port = "9000";
const Protocol = window.location.protocol;
const Path = "/multi";
const PeersUrl = `${Path}/peerjs/peers`;

interface SignalD {
  func: Function;
  ctx: any;
}
class Signal {
  dispatchers: SignalD[] = [];
  constructor() {
    this.dispatchers = [];
  }
  add(func, ctx) {
    this.dispatchers.push({
      func,
      ctx
    });
  }
  dispatch(...data) {
    for (const d of this.dispatchers) {
      const f = d.func.bind(d.ctx);
      f(...data);
    }
  }
}

class PeerNetwork {
  peer: Peer;
  _level: any;
  connectedPeers: {};
  peerMessageQueue: {};
  _id: string;
  _signals: {};
  leader: boolean;
  constructor(level) {
    this.peer = new Peer({ host: Host, port: parseInt(Port), path: Path });

    this._level = level;
    this.connectedPeers = {};
    this.peerMessageQueue = {}
    this._id = "";
    this._signals = {};
    this.leader = false;
    this._addEventListeners();
  }

  addListener(event, listener, ctx: any = null) {
    this._signals[event] = new Signal();
    this._signals[event].add(listener, ctx);
  }

  async getAllPeers(fn, ctx = null) {
    var xmlhttp = new XMLHttpRequest();
    var url = `${Protocol}//${Host}:${Port}${PeersUrl}`;
    return new Promise((res, rej) => {
      xmlhttp.onreadystatechange = f => {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
          // get an array of peer id's excluding our own id
          let peers = _.reject(JSON.parse(xmlhttp.responseText), peer => {
            return peer === this._id;
          });
          // pass the array to our callback
          res({ctx, peers});
        }
      };

      xmlhttp.open("GET", url, true);
      xmlhttp.send();
    });
  }

  broadcastToPeers(type, data) {
    _.each(this.connectedPeers, v => {
      v.send(this._id, type, data);
    });
  }

  sendToPeer(id, type, data) {
    if (!_.has(this.connectedPeers, id)) {
      console.log(`Error: not connected to peer ${id}`);
      return;
    }

    this.connectedPeers[id].send(this._id, type, data);
  }

  connectToPeer(id) {
    // create a new Peer and connect to them
    if (!_.has(this.connectedPeers, id)) {
      let dataConn = this.peer.connect(id);

      console.log(`Connecting to peer: ${id}`);
      this.connectedPeers[id] = new RemotePeer(id, dataConn);
      this.connectedPeers[id].on(Const.PeerJsEvents.OPEN, f => {
        this.sendToPeer(id, Const.PeerJsMsgType.HELLO, {
          x: this._level.localPlayer.x,
          y: this._level.localPlayer.y
        });
        if(this.peerMessageQueue[id]){
          for(const m of this.peerMessageQueue[id]){
            this.sendToPeer(id, m.type, m.data);
          }
        }
      });
    }
  }

  destroy() {
    if (!!this.peer && !this.peer.destroyed) {
      console.log("Destroying...");
      this.peer.destroy();
    }
  }

  _addEventListeners() {
    this.peer.on("open", id =>
      Listeners.handleOpen.call(this, id, () => {
        this.leader = true;
      })
    );
    this.peer.on("connection", peer => Listeners.handleConnection.call(this, peer));
    this.peer.on("error", err => Listeners.handleError(err));
  }
}

export default PeerNetwork;
