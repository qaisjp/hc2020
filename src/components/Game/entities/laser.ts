import Phaser from "phaser";

const INIT_SPEED = 1500;


class Laser extends Phaser.Physics.Arcade.Sprite {
  id: string;
  _angle: number;
  _velocity: any;
  _initSpeed: number;
  constructor(scene: Phaser.Scene, x, y, id, angle = 0) {
    super(scene, x, y, "laser", 0);
    this.id = id;
    this._angle = angle;
    this._initSpeed = INIT_SPEED;
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
      this._velocity = body.velocity;
    }
  }

  update() {
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.rotation = (this._angle / (2 * Math.PI)) * 360 + 90;

    }
  }

  _addAnimations(anims, frameRate = 60, loop = false) {
    // for (var i = 0, l = anims.length; i < l; ++i) {
    //     let anim = anims[i];
    //     // this.animations.add(anim.name, anim.frames, frameRate, loop);
    // }
  }
}

export default Laser;
