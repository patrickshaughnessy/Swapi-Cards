'use strict';

angular

  .module('swapiApp', ['ui.router'])

  .controller('mainCtrl', ["$scope", "swapiService", function($scope, swapiService){
    $scope.greet = "hello"

    // $scope.planets = [];
    // $scope.residents = [];

    $scope.planetId;

    $scope.getPlanetId = function(planet){
      var url = planet.url.split('/');
      var id = url[url.length-2];
      return id;
    }

    $scope.getResidentId = function(resident){
      var url = resident.split('/');
      var id = url[url.length-2];
      return id
    }

    $scope.$on('PLANETS', function(a, b){
      // $scope.planets = $scope.planets.concat(b);
      swapiService.updatePlanets(b);
      $scope.planets = swapiService.planets;
    });

    $scope.$on('GOTOPLANET', function(a, b){
      $scope.planetId = $scope.getPlanetId($scope.planets[b]);
      $scope.residents = $scope.planets[b].residents.map(function(resident){
        return $scope.getResidentId(resident);
      });
      $scope.$broadcast('SENDNAME', $scope.planets[b])

    })

  }])

  .directive('swapiPlanetsSelector', function(){
    return {
      scope: {
        minResidents: "@minResidents"
      },
      templateUrl: "templates/planet-selector.html",
      controller: ["$scope", "$http", "swapiService", function($scope, $http, swapiService){

        $scope.minResidents = 3;

        $scope.planetsWithResidents;

        var swapiPlanetsUrl = 'http://swapi.co/api/planets/';

        var populatePlanets = function(url){
          swapiService.populatePlanets(url).then(function(res){
            var planets = res.data.results.filter(function(planet){
              if (planet.residents.length >= $scope.minResidents) return planet;
            });

            $scope.$emit('PLANETS', planets)

            // swapiService.updatePlanets(planets);

            var planetNames = planets.map(function(planet){
              return planet.name;
            })

            $scope.planetsWithResidents = $scope.planetsWithResidents ? $scope.planetsWithResidents.concat(planetNames) : planetNames;

            if (res.data.next) {
              populatePlanets(res.data.next);
            }
          });
        }
        // var populatePlanets = function(url){
        //   $http.get(url).then(function(res){
        //     var planets = res.data.results.filter(function(planet){
        //       if (planet.residents.length >= $scope.minResidents) return planet;
        //     })
        //     $scope.$emit('PLANETS', planets)
        //     var planetNames = planets.map(function(planet){
        //       return planet.name;
        //     })
        //     $scope.planetsWithResidents = $scope.planetsWithResidents ? $scope.planetsWithResidents.concat(planetNames) : planetNames;
        //     if (res.data.next) {
        //       populatePlanets(res.data.next);
        //     }
        //   });
        // }

        populatePlanets(swapiPlanetsUrl);

        $scope.goToPlanet = function(planet){
          $scope.$emit('GOTOPLANET', planet);
        }

        $scope.updateMinRes = function(num){
          $scope.minResidents = num;
          swapiService.planets = [];
          $scope.planetsWithResidents = [];
          populatePlanets(swapiPlanetsUrl)
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
          $scope.population = b.population.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
        })

      }]
    }
  })

  .directive('swapiResident', function(){
    return {
      scope: {
        id: '@id'
      },
      templateUrl: 'templates/resident.html',
      controller: ["$scope", "$http", "swapiService", function($scope, $http, swapiService){
        console.log('inside resident', $scope.id);
        var swapiResidentUrl = 'http://swapi.co/api/people/' + $scope.id;

        var getResidentInfo = function(url){
          if (swapiService.residents[$scope.id]){
            $scope.resident = swapiService.residents[$scope.id];
            $scope.residentModalId = swapiService.residents[$scope.id].name.split(' ')[0];
          } else {
            swapiService.getResidentInfo(url).then(function(res){
              console.log(res.data);
              swapiService.residents[$scope.id] = res.data;
              $scope.resident = res.data;
              $scope.residentModalId = res.data.name.split(' ')[0];
            });
          }
        }

        getResidentInfo(swapiResidentUrl);

        $scope.beautifyKey = function(key){
          key = key[0].toUpperCase() + key.slice(1);
          return key.replace(/_/, ' ');
        }

      }]
    }
  })
