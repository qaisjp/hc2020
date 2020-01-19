import Phaser from "phaser"

import {WallThickness} from './wall';

class Arena {
    x: number;
    y: number;
    constructor(scene : Phaser.Scene, x: number, y: number) {
        this.x = x;
        this.y = y;
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
    }
}

export default Arena;