'use strict';

angular
  .module('swapiApp')

  .service('swapiService', ["$http", function($http){
    this.planets = [];
    this.residents = {};

    this.populatePlanets = function(url){
      return $http.get(url)
    }

    this.updatePlanets = (planets) => {
      if (this.planets.length){
       this.planets = this.planets.concat(planets);
      } else {
        this.planets = planets;
      }
      console.log('service planets', this.planets);
    }

    this.getResidentInfo = function(url){
      return $http.get(url)
    }

  }])
