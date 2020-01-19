import React, { useRef, useEffect, useState } from "react";
import Phaser from "phaser";
import logoImg from "../../imgs/img.jpg";
import spearImg from "../../imgs/spear_gray.png";
import malwareImg from "../../imgs/malware_gladiator.png";
import avastImg from "../../imgs/avast_logo_light.png";
import LevelManager from "./levelManager";

import './Game.scss';

class MyScene extends Phaser.Scene {
  manager: LevelManager | undefined;
  constructor() {
    super("MyScene");
  }
  preload() {
    this.load.image("logo", logoImg);
    this.load.image("spear", spearImg);
    this.load.image("avast", avastImg);
    this.load.image("malware", malwareImg);
    this.load.bitmapFont("plumber_bros", "res/fonts/plumber_bros_gray.png", "res/fonts/plumber_bros.xml");
    this.load.multiatlas('monster', 'res/monster.json', 'res');
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
    this.cameras.main.setBackgroundColor(0xFFFFFF)
    this.manager = new LevelManager(this.game, this);
  }
}

const Game = () => {
  useEffect(() => {
    let game;
    console.log(window.innerWidth);
    window.addEventListener('resize', () => {
      game.scale.resize(window.innerWidth, window.innerHeight);
    })
    const config = {
      type: Phaser.AUTO,
      parent: "phaser-example",
      width: 1920,
      height: 1080,
      scene: MyScene,
      scale: {
        mode: Phaser.Scale.NONE,
      },
      physics: {
        default: "arcade",
        arcade: {
          // debug: true
          fps: 60
        }
      }
    };

    game = new Phaser.Game(config);
    game.scale.resize(window.innerWidth, window.innerHeight);
    return () => {};
  }, []);

  return <div id="phaser-example"></div>;
};

export default Game;
