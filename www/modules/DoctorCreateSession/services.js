/*
Create By  : Tony Jacob
Description: Services for DoctorCreateSession module 
*/

'use strict';
//console.log('From DoctorCreateSession-services.js');
angular.module('DoctorCreateSession')
 
.factory('DoctorCreateSessionService',
    ['$timeout', '$filter', '$http', '$q',
    function ($timeout, $filter, $http, $q) {

        //console.log('Inside function DoctorCreateSessionService DoctorCreateSession-services.js');
        
        var service = {};
		//var BaseAPIUrl = "";
        //var BaseAPIUrl = "http://localhost:8080";
        var BaseAPIUrl = "http://ec2-13-126-5-195.ap-south-1.compute.amazonaws.com/SmartClinicWebApi";




        service.DoctorUser_createSession = DoctorUser_createSession;
		service.DoctorUser_getLocations = DoctorUser_getLocations;
               
        return service;

		function DoctorUser_createSession (newSession) {
            var def = $q.defer();
            //console.log('Inside DoctorUser_createSession()');
            
            $http({
                method: 'POST',
                url: BaseAPIUrl+'/Session/AddSession',
                data: newSession,
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
                    console.log("error");
                    def.reject("Failed to get user info");
                    alert("AJAX failed!!!!!!");
                });
            return def.promise;
        };
		
		function DoctorUser_getLocations (docID) {
            var def = $q.defer();
            //console.log('Inside service.DoctorUser_getLocations()'); 
            
            $http({
                method: 'GET',
                url: BaseAPIUrl+'/Location/GetAllLocation/' + docID,
                dataType: 'json',
                headers: {'Content-Type': 'application/json; charset=UTF-8'},
                params: {}
                })
                .success(function (data, status, headers, config) {
                    var results = {};
                    results.data = data;
                    results.headers = headers();
                    results.status = status;
                    results.config = config;

                    def.resolve(results);
                })
                .error(function (data) {
                    def.reject("Failed to get diagnosis");
                    alert("AJAX failed!!!!!!");
                });
            
            return def.promise;
        };
	
    }]);