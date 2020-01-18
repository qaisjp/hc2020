import Phaser from "phaser"

export const WallThickness = 10

export default class Wall extends Phaser.GameObjects.Rectangle {

    constructor(scene, x, y, length, angle) {
        super(scene, x, y, length, WallThickness, 0xffffff, 1);
        this.angle = angle;
    }

    setup(scene : Phaser.Scene) {
        console.log("wall setup")
        scene.physics.world.enable(this);
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