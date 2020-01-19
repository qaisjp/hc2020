import Entity from "./entity";
import * as Const from "../constants";


const JUMP_VEL = 300
const DRAG = 1300

class Monster extends Entity {
  id: string;
  _rand: any;
  _numUpdates: number;
  _numRand: number;

  constructor(scene, x, y, id = "local") {
    super(scene, x, y, "playersheet", 0);
    this.id = id;
    this._rand = new Phaser.Math.RandomDataGenerator(this.id);
    this._numUpdates = 0;
    this._numRand = 0;
    this._addAnimations([{ name: "walk", frames: [1, 2, 3] }], 8, true);
  }

  setup(scene) {
    super.setup(scene);
    this.setCollideWorldBounds(false);
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      //   body.maxVelocity.set(10, 10 * 10);
      body.setDrag(DRAG, DRAG);
      body.setMaxSpeed(JUMP_VEL);
      body.setSize(body.width - 2, body.height);
    }
  }

  update() {
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      if (this._numUpdates % 60 == 0) {
        this._numUpdates = 0;
        var rand = this._rand();
        this._numRand = this._numRand + 1;

        if (rand < 1 / 5) {
          body.setVelocityX(-JUMP_VEL)
        } else if (rand < 2 / 5) {
          body.setVelocityX(-JUMP_VEL)
        } else if (rand < 3 / 5) {
          body.setVelocityY(JUMP_VEL)
        } else if (rand < 4 / 5) {
          body.setVelocityY(-JUMP_VEL)
        } //else {

        //}
      }
      this._numUpdates = this._numUpdates + 1;
    }
  }
}

export default Monster;
