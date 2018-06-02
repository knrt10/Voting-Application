

(function () {
   
     var app = angular.module('app', ['ngRoute']);
    
        app.config(function($routeProvider, $locationProvider){
            
            $locationProvider.html5Mode(true);
            
            $routeProvider.when('/',{
                templateUrl:"./templates/main.html",
                controller:'MainController',
                controllerAs:'vm',
                access: {
                    restricted: false
                }
            });
            
             $routeProvider.when('/login',{
                templateUrl:"./templates/login.html",
                controller:'LoginController',
                controllerAs:'vm',
                access: {
                    restricted: false
                }
            });
            
              $routeProvider.when('/register',{
                templateUrl:"./templates/register.html",
                controller:'RegisterController',
                controllerAs:'vm',
                access: {
                    restricted: false
                }
            });
            
            $routeProvider.when('/polls',{
                templateUrl:"./templates/polls.html",
                controller:'PollsController',
                controllerAs:'vm',
                access: {
                    restricted: false
                }
            });
            
             $routeProvider.when('/polls/:id',{
                templateUrl:"./templates/poll.html",
                controller:'PollController',
                controllerAs:'vm',
                access: {
                    restricted: false
                }
            });
            
             $routeProvider.when('/profile',{
                templateUrl:"./templates/profile.html",
                controller:'ProfileController',
                controllerAs:'vm',
                access: {
                    restricted: true
                }
            }); 
            
            $routeProvider.otherwise("/");
        });
        
        app.controller('MainController', MainController);
        
        function MainController($location,$window){
            var vm = this;
            vm.title = "Home Page";
            console.log("in main ctrl");
        }
    
        app.controller('LoginController', LoginController);
        
        function LoginController($location,$window,$http){
            var vm = this;
            vm.title = "Login";
            vm.error = '';

            vm.login= function(){
               if(vm.user){
                    $http.post('/api/login',vm.user)
                    .then(function(res){
                        $window.localStorage.token = res.data;
                        $location.path('/profile');
                    },function(err){
                        vm.error = err;
                    });
                }
               else{
                   console.log('No credentials given');
                    
               } 
            }
            
        }
            
        app.controller('RegisterController', RegisterController );
        
        function RegisterController($location,$window,$http){
            var vm = this;
            vm.title = "Register Your Account";
            vm.error = '';
            vm.register = function(){
                if(!vm.user){
                    console.log('Invalid credentials');
                    return ;
                }
                $http.post('/api/register',vm.user)
                .then(function(res){
                    $window.localStorage.token = res.data;
                    $location.path('/profile');
                },function(err){
                    vm.error = err.data.errmsg;
                });
            }
        }
        
      app.controller('ProfileController', ProfileController);

    function ProfileController( $window, $location, $http, $timeout,$routeParams) {
        var vm = this;
        vm.title = "Profile Page";
        vm.currentUser = null;
        var token = $window.localStorage.token;
            
            
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace('-', '+').replace('_', '/');
            var use = JSON.parse(window.atob(base64));
        vm.polls = [];
        

        vm.getPollsByUser = function() {
            $http.get('/api/user-polls/'+ vm.currentUser.name)
                 .then(function(response) {
                     console.log(response);
                     vm.polls = response.data;
                 }, function(err) {
                     console.log(err)
                 })
        }

        vm.deletePoll = function(id) {
            if(id !== null) {
            
                $http.delete('/api/polls/' + id).then(function(response) {
                    vm.getPollsByUser();
                }, function(err) {
                    console.log(err)
                })
                     
            }
            else {
                return false;
            }
        }

        if(token) {
           vm.currentUser = use.data;
           if(vm.currentUser !== null )  {
               vm.getPollsByUser();
           }
        }

        vm.logOut = function() {
            $window.localStorage.removeItem('token');
            vm.message = 'Logging you out...'
            $timeout(function() {
                vm.message = '';
                 $location.path('/');
            }, 2000)
        }

    }
 
       app.controller('PollsController', PollsController);

    function PollsController($http, $window, $location,$timeout) {
        var vm = this;
        vm.title = "Polls Page";
        var token = $window.localStorage.token;
            
            
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace('-', '+').replace('_', '/');
            var use = JSON.parse(window.atob(base64));
            
            
            
        vm.polls = [];
        vm.poll = {
            name: '',
            options: [{
                name: '',
                votes: 0
            }]
        }
        vm.isLoggedIn = function() {
            if(!$window.localStorage.token) {
                return false;
            }
            if(use) {
                return true;
            }
            return false;   
        }
        vm.isLoggedIn();
       

        vm.getAllPolls = function() {
            $http.get('/api/polls').then(function(response) {
                vm.polls = response.data;
            });
        }
        vm.getAllPolls();

        vm.addPoll = function() {
            if(!$window.localStorage.token) {
                alert('Cannot create a poll without an account');
                return;
            }
            if(vm.poll) {
                var payload = {
                    owner:use.data.name || null,
                    name: vm.poll.name,
                    options: vm.poll.options,
                    token: $window.localStorage.token
                }
                $http.post('/api/polls' , payload).then(onSuccess, onError);
            }   
            else {
                console.log('No poll data supplied');
            }
        }
        vm.addOption = function() {
            vm.poll.options.push({
                name: '',
                votes: 0
            })
        }

        var onSuccess = function(response) {
            console.log(response.data)
            vm.poll = {};
            vm.getAllPolls();
        }
        var onError = function(err) {
            console.error(err)
        }

  vm.logOut = function() {
            $window.localStorage.removeItem('token');
            vm.message = 'Logging you out...'
            $timeout(function() {
                vm.message = '';
                 $location.path('/');
            }, 2000)
        }




    }

        app.controller('PollController', PollController);
        
        function PollController($location,$window,$http,$routeParams,$timeout){
            var vm = this;
            vm.title = "Voting Page";
             var token = $window.localStorage.token;
            
            
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace('-', '+').replace('_', '/');
            var payload = JSON.parse(window.atob(base64));
            
             if(token) {
           vm.user = payload;
        }
            
            
            vm.poll;
        vm.data;
        vm.link = 'https://voting-app-knrt.c9users.io' + $location.path();
        vm.addOption = function() {
            console.log(vm.option);
            if(vm.option) {
                $http.put('/api/polls/add-option', { option: vm.option, id: $routeParams.id }).then(function(response) {
                    vm.poll.options.push({
                        name: vm.option,
                        votes: 0
                    })
                    vm.option = null;
                    vm.getPoll();
                });
            }
        }

 vm.logOut = function() {
            $window.localStorage.removeItem('token');
            vm.message = 'Logging you out...'
            $timeout(function() {
                vm.message = '';
                 $location.path('/');
            }, 2000)
        }



 vm.getPoll  = function() {
            var id = $routeParams.id;
            $http.get('/api/poll/' + id)
                 .then(function(response) {
                    vm.id = response.data._id;
                    vm.owner = response.data.owner;
                    vm.poll = response.data.options;
                    console.log(vm.poll);
                    vm.data = response.data;
                    google.charts.load('current', {'packages':['corechart']});
                    google.charts.setOnLoadCallback(drawChart);
                 }, function(err) {
                    $location.path('/polls');
                 })
        }
        vm.getPoll();

        function drawChart() {
        var chartArray = [];
        chartArray.push(['Name', 'Votes']);
        
         for(var i = 0; i < vm.data.options.length; i++){
            chartArray.push([vm.data.options[i].name, vm.data.options[i].votes ])
        }
        console.log(chartArray);
        var data = google.visualization.arrayToDataTable(chartArray);

        var options = {
          title: vm.data.name
        };

        var chart = new google.visualization.PieChart(document.getElementById('piechart'));

        chart.draw(data, options);
      }

      vm.vote = function() {
          if(vm.selected) {
              console.log(vm.selected, vm.poll);
              $http.put('/api/polls', { id: $routeParams.id, vote: vm.selected  })
                   .then(function(response) {
                       vm.getPoll();
                   }, function(err) {
                       console.log(err)
                   })
          }
          else {
              console.log('No poll selected');
          }
      }

    }
        
}());