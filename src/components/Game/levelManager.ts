import PeerNetwork from "./network/peer_network";
import { TextLabel } from "./gui/textLabel";
import Arena from "./entities/arena";
import * as Const from "./constants";
import _ from "lodash";
import Player from "./entities/player";
import Spear from "./entities/spear";
import Monster from "./entities/monster";
import Laser from "./entities/laser";
import Ghost from "./entities/ghost";
const uuidv4 = require("uuid/v4");

const WAVES = [1, 2, 3, 5, 10];

export default class LevelManager {
  network: any;
  remotePlayers: any;
  _connectionStatusText: any;
  _introText: any;
  _deadText: any;
  _startText: any;
  _instructionText: any;
  _malwareText: any;
  _entitiesGroup: Phaser.GameObjects.Group;
  _spearGroup: Phaser.GameObjects.Group;
  _laserGroup: Phaser.GameObjects.Group;
  _monsterGroup: Phaser.GameObjects.Group;
  _blockGroup: Phaser.Physics.Arcade.StaticGroup;
  _physics: any;
  staticObjects: Phaser.Physics.Arcade.Group;
  localPlayer: any;
  blocksGroup: any;
  itemBlocksGroup: any;
  game: Phaser.Game;
  scene: Phaser.Scene;
  leader: boolean;
  dead: boolean;
  broadcastTimer: Phaser.Time.TimerEvent | undefined;
  ghost: any;
  gameStarted: boolean;
  spawning: boolean;
  arena: Arena | undefined;
  waveNumber: number;
  constructor(game: Phaser.Game, scene: Phaser.Scene) {
    this.game = game;
    this.scene = scene;
    this.remotePlayers = null;
    this.staticObjects = new Phaser.Physics.Arcade.Group(this.scene.physics.world, scene);
    this.leader = false;
    this._connectionStatusText = null;
    this.dead = false;
    this.waveNumber = 0;

    // make sure to cleanup peerjs when window is closed
    window.onunload = window.onbeforeunload = f => {
      this._disconnect();
      return;
    };
    this.gameStarted = false;
    this.spawning = false;
    // Init groups
    this._entitiesGroup = this.scene.add.group();
    this._spearGroup = this.scene.add.group();
    this._laserGroup = this.scene.add.group();
    this._monsterGroup = this.scene.add.group();
    this._blockGroup = this.scene.physics.add.staticGroup();
    this.remotePlayers = this.scene.add.group();
    this._introText = new TextLabel(this.scene, -300, -200, "You've gone offline!", null, true, false, 0, 32);
    this._deadText = new TextLabel(this.scene, -150, -200, "He's dead Jim!", null, true, false, 0, 32);
    this._startText = new TextLabel(this.scene, -270, 100, "Press space to start playing", null, true, true, 0, 20);
    this._instructionText = new TextLabel(
      this.scene,
      -280,
      350,
      "WASD to move. Mouse to aim. Click to shoot.",
      null,
      true,
      false,
      0,
      14
    );
    this._malwareText = new TextLabel(
      this.scene,
      -220,
      390,
      "Fight the malware for your life",
      null,
      true,
      false,
      0,
      14
    );
    this.scene.add.existing(this._introText);
    this.scene.add.existing(this._startText);
    this.scene.add.existing(this._instructionText);
    this.scene.add.existing(this._malwareText);
    this.scene.cameras.main.centerOn(0, 100);
  }

  shutdown() {
    this.remotePlayers.destroy();
  }

