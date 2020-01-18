import Phaser from "phaser"

export const WallThickness = 10

export default class Wall extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, length, angle) {
        super(scene, x, y, length, WallThickness);
        this.angle = angle;
    }

    setup(scene : Phaser.Scene, group: Phaser.Physics.Arcade.StaticGroup) {
        console.log("wall setup")
        // scene.physics.world.enable(this);
        // group.add(this)
        scene.add.existing(this);
    }

    pause() {
    }

    resume() {
    }

    _addAnimations(anims, frameRate = 60, loop = false) {
    }

    update() {
    }
}