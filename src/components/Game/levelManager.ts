import PeerNetwork from "./network/peer_network";
import { TextLabel } from "./gui/textLabel";
import Wall, { WallThickness } from './entities/arena/wall';
import VerticalDoor from './entities/arena/verticalDoor';
import HorizontalDoor from './entities/arena/horizontalDoor';
import * as Const from "./constants";
import _ from "lodash";
import Player from "./entities/player";
import Spear from "./entities/spear";

export default class LevelManager {
  network: any;
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
  broadcastTimer: Phaser.Time.TimerEvent | undefined;
  constructor(game: Phaser.Game, scene: Phaser.Scene) {
    this.game = game;
    this.scene = scene;
    this.network = null;
    this.remotePlayers = null;
    this.staticObjects = new Phaser.Physics.Arcade.Group(this.scene.physics.world, scene);

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
    this.network = new PeerNetwork(this);

    this._connectionStatusText = new TextLabel(this.scene, 16, 16, "connecting...", null, true, false, 0);
    this.scene.add.existing(this._connectionStatusText);
    this.remotePlayers = this.scene.add.group();

    this.network.addListener(Const.PeerJsEvents.OPEN, this._onOpen, this);
    this.network.addListener(Const.PeerJsEvents.DATA, this._onData, this);
    this.network.addListener(Const.PeerJsEvents.CLOSE, this._onClose, this);
    const createSpear = () => {
      const ID = "id"
      const spear = new Spear(
        this.scene,
        this.localPlayer.x,
        this.localPlayer.y,
        ID,
        this.localPlayer.rotation
      );
      this.network.broadcastToPeers(Const.PeerJsMsgType.SPEAR_CREATED, {
        id: ID,
        rotation: this.localPlayer.rotation,
        x: Math.round(this.localPlayer.x),
        y: Math.round(this.localPlayer.y),
      });
      spear.setup(this.scene, this._spearGroup, [this.localPlayer.body.velocity.x, this.localPlayer.body.velocity.y]);
    };
    this.localPlayer = new Player(this.scene, 32, 100, "local", true, createSpear);
    this.localPlayer.setup(this.scene);
    this.scene.cameras.main.startFollow(this.localPlayer);
    this._entitiesGroup.add(this.localPlayer);
    const wallunit = 250;
    const thick = WallThickness / 2;
    const bits = [
      { x: 32, y: 100, length: wallunit * 2, angle: 90 }, // bottom
      { x: 32 + wallunit, y: 100 - wallunit / 2 + thick, length: wallunit, angle: 0 }, // bottom right
      { x: 32 + wallunit * 1.5 - thick, y: 100 - wallunit + thick, length: wallunit, angle: 90 }, // right bottom
      { x: 32 + wallunit * 2 - thick, y: 100 - wallunit * 2 + WallThickness, length: wallunit * 2, angle: 0 }, // right
      { x: 32 + wallunit * 1.5, y: 100 - wallunit * 3 + WallThickness, length: wallunit, angle: 90 }, // right top
      { x: 32 + wallunit, y: 100 - wallunit * 3.5 + WallThickness * 1.5, length: wallunit, angle: 0 }, // top right
      { x: 32, y: 100 - wallunit * 4 + thick * 4, length: wallunit * 2, angle: 90 }, // top
      { x: 32 - wallunit, y: 100 - wallunit * 3.5 + WallThickness * 1.5, length: wallunit, angle: 0 }, // top left
      { x: 32 - wallunit * 1.5, y: 100 - wallunit * 3 + WallThickness, length: wallunit, angle: 90 }, // left top
      { x: 32 - wallunit * 2 + thick, y: 100 - wallunit * 2 + WallThickness, length: wallunit * 2, angle: 0 }, // left
      { x: 32 - wallunit * 1.5 + thick, y: 100 - wallunit + thick, length: wallunit, angle: 90 }, // left bottom
      { x: 32 - wallunit, y: 100 - wallunit / 2 + thick, length: wallunit, angle: 0 } // bottom left
    ];
    for (const b of bits) {
      const wall = new Wall(this.scene, b.x, b.y, b.length, b.angle);
      wall.setup(this.scene, this._blockGroup);
      this._blockGroup.add(wall);
    }
    const left_door = new VerticalDoor(this.scene, 32 - wallunit * 2 + thick, 100 - wallunit * 2 + WallThickness, 'left');
    left_door.setup(this.scene);
    const right_door= new VerticalDoor(this.scene, 32 + wallunit * 2 - thick, 100 - wallunit * 2 + WallThickness, 'right');
    right_door.setup(this.scene);
    const top_door = new HorizontalDoor(this.scene, 32, 100 - wallunit * 4 + thick * 4, 'top');
    top_door.setup(this.scene);
    const bottom_door= new HorizontalDoor(this.scene, 32, 100, 'bottom');
    bottom_door.setup(this.scene);
    this.scene.physics.add.collider(this.localPlayer, this._blockGroup);
    this.scene.physics.add.collider(this._spearGroup, this._blockGroup, (spear, block) => {
      const s = spear as Spear;
      s._wallHit = true;
    });

    // this._createMap();
    // this._createMapObjects();

    // testing broadcasting the player state at a slower interval
    this.broadcastTimer = this.scene.time.addEvent({
      delay: 20, // ms
      callback: this._broadcastPlayerUpdate,
      //args: [],
      callbackScope: this,
      loop: true
    });
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
      v: body.velocity.y.toFixed(2)
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
    this._connectionStatusText.setText(`connected, id: ${id}`);
    // this.scene.time.delayedCall(Const.NETWORK_STATUS_CLEAR_TIME, f => (this._connectionStatusText.visible = false));
  }

  _onData(type, data) {
    // console.log(this.remotePlayers)
    // console.log(this.remotePlayers.children)
    // console.log("received some data")
    // console.log(data)
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
        this._handleSpearCreated(data)
        break;
    }
  }

  _onClose(peer) {
    _.forEach(this.remotePlayers.getChildren(), player => {
      if (player.id === peer) {
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
    var newPlayer = new Player(this.scene, data.x, data.y, data.from);
    newPlayer.setup(this.scene);
    this.remotePlayers.add(newPlayer);
    this._entitiesGroup.add(newPlayer);
  }

  _handlePlayerUpdate(remotePlayer, data) {
    var body = remotePlayer.body;
    remotePlayer.rotation = data.rotation;
    remotePlayer.currentState = data.state;
    remotePlayer.x = data.x;
    remotePlayer.y = data.y;
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
    const spear = new Spear(
      this.scene,
      data.x,
      data.y,
      data.id,
      data.rotation
    );
    spear.setup(this.scene, this._spearGroup);
  }
}
