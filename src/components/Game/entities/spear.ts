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
  _wallHit: boolean;
  _monstersHit: Phaser.GameObjects.Group
  constructor(scene : Phaser.Scene, x, y, id, angle = 0) {
    console.log("SPEAR:", x, y, angle);
    super(scene, x, y, "spear", 0);
    this.id = id;
    this._angle = angle;
    this._initSpeed = INIT_SPEED;
    this._maxSpeed = 6000;
    this._wallHit = false;
    this._monstersHit = scene.add.group()
  }

  setup(scene: Phaser.Scene, group: Phaser.GameObjects.Group) {
    scene.physics.world.enable(this);
    scene.add.existing(this);
    group.add(this);
    this.setSize(50, 50);
    this.setDisplaySize(40, 40);
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      // this.body.setSize(this.), 40);
      body.rotation = (this._angle / (2 * Math.PI)) * 360;
      var speed = this._initSpeed;
      body.setVelocity(speed * Math.cos(this._angle), speed * Math.sin(this._angle));
      // body.setAcceleration(accel * Math.cos(this._angle), accel * Math.sin(this._angle))
      body.setDrag(Math.abs(DRAG * Math.cos(this._angle)), Math.abs(DRAG * Math.sin(this._angle)));
      this._velocity = body.velocity;
      body.setMaxSpeed(this._maxSpeed);
      // body.drag.set(1, 0);
    }
  }

  update() {
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.rotation = (this._angle / (2 * Math.PI)) * 360 + 90;
      if (this._wallHit) {
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
      this._monstersHit.setXY(body.position.x, body.position.y)
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
