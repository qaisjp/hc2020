import Phaser from "phaser";

export default class Door extends Phaser.GameObjects.Group {
  x: number;
  y: number;
  opened: boolean;
  left: Phaser.GameObjects.Rectangle;
  right: Phaser.GameObjects.Rectangle;
  type: string;
  constructor(scene, x, y, type = "bottom") {
    super(scene);
    this.x = x;
    this.y = y;
    this.scene = scene;
    this.opened = false;
    this.left = new Phaser.GameObjects.Rectangle(scene, this.x - 60, this.y, 60, 10, 0xffffff);
    this.left.setOrigin(0, 0.5);
    this.right = new Phaser.GameObjects.Rectangle(scene, this.x + 60, this.y, 60, 10, 0xffffff);
    this.right.setOrigin(1.0, 0.5);
    this.type = type;
  }

  setup(scene: Phaser.Scene) {
    this.add(this.left);
    scene.add.existing(this.left);
    this.add(this.right);
    scene.add.existing(this.right);
  }
  openImmediate() {
    this.opened = true;
    if (this.type === "bottom") {
      this.right.rotation = Math.PI / 2;
      this.left.rotation = -Math.PI / 2;
    } else if (this.type === "top") {
      this.right.rotation = -Math.PI / 2;
      this.left.rotation = Math.PI / 2;
    }
  }
  open() {
    this.opened = true;
    if (this.type === "bottom") {
      this.scene.tweens.add({
        targets: this.right,
        rotation: Math.PI / 2
      });
      this.scene.tweens.add({
        targets: this.left,
        rotation: -Math.PI / 2
      });
    } else if (this.type === "top") {
      this.scene.tweens.add({
        targets: this.right,
        rotation: -Math.PI / 2
      });
      this.scene.tweens.add({
        targets: this.left,
        rotation: Math.PI / 2
      });
    }
  }
  close() {
    this.opened = false;
    this.scene.tweens.add({
      targets: this.left,
      rotation: 0
    });
    this.scene.tweens.add({
      targets: this.right,
      rotation: 0
    });
    this.opened = false;
  }

  resume() {}

  _addAnimations(anims, frameRate = 60, loop = false) {}
}
