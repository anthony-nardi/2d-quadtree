'use strict';

module.exports = function(grunt) {

	grunt.loadNpmTasks( 'grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-browserify');

	grunt.initConfig({
		watch: {
		  app: {
		  	files: ['js/bundle.js', 'index.html', 'demos/index.html', 'demos/js/bundle.js', 'demos/css/styles.css'],
		    options: {
		      livereload: true
		    }
		  },
		  js: {
		  	files: ['js/main.js', 'js/quadtree.js'],
		  	tasks: ['browserify']
		  },
		  demos: {
		  	files: ['demos/js/main.js'],
		  	tasks: ['browserify']
		  },
		  space_game: {
		  	files: ['demos/space_game/js/main.js', 'demos/space_game/js/core/*.js', 'demos/space_game/js/models/*.js'],
		  	tasks: ['browserify']
		  },
		  space_game_2: {
		  	files: ['demos/space_game_2/js/main.js', 'demos/space_game_2/js/core/*.js', 'demos/space_game_2/js/models/*.js'],
		  	tasks: ['browserify']
		  }
		},
    	browserify: {
	      vendor: {
	        src: ['js/main.js'],
	        dest: 'js/bundle.js'
	      },
	      demos: {
	      	src: ['demos/js/main.js'],
	      	dest: 'demos/js/bundle.js'
	      },
	      space_game: {
	      	src: ['demos/space_game/js/main.js'],
	      	dest: 'demos/space_game/js/bundle.js'
	      },
	      space_game_2: {
	      	src: ['demos/space_game_2/js/main.js'],
	      	dest: 'demos/space_game_2/js/bundle.js'
	      }
	    }
	});

	grunt.registerTask('default', ['watch']);

};