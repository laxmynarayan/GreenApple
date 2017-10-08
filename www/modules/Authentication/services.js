/*
Create By  : Tony Jacob
Description: Services for Authentication module. Global $rootScope.globals.currentUser is set by this
*/

'use strict';
 
console.log('From authentication-services.js');
angular.module('Authentication')
 
.factory('AuthenticationService',
    ['Base64', '$http', '$q', '$cookieStore', '$rootScope', '$timeout',
    function (Base64, $http, $q, $cookieStore, $rootScope, $timeout) {
        
        var service = {};
		//var BaseAPIUrl = "";
        //var BaseAPIUrl = "http://localhost:8080";
        var BaseAPIUrl = "http://ec2-18-221-0-251.us-east-2.compute.amazonaws.com:1809";

        service.Login = function (username, password, usrtype) {
            var def = $q.defer();
            //console.log('Inside service.Login()...'); 
            
            $http({
                method: 'GET',
				url: BaseAPIUrl+'/AdminUser/Login/' + username + ',' + password + ',' + usrtype,
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
                    //alert(data);
                    //alert(BaseAPIUrl + '/AdminUser/Login/' + username + ',' + password + ',' + usrtype);
                    def.reject("Failed to get user info");
                    //alert("AJAX failed123!!!!!!");
                });
            
            return def.promise;
        };
        
        service.SetCredentialsAndUserInfo = function (currentUser) {
            
            var authdata = Base64.encode(currentUser.usrName + ':' + currentUser.UsrPwd);
            
            $rootScope.globals = {
                currentUser: currentUser
            };
            
            //console.log('$rootScope.globals.currentUser.UsrID : ' + $rootScope.globals.currentUser.UsrID);
            //console.log('$rootScope.globals.currentUser.DocID : ' + $rootScope.globals.currentUser.DocID);
            
            $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata; // jshint ignore:line
            $cookieStore.put('globals', $rootScope.globals);
			
			return;
        };

        service.ClearCredentials = function () {
            $rootScope.globals = {};
            $cookieStore.remove('globals');
            $http.defaults.headers.common.Authorization = 'Basic ';
        };
 		
        return service;
    }])
 
.factory('Base64', function () {

    /* jshint ignore:start */
 
    var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
 
    return {
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;
 
            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
 
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
 
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
 
                output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);
 
            return output;
        },
 
        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;
 
            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                window.alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));
 
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
 
                output = output + String.fromCharCode(chr1);
 
                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
 
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
 
            } while (i < input.length);
 
            return output;
        }
    };
 
    /* jshint ignore:end */
});
