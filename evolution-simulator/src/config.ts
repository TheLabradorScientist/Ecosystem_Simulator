import { GameScene } from './scenes/game-scene';

export const GameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Evolution Simulator',
  //url: 'https://github.com/digitsensitive/phaser3-typescript',
  //version: '0.0.1',
  //zoom: 3,
  type: Phaser.AUTO,
  parent: 'game',
  scene: [GameScene],
  //scene: [BootScene, MenuScene, GameScene, HUDScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  backgroundColor: '#008763',
};
