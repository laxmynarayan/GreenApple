/*
Create By  : Tony Jacob
Description: Services for ListPatients module 
*/

'use strict';
//console.log('From ListPatients-services.js');
angular.module('ListPatients')
 
.factory('ListPatientsService',
    ['$timeout', '$filter', '$http', '$q',
    function ($timeout, $filter, $http, $q) {

        //console.log('Inside function ListPatientsService ListPatients-services.js');
        
        var service = {};
		//var BaseAPIUrl = "";
        //var BaseAPIUrl = "http://localhost:8080";
        var BaseAPIUrl = "http://ec2-18-221-0-251.us-east-2.compute.amazonaws.com:1809";



		
		service.deleteSlot = deleteSlot;
		
		function deleteSlot(slot) {
            var def = $q.defer();
            
            $http({
                method: 'POST',
                url: BaseAPIUrl+'/Slot/DeleteSlot',
                data: slot,
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
        };
		
        return service;
		
    }]);