  _createWorld() {
    this.network = new PeerNetwork(this);
    this.scene.add.sprite(0, -180, "avast");
    this._connectionStatusText = new TextLabel(this.scene, 0, -50, "connecting...", null, true, false, 0);
    this.scene.add.existing(this._connectionStatusText);
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
    this.localPlayer = new Player(this.scene, 0, -185, "local", true, createSpear);
    this.localPlayer.setup(this.scene);
    this.scene.cameras.main.startFollow(this.localPlayer);
    this._entitiesGroup.add(this.localPlayer);
    this.arena = new Arena(this.scene, 0, 300);
    this.arena.setup(this.scene);
    this.scene.physics.add.collider(this.localPlayer, this.arena._blockGroup);
    this.scene.physics.add.collider(this._monsterGroup, this.arena._blockGroup);
    this.scene.physics.add.collider(this._laserGroup, this.arena._blockGroup, (laser, area) => {
      const l = laser as Laser;
      _.forEach(this._laserGroup.getChildren(), laser => {
        if (laser && laser.id === l.id) {
          laser.destroy();
        }
      });
    });
    this.scene.physics.add.overlap(this._laserGroup, this.localPlayer, (laser, player) => {
      const l = laser as Laser;
      const p = player as Player;
      if (p.id !== "local") {
        return;
      }
      _.forEach(this._laserGroup.getChildren(), laser => {
        if (laser && laser.id === l.id) {
          laser.destroy();
        }
      });

      if (this.remotePlayers.length > 0) {
        this.ghost = new Ghost(this.scene, p.body.x, p.body.y, "local");
        this.ghost.setup(this.scene);
        this.scene.cameras.main.startFollow(this.ghost);
        this._entitiesGroup.add(this.ghost);
      } else {
        this.scene.add.existing(this._deadText);
        this.scene.add.existing(this._startText);
        this.scene.add.existing(this._instructionText);
        this.scene.add.existing(this._malwareText);
      }
      p.destroy();
      this.network.broadcastToPeers(Const.PeerJsMsgType.PLAYER_DEAD, {});
      this.dead = true;
      console.log("dead called")
    });
    this.scene.physics.add.collider(this._spearGroup, this.arena._blockGroup, (spear, area) => {
      const s = spear as Spear;
      s.onWallHit();
    });
    this.scene.physics.add.overlap(this._spearGroup, this._monsterGroup, (spear, monster) => {
      const s = spear as Spear;
      const m = monster as Monster;
      m.isHit = true;
      m.body.mass = 0;
      s.onHitMonster(m);
      this.scene.time.delayedCall(2000, f => {
        if (this.leader) {
          _.forEach(this._monsterGroup.getChildren(), monster => {
            if (monster && monster.id === m.id) {
              monster.destroy();
              this.network.broadcastToPeers(Const.PeerJsMsgType.DEAD_MONSTER, {
                id: m.id
              });
            }
          });
        }
      });
    });
    this.scene.physics.add.collider(this._spearGroup, this.localPlayer, (spear, player) => {
      const s = spear as Spear;
      const p = player as Player;
      if (p.hasSpear || p.id !== "local") {
        return;
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
    for (const m of this._monsterGroup.getChildren()) {
      m.update();
    }
    if (!this.dead) {
      this._broadcastPlayerUpdate();
    }
    if (this.leader) {
      this._broadcastMonstersUpdate();
    }
  }

  createLaser = monster => {
    const ID = uuidv4();
    let closest;
    let closestDistance = 10e10;
    if (!this.dead) {
      closest = this.localPlayer;
      closestDistance = Phaser.Math.Distance.Between(
        monster.body.x,
        monster.body.y,
        this.localPlayer.body.x,
        this.localPlayer.body.y
      );
    }
    for (const p of this.remotePlayers.getChildren()) {
      const d = Phaser.Math.Distance.Between(monster.body.x, monster.body.y, p.body.x, p.body.y);
      if (d < closestDistance) {
        closestDistance = d;
        closest = p;
      }
    }
    if (closest) {
      const rotationRad = Phaser.Math.Angle.Between(monster.body.x, monster.body.y, closest.body.x, closest.body.y);
      const laser = new Laser(this.scene, monster.x, monster.y, ID, rotationRad);
      laser.setup(this.scene, this._laserGroup);
    }
  };

  createMonster(x, y, wait = true) {
    const xOff = Math.ceil((Math.random() - 0.5) * 100);
    const yOff = Math.ceil((Math.random() - 0.5) * 100);
    this.scene.time.delayedCall(wait ? Math.random() * 4000 : 1, f => {
      const m = new Monster(this.scene, x + xOff, y + yOff, uuidv4());
      m.setup(this.scene, this.createLaser);
      this._monsterGroup.add(m);
    });
  }

  update() {
    if (this.gameStarted) {
      // this._updateCollision();
      this._updateEntities();
      if (this.leader && this.spawning) {
        // SPAWN MONSTERS HERE
        if (this._monsterGroup.getChildren().length === 0 && this.arena) {
          const nmbrMonsters = WAVES[this.waveNumber];
          this.waveNumber++;
          for (const step of [...Array(nmbrMonsters)].keys()) {
            const ds = this.arena.doors;
            const OFFSET = 120;
            this.createMonster(ds[0].x + OFFSET, ds[0].y, step !== 0);
            this.createMonster(ds[1].x - OFFSET, ds[1].y, step !== 0);
            this.createMonster(ds[2].x, ds[2].y + OFFSET, step !== 0);
            this.createMonster(ds[3].x, ds[3].y - OFFSET, step !== 0);
          }
        }
      }
    } else {
      this.scene.input.keyboard.on("keydown", event => {
        switch (event.key) {
          case " ":
            if (!this.gameStarted) {
              this.gameStarted = true;
              this._startText.destroy();
              this._introText.destroy();
              this._createWorld();
            }
            break;
        }
      });
    }
  }
  _broadcastPlayerUpdate() {
    var body = this.localPlayer.body;
    this.network.broadcastToPeers(Const.PeerJsMsgType.PLAYER_UPDATE, {
      rotation: this.localPlayer.rotation,
      state: this.localPlayer.currentState,
      x: Math.round(this.localPlayer.x),
      y: Math.round(this.localPlayer.y),
      vx: body.velocity.x.toFixed(2),
      vy: body.velocity.y.toFixed(2),
      hasSpear: this.localPlayer.hasSpear
    });
  }

  _broadcastMonstersUpdate() {
    const monsters = this._monsterGroup.getChildren() as Monster[];
    this.network.broadcastToPeers(Const.PeerJsMsgType.MONSTERS_UPDATE, {
      monsters: monsters.map(m => ({
        id: m.id,
        rotation: m.rotation,
        x: Math.round(m.x),
        y: Math.round(m.y),
        vx: m.body.velocity.x.toFixed(2),
        vy: m.body.velocity.y.toFixed(2),
        numUpdates: m._numUpdates,
        numRand: m._numRand
      }))
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
    if (this.arena) {
      if (this.leader) {
        for (const d of this.arena.doors) {
          d.open();
        }
      } else {
        for (const d of this.arena.doors) {
          d.openImmediate();
        }
      }
      this.scene.time.delayedCall(2000, f => {
        this.spawning = true;
      });
    }
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
      case Const.PeerJsMsgType.MONSTERS_UPDATE:
        this._handleMonstersUpdate(data);
        break;
      case Const.PeerJsMsgType.PLAYER_DEAD:
        this._handlePlayerDead(remotePlayer);
        break;
      case Const.PeerJsMsgType.DEAD_MONSTER:
        this._handleDeadMonster(data);
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
    body.velocity.x = data.vx;
    body.velocity.y = data.vy;
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
  _handleMonstersUpdate(data) {
    const { monsters } = data;
    const myMonsters = this._monsterGroup.getChildren() as Monster[];
    for (const monster of monsters) {
      const potentialMonster: Monster | undefined = myMonsters.find(m => m.id === monster.id);
      if (potentialMonster) {
        potentialMonster.rotation = monster.rotation;
        potentialMonster.x = monster.x;
        potentialMonster.y = monster.y;
        potentialMonster.body.velocity.x = monster.vx;
        potentialMonster.body.velocity.y = monster.vy;
      } else {
        const m = new Monster(this.scene, monster.x, monster.y, monster.id);
        m.setup(this.scene, this.createLaser);
        m.rotation = monster.rotation;
        m.body.velocity.x = monster.vx;
        m.body.velocity.y = monster.vy;
        m._numRand = monster.numRand;
        m._numUpdates = monster.numUpdates;
        m.catchUp();
        this._monsterGroup.add(m);
      }
    }
  }
  _handlePlayerDead(remotePlayer) {
    _.forEach(this.remotePlayers.getChildren(), player => {
      if (player && player.id === remotePlayer.id) {
        player.destroy();
      }
    });
  }
  _handleDeadMonster(data) {
    _.forEach(this._monsterGroup.getChildren(), monster => {
      if (monster && monster.id === data.id) {
        monster.destroy();
      }
    });
  }
}
