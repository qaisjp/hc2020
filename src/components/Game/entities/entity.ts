import Phaser from "phaser";

class Entity extends Phaser.Physics.Arcade.Sprite {
  constructor(game, x, y, key, frame) {
    super(game, x, y, key, frame);
  }

  setup(scene: Phaser.Scene) {
    // scene.physics.enable(this, Phaser.Physics.Arcade);
    // this.anchor.set(0.5, 0.5);
    scene.physics.world.enable(this);
    scene.add.existing(this);
  }

  pause() {
    // this.animations.currentAnim.paused = true;
    // this.body.enable = false;
  }

  resume() {
    // this.animations.currentAnim.paused = false;
    // this.body.enable = true;
  }

  flip() {
    // this.scale.x = dir;
  }

  _addAnimations(anims, frameRate = 60, loop = false) {
    // for (var i = 0, l = anims.length; i < l; ++i) {
    //     let anim = anims[i];
    //     // this.animations.add(anim.name, anim.frames, frameRate, loop);
    // }
  }
}

export default Entity;
