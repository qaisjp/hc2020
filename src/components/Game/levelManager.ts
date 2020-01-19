import PeerNetwork from "./network/peer_network";
import { TextLabel } from "./gui/textLabel";
import Arena from './entities/arena';
import * as Const from "./constants";
import _ from "lodash";
import Player from "./entities/player";
import Spear from "./entities/spear";
const uuidv4 = require('uuid/v4');

export default class LevelManager {
  network: PeerNetwork;
  remotePlayers: any;
  _connectionStatusText: any;
  _entitiesGroup: Phaser.GameObjects.Group;
  _spearGroup: Phaser.GameObjects.Group;
  _blockGroup: Phaser.Physics.Arcade.StaticGroup;
  _physics: any;
  staticObjects: Phaser.Physics.Arcade.Group;
  localPlayer: any;
  blocksGroup: any;
  itemBlocksGroup: any;
  game: Phaser.Game;
  scene: Phaser.Scene;
  leader: boolean;
  broadcastTimer: Phaser.Time.TimerEvent | undefined;
  constructor(game: Phaser.Game, scene: Phaser.Scene) {
    this.game = game;
    this.scene = scene;
    this.network = new PeerNetwork(this);
    this.remotePlayers = null;
    this.staticObjects = new Phaser.Physics.Arcade.Group(this.scene.physics.world, scene);
    this.leader = false;
    this._connectionStatusText = null;

    // make sure to cleanup peerjs when window is closed
    window.onunload = window.onbeforeunload = f => {
      this._disconnect();
      return;
    };
    console.log(scene);
    // Init groups
    this._entitiesGroup = this.scene.add.group();
    this._spearGroup = this.scene.add.group();
    this._blockGroup = this.scene.physics.add.staticGroup();
    this._createWorld();
  }

  shutdown() {
    this.remotePlayers.destroy();
  }

  _createWorld() {
    this._connectionStatusText = new TextLabel(this.scene, 16, 16, "connecting...", null, true, false, 0);
    this.scene.add.existing(this._connectionStatusText);
    this.remotePlayers = this.scene.add.group();

    this.network.addListener(Const.PeerJsEvents.OPEN, this._onOpen, this);
    this.network.addListener(Const.PeerJsEvents.DATA, this._onData, this);
    this.network.addListener(Const.PeerJsEvents.CLOSE, this._onClose, this);
    const createSpear = () => {
      const ID = uuidv4();
      const rotation = this.localPlayer.rotation;
      const spear = new Spear(this.scene, this.localPlayer.x, this.localPlayer.y, ID, rotation);
      this.network.broadcastToPeers(Const.PeerJsMsgType.SPEAR_CREATED, {
        id: ID,
        rotation: spear._angle,
        x: Math.round(this.localPlayer.x),
        y: Math.round(this.localPlayer.y)
      });
      spear.setup(this.scene, this._spearGroup);
    };
    this.localPlayer = new Player(this.scene, 32, 100, "local", true, createSpear);
    this.localPlayer.setup(this.scene);
    this.scene.cameras.main.startFollow(this.localPlayer);
    this._entitiesGroup.add(this.localPlayer);
    const arena = new Arena(this.scene, 0, 300);
    arena.setup(this.scene);
    this.scene.physics.add.collider(this.localPlayer, arena._blockGroup);
    this.scene.physics.add.collider(this._spearGroup, arena._blockGroup, (spear, are) => {
      const s = spear as Spear;
      s._wallHit = true;
    });
    this.scene.physics.add.collider(this._spearGroup, this.localPlayer, (spear, player) => {
      const s = spear as Spear
      const p = player as Player
      if(p.hasSpear){
        return
      }
      _.forEach(this._spearGroup.getChildren(), spear => {
        if (spear && spear.id === s.id) {
          spear.destroy();
        }
      });
      this.network.broadcastToPeers(Const.PeerJsMsgType.SPEAR_PICKED_UP, {
        id: s.id
      });
      this.localPlayer.hasSpear = true;
    });

    // this._createMap();
    // this._createMapObjects();

    // testing broadcasting the player state at a slower interval
    // this.broadcastTimer = this.scene.time.addEvent({
    //   delay: 20, // ms
    //   callback: this._broadcastPlayerUpdate,
    //   //args: [],
    //   callbackScope: this,
    //   loop: true
    // });
  }
  _createMap() {
    throw new Error("Method not implemented.");
  }
  _createMapObjects() {
    throw new Error("Method not implemented.");
  }

  _updateCollision() {
    // super._updateCollision();
    //this._physics.arcade.collide(this.localPlayer, this.remotePlayers,
    //null, this._onPlayerCollision, this);
    // this._physics.arcade.collide(this.remotePlayers, this._collisionLayer);
  }
  _collisionLayer(remotePlayers: any, _collisionLayer: any) {
    throw new Error("Method not implemented.");
  }

  _updateEntities() {
    for (const e of this._entitiesGroup.getChildren()) {
      e.update();
    }
    for (const s of this._spearGroup.getChildren()) {
      s.update();
    }
    this._broadcastPlayerUpdate();
  }

