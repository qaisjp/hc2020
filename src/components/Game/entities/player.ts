/*
 * ===========================================================================
 * File: player.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

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

class Player extends Entity {
  id: string;
  jumpReleased: boolean;
  _prevFacing: number;
  _jumping: boolean;
  _grounded: boolean;
  _sprinting: boolean;
  _turning: boolean;
  _moving: never[];
  cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  _velocity: any;
  _accel: any;
  _clickDown: boolean;
  createSpear: Function | undefined;
  isPlayer: boolean;
  hasSpear: boolean
  constructor(scene, x, y, id = "local", isPlayer = false, createSpear : Function | undefined = undefined) {
    super(scene, x, y, "playersheet", 0, /** Const.PLAYER_ACCEL */ 1);
    this.id = id;
    this.isPlayer = isPlayer;
    // this.maxSpeed = Const.PLAYER_MAX_SPEED;
    // this.currentState = PlayerStates.IDLE;
    this.jumpReleased = true;
    this.facing = Phaser.RIGHT;

    this._prevFacing = this.facing;
    this._jumping = false;
    this._grounded = false;
    this._sprinting = false;
    this._turning = false;
    this._moving = [];
    this._clickDown = false;
    this.createSpear = createSpear;
    this.hasSpear = true;
    this._addAnimations([{ name: "walk", frames: [1, 2, 3] }], 8, true);
  }

  setup(scene) {
    super.setup(scene);
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.setCollideWorldBounds(false);
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      this._velocity = body.velocity;
      this._accel = body.acceleration;
      //   body.maxVelocity.set(10, 10 * 10);
      body.setDrag(1200, 1200);
      body.setMaxSpeed(300);
      body.setSize(body.width - 2, body.height);
    }
  }

  update() {
    if (this.cursors && this.body && this.isPlayer) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      const pointer = this.scene.input.activePointer;
      const directionRad = Phaser.Math.Angle.Between(
        body.x,
        body.y,
        pointer.x + this.scene.cameras.main.scrollX,
        pointer.y + +this.scene.cameras.main.scrollY
      );
      if (pointer.isDown) {
        this._clickDown = true;
      } else if (this._clickDown && this.createSpear && this.hasSpear) {
        this.createSpear()
        this.hasSpear = false;
        this._clickDown = false;
      } else {
        this._clickDown = false;
      }
      // const directionRad = 0
      const direction = (directionRad / (2 * Math.PI)) * 360;
      // const direction = Math.atan((pointer.x - body.x) / (pointer.y - body.y)) / (2 * Math.PI) * 360;
      //some light randomness to the bullet angle
      // Calculate X and y velocity of bullet to moves it from shooter to target
      // if (pointer.y >= this.y) {
      //   this.xSpeed = this.speed * Math.sin(this.direction);
      //   this.ySpeed = this.speed * Math.cos(this.direction);
      // } else {
      //   this.xSpeed = -this.speed * Math.sin(this.direction);
      //   this.ySpeed = -this.speed * Math.cos(this.direction);
      // }
      body.rotation = direction; // angle bullet with shooters rotation
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
    // this._updateAnimations();
    // this._grounded = this.body.onFloor() || this.body.touching.down;

    // if (this._moving[Phaser.LEFT] ) {
    //     this._accel.x = -this.moveSpeed;
    // } else if (this._moving[Phaser.RIGHT]) {
    //     this._accel.x = this.moveSpeed;
    // } else {
    //     // set back to idle state if we are completely still and on the ground
    //     this._accel.x = 0;
    //     if (this._velocity.x === 0 && this._grounded) {
    //         this.currentState = PlayerStates.Idle;
    //     }
    // }

    // // check if we are turning sharply
    // if (this._grounded && !this._turning) {
    //     if ( (this._velocity.x < -Const.PLAYER_MAX_SPEED*0.6 && this._accel.x > 0) ||
    //          (this._velocity.x > Const.PLAYER_MAX_SPEED*0.6 && this._accel.x < 0) ) {
    //         this._turning = true;
    //         this.currentState = PlayerStates.Turning;
    //     }
    // }

    // // if we are on the ground and moving at all set
    // // the player state to walking. we need this as if we land from
    // // a jump still moving horizontally it needs to look like player
    // // is running to a halt.
    // if (Math.abs(this._velocity.x) > 0 && this._grounded && !this._turning) {
    //     this.currentState = PlayerStates.Walking;
    // }

    // // if we land on the ground while jumping, we are clearly
    // // not jumping anymore
    // if (this._grounded && this._jumping && !this._turning) {
    //     this._jumping = false;
    //     this.currentState = PlayerStates.Idle;
    // }

    // // perform variable jump height check
    // if (this._jumping && this.jumpReleased) {
    //     if (this._velocity.y < Const.PLAYER_JUMP_SPEED/4) {
    //         this._velocity.y = Const.PLAYER_JUMP_SPEED/4;
    //     }
    // }

    // // cap player fall speed
    // this._velocity.y = Math.min(this._velocity.y, Const.PLAYER_MAX_FALL_SPEED);
  }

  jump() {
    // if (this._grounded && !this._jumping && this.jumpReleased) {
    //     // we have not released the key yet
    //     this.jumpReleased = false;
    //     // set the appropriate state
    //     this._jumping = true;
    //     this._turning = false;
    //     this.currentState = PlayerStates.Jumping;
    //     this._velocity.y = Const.PLAYER_JUMP_SPEED;
    //     this.game.jumpSound.play();
    // }
  }

  sprint(active) {
    // if (!this._jumping && Math.abs(this._accel.x) > 0 && active) {
    //     this.body.maxVelocity.x = Const.PLAYER_MAX_SPRINT_SPEED;
    // } else if (!active) {
    //     this.body.maxVelocity.x = this.maxSpeed;
    // }
    // this._sprinting = active;
  }

  move(direction, active) {
    // this._turning = false;
    // this._moving[direction] = active;
    // // if we are currently jumping then don't change our
    // // facing direction and don't play the walking animation
    // if (!this._jumping) {
    //     this.currentState = PlayerStates.Walking;
    //     this.facing = direction;
    // }
  }

  _updateAnimations() {
    // flip the player in the correct facing direction and play
    // the current state animation
    // if (this.facing !== this._prevFacing) {
    //     this.flip();
    //     this._prevFacing = this.facing;
    // }
    // switch (this.currentState) {
    //     case PlayerStates.Walking:
    //         // set the walking / running animation based on the current x velocity
    //         let currentAnim = this.animations.currentAnim;
    //         let delay = Math.min(200, (Const.PLAYER_MAX_SPEED / (Math.abs(this._velocity.x) / 80)));
    //         currentAnim.delay = delay;
    //         this.animations.play('walk');
    //         break;
    //     case PlayerStates.Jumping:
    //         this.frame = 5;
    //         break;
    //     case PlayerStates.Turning:
    //         this.frame = 4;
    //         break;
    //     case PlayerStates.Idle: // jshint ignore:line
    //     default:
    //         this.frame = 0;
    //         break;
    // }
  }
}

export default Player;
