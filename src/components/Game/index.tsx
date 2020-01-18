import React, { useRef, useEffect, useState } from "react";
import Phaser from "phaser";
import logoImg from "../../imgs/img.jpg";
import LevelManager from "./levelManager";

class MyScene extends Phaser.Scene {
  manager: LevelManager | undefined;
  constructor() {
    super("MyScene");
  }
  preload() {
    this.load.image("logo", logoImg);
    this.load.bitmapFont("plumber_bros", "res/fonts/plumber_bros.png", "res/fonts/plumber_bros.xml");
  }

  update() {
    if (this.manager) {
      this.manager.update();
    }
  }

  create() {
    // const logo = this.add.image(800, 600, "logo");
    // this.tweens.add({
    //   targets: logo,
    //   y: 450,
    //   duration: 2000,
    //   ease: "Power2",
    //   yoyo: true,
    //   loop: -1
    // });
    this.manager = new LevelManager(this.game, this);
  }
}

const Game = () => {
  useEffect(() => {
    let game;

    window.addEventListener("resize", () => {
      game.scale.resize(window.innerWidth, window.innerHeight);
    });

    const config = {
      type: Phaser.AUTO,
      parent: "phaser-example",
      width: 1920,
      height: 1080,
      scene: MyScene,
      scale: {
        mode: Phaser.Scale.NONE
      },
      physics: {
        default: "arcade",
        arcade: {
          debug: true
        }
      }
    };

    game = new Phaser.Game(config);

    return () => {};
  }, []);

  return <div id="phaser-example"></div>;
};

export default Game;
