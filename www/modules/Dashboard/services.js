/*
Created By  : Lakshmy Narayanan
Description: Services for Dashboard module 
*/

'use strict';
//console.log('From Dashboard-services.js');
angular.module('Dashboard')
 
.factory('DashboardService',
    [ '$timeout', '$filter', '$http', '$q',
    function ($timeout, $filter, $http, $q) {

        //console.log('Inside function ListPatientsService ListPatients-services.js');
       // alert("inSideService");
        var service = {};
       
        //var BaseAPIUrl = "http://localhost:8080";
        var BaseAPIUrl = "http://ec2-18-221-0-251.us-east-2.compute.amazonaws.com:1809";



       
		service.GetDashboardParams = GetDashboardParams;
		service.GetQueue = GetQueue;
		
		function GetDashboardParams(DocID) {
		    //alert(BaseAPIUrl + '/Dashboard/GetDashboardParams/' + DocID);
            var def = $q.defer();
            //console.log('Inside service.GetDiagnosis()...'); 
            debugger;
            $http({
                method: 'GET',
                url: BaseAPIUrl+'/Dashboard/GetDashboardParams/' + DocID,
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
                    def.reject("Failed to get Dashboard");
                    alert("AJAX failed!!!!!!");
                });
            
            return def.promise;
        };
		
		function GetQueue(DocID) {
            var def = $q.defer();
            //console.log('Inside service.GetDiagnosis()...'); 
            
            $http({
                method: 'GET',
                url: BaseAPIUrl+'/Queue/GetQueue/' + DocID,
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
		
        return service;
		
    }]);
