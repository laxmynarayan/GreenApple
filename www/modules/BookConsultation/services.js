/*
Create By  : Tony Jacob
Description: Services for BookConsultation module 
*/

'use strict';
//console.log('From BookConsultation-services.js');
angular.module('BookConsultation')
 
.factory('BookConsultationService',
    ['$timeout', '$filter', '$http', '$q',
    function ($timeout, $filter, $http, $q) {

        //console.log('Inside function BookConsultationService BookConsultation-services.js');
        
        var service = {};
		//var BaseAPIUrl = "";
        //var BaseAPIUrl = "http://localhost:8080";
        var BaseAPIUrl = "http://ec2-18-221-0-251.us-east-2.compute.amazonaws.com:1809";




        service.CreateSlot2 = CreateSlot2;
       
        return service;

        function CreateSlot2(newSlot) {
            var def = $q.defer();
            //console.log('Inside BookConsultationService-CreateSlot2()');
        
            $http({
                method: 'POST',
				url: BaseAPIUrl+'/Slot/AddSlot2',
                data: newSlot,
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
                    //console.log("error");
                    def.reject("Failed to get user info");
                    alert("AJAX failed!!!!!!");
                });
        
            return def.promise;
        };
		
    }]);