  update() {
    // this._updateCollision();
    this._updateEntities();
  }
  _broadcastPlayerUpdate() {
    var body = this.localPlayer.body;
    // console.log("Broadcasting...")
    this.network.broadcastToPeers(Const.PeerJsMsgType.PLAYER_UPDATE, {
      rotation: this.localPlayer.rotation,
      state: this.localPlayer.currentState,
      x: Math.round(this.localPlayer.x),
      y: Math.round(this.localPlayer.y),
      v: body.velocity.y.toFixed(2),
      hasSpear: this.localPlayer.hasSpear
      // a: body.acceleration.x.toFixed(2)
    });
  }

  _disconnect() {
    this.network.destroy();
  }

  /**
   * peer js event listeners
   */
  _onOpen(id) {
    if (this.network.leader) {
      this.leader = true;
    }
    this._connectionStatusText.setText(`connected, id: ${id}, leader: ${this.leader}`);
    // this.scene.time.delayedCall(Const.NETWORK_STATUS_CLEAR_TIME, f => (this._connectionStatusText.visible = false));
  }

  _onData(type, data) {
    var remotePlayer = _.find(this.remotePlayers.getChildren(), player => {
      return player.id === data.from;
    });
    switch (type) {
      case Const.PeerJsMsgType.HELLO:
        this._handleHello(data);
        break;
      case Const.PeerJsMsgType.PLAYER_UPDATE:
        this._handlePlayerUpdate(remotePlayer, data);
        break;
      case Const.PeerJsMsgType.BLOCK_BUMP:
        this._handleBlockBump(data);
        break;
      case Const.PeerJsMsgType.ITEM_BLOCK_BUMP:
        this._handleItemBlockBump(data);
        break;
      case Const.PeerJsMsgType.SPEAR_CREATED:
        this._handleSpearCreated(data);
        break;
      case Const.PeerJsMsgType.SYNC_SPEARS:
        this._handleSyncSpears(data);
        break;
      case Const.PeerJsMsgType.SPEAR_PICKED_UP:
        this._handleSpearPickedUp(data);
        break;
    }
  }

  _onClose(peer) {
    _.forEach(this.remotePlayers.getChildren(), player => {
      if (player && player.id === peer) {
        player.destroy();
      }
    });
  }

  /**
   * level event listeners
   */
  _onBlockBump(player, block) {
    // super._onBlockBump(player, block);

    if (player.body.touching.up) {
      this.network.broadcastToPeers(Const.PeerJsMsgType.BLOCK_BUMP, {
        idx: this.blocksGroup.getChildIndex(block)
      });
    }
  }

  _onItemBlockBump(player, itemBlock) {
    // super._onItemBlockBump(player, itemBlock);

    if (player.body.touching.up) {
      this.network.broadcastToPeers(Const.PeerJsMsgType.ITEM_BLOCK_BUMP, {
        idx: this.itemBlocksGroup.getChildIndex(itemBlock)
      });
    }
  }

  /**
   * msg handlers
   */
  _handleHello(data) {
    console.log(`hello from: ${data.from}`);
    this.network.connectToPeer(data.from);

    this._connectionStatusText.visible = true;
    this._connectionStatusText.setText("player joined");

    this.scene.time.delayedCall(Const.NETWORK_STATUS_CLEAR_TIME, f => (this._connectionStatusText.visible = false));
    // Setup the player
    var newPlayer = new Player(this.scene, data.x, data.y, data.from);
    newPlayer.setup(this.scene);
    this.remotePlayers.add(newPlayer);
    this._entitiesGroup.add(newPlayer);
    if (this.leader) {
      this.network.peerMessageQueue[data.from] = [];
      // Send the spears to the new player
      this.network.peerMessageQueue[data.from].push({
        type: Const.PeerJsMsgType.SYNC_SPEARS,
        data: {
          spears: this._spearGroup.getChildren().map(s => {
            const spear = s as Spear;
            return {
              id: spear.id,
              rotation: spear._angle,
              x: Math.round(spear.x),
              y: Math.round(spear.y)
            };
          })
        }
      });
    }
  }

  _handlePlayerUpdate(remotePlayer, data) {
    var body = remotePlayer.body;
    remotePlayer.rotation = data.rotation;
    remotePlayer.currentState = data.state;
    remotePlayer.x = data.x;
    remotePlayer.y = data.y;
    remotePlayer.hasSpear = data.hasSpear;
    body.velocity.y = data.v;
    body.acceleration.x = data.a;
  }

  _handleBlockBump(data) {
    this.blocksGroup.getAt(data.idx).bump();
  }

  _handleItemBlockBump(data) {
    this.itemBlocksGroup.getAt(data.idx).bump();
  }
  _handleSpearCreated(data) {
    const spear = new Spear(this.scene, data.x, data.y, data.id, data.rotation);
    spear.setup(this.scene, this._spearGroup);
  }
  _handleSyncSpears(data) {
    for (const s of data.spears) {
      const spear = new Spear(this.scene, s.x, s.y, s.id, s.rotation);
      spear.setup(this.scene, this._spearGroup);
    }
  }
  _handleSpearPickedUp(data) {
    _.forEach(this._spearGroup.getChildren(), spear => {
      if (spear && spear.id === data.id) {
        spear.destroy();
      }
    });
  }
}
