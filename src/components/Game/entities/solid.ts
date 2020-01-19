
import Entity from "./entity";
import * as Const from "../constants";

class Solid extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y, "playersheet", 0);
  }

  setup(scene) {
    super.setup(scene);
  }

  update() {

  }

}

export default Solid;
