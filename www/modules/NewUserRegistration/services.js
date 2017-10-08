/*
Create By  : Tony Jacob
Description: Services for NewUserRegistration module 
*/

'use strict';
//console.log('From newUserRegistration-services.js');
angular.module('NewUserRegistration')
 
.factory('UserService',
    ['$timeout', '$filter', '$http', '$q',
    function ($timeout, $filter, $http, $q) {

        //console.log('Inside function UserService newUserRegistration-services.js');
        
        var service = {};
		//var BaseAPIUrl = "";
        //var BaseAPIUrl = "http://localhost:8080";
        var BaseAPIUrl = "http://ec2-18-221-0-251.us-east-2.compute.amazonaws.com:1809";



        
        service.GetAll = GetAll;
        service.GetById = GetById;
        service.GetByUsername = GetByUsername;
        service.Create = Create;
        service.Update = Update;
        service.Delete = Delete;
		
		service.CheckUserExists = CheckUserExists;

        return service;

        function GetAll() {
            var deferred = $q.defer();
            deferred.resolve(getUsers());
            return deferred.promise;
        }

        function GetById(id) {
            var deferred = $q.defer();
            var filtered = $filter('filter')(getUsers(), { id: id });
            var user = filtered.length ? filtered[0] : null;
            deferred.resolve(user);
            return deferred.promise;
        }

        function GetByUsername(username) {
            var deferred = $q.defer();
            var filtered = $filter('filter')(getUsers(), { username: username });
            var user = filtered.length ? filtered[0] : null;
            deferred.resolve(user);
            return deferred.promise;
        }

        function Create(newUser) {
            var def = $q.defer();
           
            $http({
                method: 'POST',
                url: BaseAPIUrl+'/AdminUser/AddAdminUser',
                data: newUser,
                })
                .success(function (data, status, headers, config) {
                    //console.log("success");
                    var results = {};
                    results.data = data;
                    results.headers = headers();
                    results.status = status;
                    results.config = config;

                    def.resolve(results);
                })
                .error(function (data) {
                    console.log("error...");
                    def.reject("Failed to get user info");
                    alert("AJAX failed!!!!!!");
                });
            return def.promise;
        }
		
		function CheckUserExists(username, doctorID) {
			
            var def = $q.defer();
            //console.log('Inside service.CheckUserExists()...'); 
            
            $http({
                method: 'GET',
				url: BaseAPIUrl+'/AdminUser/CheckUserExists/' + username + ',' + doctorID,
                dataType: 'json',
                headers: {'Content-Type': 'application/json; charset=UTF-8'},
				 params: {}
                })
                .success(function (data, status, headers, config) {
                    //console.log("success");
                    var results = {};
                    results.data = data;
                    results.headers = headers();
                    results.status = status;
                    results.config = config;

                    def.resolve(results);
                })
                .error(function (data) {
                    //console.log("error...");
                    def.reject("Failed to get user info");
                    alert("AJAX failed!!!!!!");
                });
            
            return def.promise;
        };

        function Update(user) {
            var deferred = $q.defer();

            var users = getUsers();
            for (var i = 0; i < users.length; i++) {
                if (users[i].id === user.id) {
                    users[i] = user;
                    break;
                }
            }
            setUsers(users);
            deferred.resolve();

            return deferred.promise;
        }

        function Delete(id) {
            var deferred = $q.defer();

            var users = getUsers();
            for (var i = 0; i < users.length; i++) {
                var user = users[i];
                if (user.id === id) {
                    users.splice(i, 1);
                    break;
                }
            }
            setUsers(users);
            deferred.resolve();

            return deferred.promise;
        }

        // private functions
        function getUsers() {
            if(!localStorage.users){
                localStorage.users = JSON.stringify([]);
            }

            return JSON.parse(localStorage.users);
        }

        function setUsers(users) {
            localStorage.users = JSON.stringify(users);
        }
    }]);
