import Phaser from "phaser"

import Wall, {WallThickness} from './wall';
import VerticalDoor from './verticalDoor';
import HorizontalDoor from './horizontalDoor';

export default class Arena {
    x: number;
    y: number;
    _blockGroup: Phaser.Physics.Arcade.StaticGroup;
    doors: any[]
    constructor(scene : Phaser.Scene, x: number, y: number) {
        this.x = x;
        this.y = y;
        this._blockGroup = scene.physics.add.staticGroup();
        this.doors = []
    }

    setup(scene : Phaser.Scene) {
        const wallunit = 250;
        const thick = WallThickness / 2;
        const bits = [
          { x: this.x, y: this.y, length: wallunit * 2, angle: 90 }, // bottom
          { x: this.x + wallunit, y: this.y - wallunit / 2 + thick, length: wallunit, angle: 0 }, // bottom right
          { x: this.x + wallunit * 1.5 - thick, y: this.y - wallunit + thick, length: wallunit, angle: 90 }, // right bottom
          { x: this.x + wallunit * 2 - thick, y: this.y - wallunit * 2 + WallThickness, length: wallunit * 2, angle: 0 }, // right
          { x: this.x + wallunit * 1.5, y: this.y - wallunit * 3 + WallThickness, length: wallunit, angle: 90 }, // right top
          { x: this.x + wallunit, y: this.y - wallunit * 3.5 + WallThickness * 1.5, length: wallunit, angle: 0 }, // top right
          { x: this.x, y: this.y - wallunit * 4 + thick * 4, length: wallunit * 2, angle: 90 }, // top
          { x: this.x - wallunit, y: this.y - wallunit * 3.5 + WallThickness * 1.5, length: wallunit, angle: 0 }, // top left
          { x: this.x - wallunit * 1.5, y: this.y - wallunit * 3 + WallThickness, length: wallunit, angle: 90 }, // left top
          { x: this.x - wallunit * 2 + thick, y: this.y - wallunit * 2 + WallThickness, length: wallunit * 2, angle: 0 }, // left
          { x: this.x - wallunit * 1.5 + thick, y: this.y - wallunit + thick, length: wallunit, angle: 90 }, // left bottom
          { x: this.x - wallunit, y: this.y - wallunit / 2 + thick, length: wallunit, angle: 0 } // bottom left
        ];

        for (const b of bits) {
            const wall = new Wall(scene, b.x, b.y, b.length, b.angle);
            wall.setup(scene, this._blockGroup);
            this._blockGroup.add(wall);
        }
        const left_door = new VerticalDoor(scene, this.x - wallunit * 2 + thick, this.y - wallunit * 2 + WallThickness, 'left');
        left_door.setup(scene);
        const right_door= new VerticalDoor(scene, this.x + wallunit * 2 - thick, this.y - wallunit * 2 + WallThickness, 'right');
        right_door.setup(scene);
        const top_door = new HorizontalDoor(scene, this.x, this.y - wallunit * 4 + thick * 4, 'top');
        top_door.setup(scene);
        const bottom_door= new HorizontalDoor(scene, this.x, this.y, 'bottom');
        bottom_door.setup(scene);
        this.doors.push(left_door, right_door, top_door, bottom_door)
    }
}