import Phaser from "phaser";

const MIN_SPEED = 200;
const DRAG = 1000;
const INIT_SPEED = 1500;

class Spear extends Phaser.Physics.Arcade.Sprite {
  id: string;
  _angle: number;
  _velocity: any;
  _initSpeed: number;
  _maxSpeed: number;
  _enemyHit: boolean;
  _wallHit: boolean;
  constructor(scene, x, y, id = "local", key, frame, angle = 0) {
    super(scene, x, y, key, frame);

    this.id = id;
    this._angle = angle;
    this._initSpeed = INIT_SPEED;
    this._maxSpeed = 6000;
    this._enemyHit = false;
    this._wallHit = false;
  }

  setup(scene: Phaser.Scene, group: Phaser.GameObjects.Group, initSpeedBoost = [0, 0]) {
    scene.physics.world.enable(this);
    scene.add.existing(this);
    group.add(this);
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.rotation = this._angle / (2 * Math.PI) * 360
      var speed = this._initSpeed;
      body.setVelocity(
        speed * Math.cos(this._angle),
        speed * Math.sin(this._angle)
      );
      // body.setAcceleration(accel * Math.cos(this._angle), accel * Math.sin(this._angle))
      body.setDrag(
        Math.abs(DRAG * Math.cos(this._angle)),
        Math.abs(DRAG * Math.sin(this._angle))
      );
      this._velocity = body.velocity;
      body.setMaxSpeed(this._maxSpeed);
      // body.drag.set(1, 0);
      body.setSize(body.width - 2, body.height);
    }
  }

  update() {
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      if (this._enemyHit) {
        var speed = body.maxSpeed;
        body.setVelocityX(speed * Math.cos(this._angle));
        body.setVelocityY(speed * Math.sin(this._angle));
      } else if (this._wallHit) {
        body.setVelocityX(0);
        body.setVelocityY(0);
        body.setImmovable();
      } else {
        if (body.speed < MIN_SPEED) {
          body.setVelocityX(MIN_SPEED * Math.cos(this._angle));
          body.setVelocityY(MIN_SPEED * Math.sin(this._angle));
        }
        this._velocity = body.velocity;
      }
    }
  }

  _addAnimations(anims, frameRate = 60, loop = false) {
    // for (var i = 0, l = anims.length; i < l; ++i) {
    //     let anim = anims[i];
    //     // this.animations.add(anim.name, anim.frames, frameRate, loop);
    // }
  }
}

export default Spear;
