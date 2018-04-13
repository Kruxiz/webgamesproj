var help = function(){
};
help.prototype = {
		preload: function(){
			game.load.image('background', 'assets/tanks/background.jpg');
		},
		create: function(){
			game.add.sprite(0,0,'background');
			var mainText = game.add.text(250,100,'These are the instructions for Tanks.', { font: "20px Arial", fill: "#ffffff", align: "left" });
			var mainText2 = game.add.text(250,200,'Click here to go back to the main menu', { font: "20px Arial", fill: "#ffffff", align: "left" });
			var mainText3 = game.add.text(250, 300,'Arrow keys to move, left click to fire', { font: "20px Arial", fill: "#ffffff", align: "left" });
			var mainText4 = game.add.text(250,400,'Get to 200 score and kill all of the enemy tanks to win!', { font: "20px Arial", fill: "#ffffff", align: "left" });
			
			mainText2.inputEnabled = true;
			
			mainText2.events.onInputUp.add(backToMain);
			
			function backToMain(){
				game.state.start('mainMenu');
			}
		}
	};