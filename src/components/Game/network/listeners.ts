import * as Const from "../constants";
import _ from "lodash";

export async function handleOpen(id, setLeader) {
  console.log(`Connected to PeerServer with id: ${id}`);
  console.log(this);
  // set our assigned id and call user listener
  // connect to all existing peers (for now..)
  const { peers } = await this.getAllPeers();
  if (peers.length === 1) {
    setLeader();
  }
  for (var peer of peers) {
    if (peer !== id) {
      this.connectToPeer(peer);
    }
  }

  this._id = id;
  this._signals[Const.PeerJsEvents.OPEN].dispatch(id);
}

export function handleConnection(conn) {
  console.log(`${conn.peer} connected to us`);

  // begin listening to events for this connected peer
  conn.on(Const.PeerJsEvents.DATA, data => handleData.call(this, data));
  conn.on(Const.PeerJsEvents.CLOSE, () => handleClose.call(this, conn.peer));
  conn.on(Const.PeerJsEvents.ERROR, err => handleError.call(this, err));

  // call the user listener
  if (_.has(this._signals, Const.PeerJsEvents.CONNECTION)) {
    this._signals[Const.PeerJsEvents.CONNECTION].dispatch(conn.peer);
  }
}

export function handleError(err) {
  console.log(err);
}

function handleData(data) {
  var type = data.type;

  if (!_.isUndefined(type)) {
    this._signals[Const.PeerJsEvents.DATA].dispatch(type, data);
  } else {
    console.log(`Error: unrecognised message with type: ${type}`);
  }
}

function handleClose(peer) {
  if (_.has(this.connectedPeers, peer)) {
    delete this.connectedPeers[peer];
    this._signals[Const.PeerJsEvents.CLOSE].dispatch(peer);
  }
}
