
import Phaser from "phaser"
import * as Const from "../constants"

export class TextLabel extends Phaser.GameObjects.BitmapText {
    constructor(game, x, y, text, parent : any = null, fixedToCam = false, centerText = true,
            align = 1, size = 8) {
        super(game, x, y, Const.GAME_FONT, text, size);

        if (parent) {
            parent.add(this);
        }

        this.align = align;
    }
}
