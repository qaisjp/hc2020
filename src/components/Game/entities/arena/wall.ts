import Phaser from "phaser"

export const WallThickness = 10

export default class Wall extends Phaser.GameObjects.Rectangle {

    constructor(scene, x, y, length, angle) {
        if (angle !== 0) {
            super(scene, x, y, length, WallThickness, 0x535353);
        } else {
            super(scene, x, y, WallThickness, length, 0x535353);
        }
    }

    setup(scene : Phaser.Scene, group: Phaser.Physics.Arcade.StaticGroup) {
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