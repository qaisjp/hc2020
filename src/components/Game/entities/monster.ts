import Entity from "./entity";
import * as Const from "../constants";

class Monster extends Entity {
  id: string;
  constructor(scene, x, y, id = "local") {
    super(scene, x, y, "playersheet", 0);
    this.id = id;
    this._addAnimations([{ name: "walk", frames: [1, 2, 3] }], 8, true);
  }

  setup(scene) {
    super.setup(scene);
    this.setCollideWorldBounds(false);
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
