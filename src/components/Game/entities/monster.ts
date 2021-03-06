import Entity from "./entity";
import * as Const from "../constants";

const DRAG = 1200;
const JUMP_VEL = 300;
const UPDATE_RATE = 30;
const FIRE_RATE = .15;

class Monster extends Phaser.Physics.Arcade.Sprite {
  id: string;
  isHit: boolean;
  createLaser: Function | undefined;
  _rand: Phaser.Math.RandomDataGenerator;
  _numUpdates: number;
  _numRand: number;
  playingHit: boolean;

  constructor(scene, x, y, id) {
    super(scene, x, y, "monster", 0);
    this.scene.anims.create({
      key: "walk",
      frames: [
        { key: "monster", frame: "pixil-frame-0.png" },
        { key: "monster", frame: "pixil-frame-1.png" }
      ],
      frameRate: 2,
      repeat: -1
    });
    this.scene.anims.create({
      key: "appear",
      frames: [
        { key: "monster", frame: "pixil-frame-2.png" },
        { key: "monster", frame: "pixil-frame-3.png" },
        { key: "monster", frame: "pixil-frame-4.png" },
        { key: "monster", frame: "pixil-frame-5.png" },
      ],
      frameRate: 6,
      repeat: 0
    });
    this.scene.anims.create({
      key: "death",
      frames: [
        { key: "monster", frame: "pixil-frame-7.png" },
        { key: "monster", frame: "pixil-frame-8.png" },
        { key: "monster", frame: "pixil-frame-9.png" },
        { key: "monster", frame: "pixil-frame-10.png" },
      ],
      frameRate: 6,
      repeat: 0
    });
    this.id = id;
    this.isHit = false;
    this._rand = new Phaser.Math.RandomDataGenerator([id]);
    this._numUpdates = 0;
    this.playingHit = false;
    this._numRand = 0;
  }

  setup(scene, createLaser) {
    this.setScale(0.3, 0.3);
    this.anims.play("appear");
    this.scene.time.delayedCall(666, f => {
      this.anims.play("walk")
    });
    this.createLaser = createLaser;
    scene.physics.world.enable(this);
    scene.add.existing(this);
    // this.setCollideWorldBounds(false);
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      //   body.maxVelocity.set(10, 10 * 10);
      body.setDrag(DRAG, DRAG);
      body.setMaxSpeed(JUMP_VEL);
      body.setSize(body.width - 2, body.height);
    }
  }

  catchUp() {
    for (const _ of [...Array(this._numRand).keys()]) {
      this._rand.frac();
    }
  }

  update() {
    if (this.body) {
      if (this.isHit && !this.playingHit) {
        this.anims.play("death")
        this.playingHit = true
        return;
      }
      const body = this.body as Phaser.Physics.Arcade.Body;
      if (this._numUpdates % UPDATE_RATE === 0) {
        this._numUpdates = 0;
        var rand = this._rand.frac();
        this._numRand = this._numRand + 1;

        var walk_rate = 1.0 - FIRE_RATE;
        if (rand < walk_rate / 4.0) {
          body.setVelocityX(-JUMP_VEL);
        } else if (rand < (2 * walk_rate) / 4.0) {
          body.setVelocityX(JUMP_VEL);
        } else if (rand < (3 * walk_rate) / 4.0) {
          body.setVelocityY(JUMP_VEL);
        } else if (rand < walk_rate) {
          body.setVelocityY(-JUMP_VEL);
        } else if (this.createLaser) {
          this.createLaser(this);
        }
      }
      this._numUpdates = this._numUpdates + 1;
    }
  }
}

export default Monster;
