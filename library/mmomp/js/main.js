var game = new Phaser.Game(64*32, 30*32, Phaser.AUTO, "gameDiv");
game.state.add('game',Game);
game.state.start('game');