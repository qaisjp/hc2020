import Entity from "./entity";
import * as Const from "../constants";
import Spear from "./spear";

let PlayerStates = {
  Idle: 0,
  Walking: 1,
  Jumping: 2,
  Turning: 3,
  Ducking: 4
};

class Ghost extends Entity {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  constructor(scene, x, y, id = "local") {
    super(scene, x, y, "ghost", 0);
  }

  setup(scene) {
    super.setup(scene);
    this.setScale(0.2);
    this.setAlpha(0.5)
    this.cursors = this.scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
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
    if (this.cursors && this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      // const pointer = this.scene.input.activePointer;
      // const directionRad = Phaser.Math.Angle.Between(
      // const direction = Math.atan((pointer.x - body.x) / (pointer.y - body.y)) / (2 * Math.PI) * 360;
      //some light randomness to the bullet angle
      // Calculate X and y velocity of bullet to moves it from shooter to target
      // if (pointer.y >= this.y) {
      //   this.xSpeed = this.speed * Math.sin(this.direction);
      //   this.ySpeed = this.speed * Math.cos(this.direction);
      // } else {
      //   this.xSpeed = -this.speed * Math.sin(this.direction);
      //   this.ySpeed = -this.speed * Math.cos(this.direction);
      // } // angle bullet with shooters rotatio
      let localXAcceleration = 0;
      let localYAcceleration = 0;
      if (this.cursors.left && this.cursors.left.isDown) {
        localXAcceleration = -6000;
      } else if (this.cursors.right && this.cursors.right.isDown) {
        localXAcceleration = 6000;
      } else {
        localXAcceleration = 0;
      }

      if (this.cursors.down && this.cursors.down.isDown) {
        localYAcceleration = 6000;
      } else if (this.cursors.up && this.cursors.up.isDown) {
        localYAcceleration = -6000;
      } else {
        localYAcceleration = 0;
      }
      // const accelerationX = Math.sin(directionRad) * localXAcceleration + Math.cos(directionRad) * localYAcceleration;
      // const accelerationY = Math.cos(directionRad) * localXAcceleration + Math.sin(directionRad) * localYAcceleration;
      body.setAccelerationX(localXAcceleration);
      body.setAccelerationY(localYAcceleration);
    }
  }
}

export default Ghost;
