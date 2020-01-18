import Phaser from "phaser"

export default class Door extends Phaser.GameObjects.Group {
    x: number;
    y: number;
    open: boolean;
    left: Phaser.GameObjects.Rectangle;
    right: Phaser.GameObjects.Rectangle;
    constructor(scene, x, y) {
        super(scene);
        this.x = x;
        this.y = y;
        this.scene = scene;
        this.open = false;
        this.left = new Phaser.GameObjects.Rectangle(scene, this.x-30, this.y, 60, 10, 0xff0000);
        this.right = new Phaser.GameObjects.Rectangle(scene, this.x+30, this.y, 60, 10, 0xff0000);
    }

    setup(scene : Phaser.Scene) {
        this.add(this.left);
        scene.add.existing(this.left);
        this.add(this.right);
        scene.add.existing(this.right);

        scene.input.keyboard.on('keydown-O', () => {
            console.log('Hit!')
        });
    }

    pause() {
    }

    resume() {
    }

    _addAnimations(anims, frameRate = 60, loop = false) {
    }
}