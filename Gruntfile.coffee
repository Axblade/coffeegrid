module.exports = (grunt) ->
  grunt.initConfig {
    pkg: grunt.file.readJSON('package.json')

  }

  grunt.loadNpmTasks('grunt-contrib-coffee')

  grunt.loadNpmTasks('grunt-contrib-less')

  runt.loadNpmTasks('grunt-contrib-watch')
