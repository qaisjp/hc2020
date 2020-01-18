import Phaser from "phaser"

class Door extends Phaser.GameObjects.Sprite {
    constructor(game, x, y, key, frame, moveSpeed = 0) {
        super(game, x, y, key, frame);
    }

    setup(scene : Phaser.Scene) {
        scene.physics.world.enable(this);
        scene.add.existing(this);
    }

    pause() {
    }

    resume() {
    }

    _addAnimations(anims, frameRate = 60, loop = false) {
    }
}