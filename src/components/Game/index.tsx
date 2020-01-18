import React, { useRef, useEffect, useState } from 'react'
import Phaser from "phaser";
import logoImg from "../../imgs/img.jpg";

function preload() {
  this.load.image("logo", logoImg);
}

function create() {
  const logo = this.add.image(800, 600, "logo");

  this.tweens.add({
    targets: logo,
    y: 450,
    duration: 2000,
    ease: "Power2",
    yoyo: true,
    loop: -1
  });
}


const Game = () => {
  useEffect(() => {
    let game;

    window.addEventListener('resize', () => {
      game.scale.resize(window.innerWidth, window.innerHeight);
    })

    const config = {
      type: Phaser.AUTO,
      parent: "phaser-example",
      width: 1920,
      height: 1080,
      scene: {
        preload: preload,
        create: create
      },
      scale: {
        mode: Phaser.Scale.NONE
      }
    };

    game = new Phaser.Game(config);

    return () => {};
  }, [])

  return <div id="phaser-example"></div>;
}

export default Game
