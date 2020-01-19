import Phaser from "phaser";

export default class Door extends Phaser.GameObjects.Group {
  x: number;
  y: number;
  opened: boolean;
  top: Phaser.GameObjects.Rectangle;
  bottom: Phaser.GameObjects.Rectangle;
  type: string;
  constructor(scene, x, y, type = "left") {
    super(scene);
    this.x = x;
    this.y = y;
    this.scene = scene;
    this.opened = false;
    this.top = new Phaser.GameObjects.Rectangle(scene, this.x, this.y - 60, 10, 60, 0xffffff);
    this.top.setOrigin(0.5, 0.0);
    this.bottom = new Phaser.GameObjects.Rectangle(scene, this.x, this.y + 60, 10, 60, 0xffffff);
    this.bottom.setOrigin(0.5, 1.0);
    this.type = type;
  }

  setup(scene: Phaser.Scene) {
    this.add(this.top);
    scene.add.existing(this.top);
    this.add(this.bottom);
    scene.add.existing(this.bottom);
  }
  openImmediate() {
    if (this.type === "left") {
      this.bottom.rotation = Math.PI / 2;
      this.top.rotation = -Math.PI / 2;
    } else if (this.type === "right") {
      this.bottom.rotation = -Math.PI / 2;
      this.top.rotation = Math.PI / 2;
    }
    this.opened = true;
  }

  open() {
    if (this.type === "left") {
      this.scene.tweens.add({
        targets: this.bottom,
        rotation: Math.PI / 2
      });
      this.scene.tweens.add({
        targets: this.top,
        rotation: -Math.PI / 2
      });
    } else if (this.type === "right") {
      this.scene.tweens.add({
        targets: this.bottom,
        rotation: -Math.PI / 2
      });
      this.scene.tweens.add({
        targets: this.top,
        rotation: Math.PI / 2
      });
    }
    this.opened = true;
  }

  close() {
    this.scene.tweens.add({
      targets: this.top,
      rotation: 0
    });
    this.scene.tweens.add({
      targets: this.bottom,
      rotation: 0
    });
    this.opened = false;
  }

  _addAnimations(anims, frameRate = 60, loop = false) {}
}
