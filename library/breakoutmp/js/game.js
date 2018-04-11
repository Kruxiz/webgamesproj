var game = new Phaser.Game(800, 600, Phaser.AUTO, "gameDiv");
game.state.add("gameFile", gameFunc);
game.state.start("gameFile");
