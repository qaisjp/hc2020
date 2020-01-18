
/*
 * ===========================================================================
 * File: player.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

import Entity from "./entity";
import * as Const from "../constants";

class Solid extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y, "playersheet", 0, /** Const.PLAYER_ACCEL */ 1);
  }

  setup(scene) {
    super.setup(scene);
  }

  update() {

  }

}

export default Solid;
