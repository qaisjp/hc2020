import Entity from "./entity";
import * as Const from "../constants";

class Monster extends Phaser.Physics.Arcade.Sprite {
  id: string;
  isHit: boolean;
  constructor(scene, x, y, id = "local") {
    super(scene, x, y, "playersheet", 0);
    this.id = id;
    this.isHit = false;
  }

  setup(scene) {
    scene.physics.world.enable(this);
    scene.add.existing(this);
    // this.setCollideWorldBounds(false);
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      //   body.maxVelocity.set(10, 10 * 10);
      body.setDrag(1200, 1200);
      body.setMaxSpeed(300);
      body.setSize(body.width - 2, body.height);
    }
  }

  update() {
    
  }
}

export default Monster;
