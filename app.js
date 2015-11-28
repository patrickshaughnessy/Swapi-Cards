'use strict';

angular.module('swapiApp', [])

.controller('mainCtrl', ["$scope", function($scope){
  $scope.greet = "hello"

  $scope.planets = [];
  $scope.residents = [];

  $scope.planetId;

  $scope.getPlanetId = function(planet){
    var url = planet.url.split('/');
    var id = url[url.length-2];
    return id;
  }

  $scope.getResidentId = function(resident){
    console.log(resident);
    var url = resident.split('/');
    var id = url[url.length-2];
    return id
  }

  $scope.$on('PLANETS', function(a, b){
    $scope.planets = $scope.planets.concat(b);
  });

  $scope.$on('GOTOPLANET', function(a, b){
    $scope.planetId = $scope.getPlanetId($scope.planets[b]);
    $scope.residents = $scope.planets[b].residents.map(function(resident){
      return $scope.getResidentId(resident);
    });
    console.log('inside go to ', $scope.planets[b])
    $scope.$broadcast('SENDNAME', $scope.planets[b])

  })

}])

.directive('swapiPlanetsSelector', function(){
  return {
    scope: {
      minResidents: "@minResidents"
    },
    templateUrl: "templates/planet-selector.html",
    controller: ["$scope", "$http", function($scope, $http){
      var swapiPlanetsUrl = 'http://swapi.co/api/planets/';

      var populatePlanets = function(url){
        $http.get(url).then(function(res){
          // console.log(res.data.results);
          var planets = res.data.results.filter(function(planet){
            if (planet.residents.length >= $scope.minResidents) return planet;
          })
          // console.log(planets);
          $scope.$emit('PLANETS', planets)

          var planetNames = planets.map(function(planet){
            return planet.name;
          })

          $scope.planetsWithResidents = $scope.planetsWithResidents ? $scope.planetsWithResidents.concat(planetNames) : planetNames

          if (res.data.next) {
            populatePlanets(res.data.next);
          }
        });
      }

      populatePlanets(swapiPlanetsUrl);

      $scope.goToPlanet = function(planet){
        $scope.$emit('GOTOPLANET', planet);
      }
    }]
  }
})

.directive('swapiPlanet', function(){
  return {
    transclude: true,
    scope: {
      id: '@id'
    },
    templateUrl: 'templates/planet.html',
    controller: ["$scope", "$http", function($scope, $http){

      $scope.$on('SENDNAME', function(a, b){
        $scope.planetName = b.name;
        $scope.terrain = b.terrain;
        // $scope.population = b.population.toString().replace(/(0{3}){0,}(000$)/g, function(match, p1, p2){
        //   if (p1) {
        //     return ',' + p1 + ',' + p2;
        //   } else {
        //     return ',' + p2;
        //   }
        // });
        $scope.population = b.population.toString().replace(/(0{3}){0,}(000$)/g, function(match, p1, p2){
          if (p1) {
            return ',' + p1 + ',' + p2;
          } else {
            return ',' + p2;
          }
        });
      })

      // var getPlanetInfo = function(url){
      //   $http.get(url).then(function(res){
      //     console.log(res.data);
      //     // $scope.planetName = res.data.name;
      //     // $scope.terrain = res.data.terrain;
      //     // $scope.population = res.data.population;
      //   });
      // }

      // $scope.$watch('id', function(newVal){
      //   console.log('inside watch', $scope.id, swapiPlanetsUrl);
      //   var swapiPlanetsUrl = 'http://swapi.co/api/planets/' + $scope.id;
      //   getPlanetInfo(swapiPlanetsUrl);
      // });

    }]
  }
})

.directive('swapiResident', function(){
  return {
    scope: {
      id: '@id'
    },
    templateUrl: 'templates/resident.html',
    controller: ["$scope", "$http", function($scope, $http){
      console.log('inside resident', $scope.id);
      var swapiResidentUrl = 'http://swapi.co/api/people/' + $scope.id;

      var getResidentInfo = function(url){
        $http.get(url).then(function(res){
          console.log(res.data);
          $scope.resident = res.data
          $scope.residentModalId = res.data.name.split(' ')[0];
        });
      }

      getResidentInfo(swapiResidentUrl);

      $scope.beautifyKey = function(key){
        key = key[0].toUpperCase() + key.slice(1);
        return key.replace(/_/, ' ');
      }

    }]
  }
})
