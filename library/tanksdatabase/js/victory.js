var victory = function(){
};
	victory.prototype = {
		preload: function(){
			game.load.image('background', 'library/tanksdatabase/assets/tanks/background.jpg');
		},
		create: function(){
			game.add.sprite(0,0,'background');
			var victoryText = game.add.text(250,100,'You won the game!', { font: "20px Arial", fill: "#ffffff", align: "left" });
			var victoryText2 = game.add.text(250,200,'Click here to start again!', { font: "20px Arial", fill: "#ffffff", align: "left" });
			
			victoryText2.inputEnabled = true;
			
			victoryText2.events.onInputUp.add(restartGame);
			
			function restartGame(){
				game.state.start('gameFile');
			}
		}
	};