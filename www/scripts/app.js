'use strict';

//console.log("Declaring modules...");
// declare modules
angular.module('Landing', []);

angular.module('Utility', []);
//angular.module('Authentication', ['ngResource']);
angular.module('Authentication', ['ngResource', 'ngAnimate', 'ui.bootstrap']);
angular.module('Home', []);
angular.module('NewUserRegistration', []);
angular.module('BookConsultation', []);
angular.module('DoctorCreateSession', []);
angular.module('DoctorSearchPatient', []);
angular.module('ListSessions', []);
angular.module('ListPatients', []);
angular.module('Diagnosis', []);
angular.module('DoctorSelection', []);
angular.module('DoctorSelectionDialog', []);
angular.module('UserProfileEdit', []);
angular.module('Dashboard', []);


angular.module('SmartClinicApp', [
    'ui.date',
	'Landing',
	'Dashboard',
	'Utility',
    'Authentication',
    'Home',
    'NewUserRegistration',
    'BookConsultation',
    'DoctorCreateSession',
	'ListSessions',
	'ListPatients',
	'Diagnosis',
	'DoctorSelection',
	'DoctorSelectionDialog',
	'UserProfileEdit',
    'ngRoute',
    'ngCookies',
	'datatables',
	'ngAnimate',
	'ui.bootstrap'
])
 
.controller('SmartClinicAppCtrl',function($scope) {
				//console.log("Inside SmartClinicAppCtrl");
		
				//console.log("Exiting SmartClinicAppCtrl");
			})
.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
		.when('/landing', {
            templateUrl: 'html/forms/landing.html',
			controller: 'LandingController'
        })
		.when('/dashboard', {
            templateUrl: 'html/forms/dashboard.html',
			controller: 'DashboardController'
        })
 		.when('/login', {
            templateUrl: 'html/forms/user-login.html',
            controller: 'LoginController',
            hideMenus: true
        })
        .when('/newUserRegistration', {
 			templateUrl: 'html/forms/new-patient-registration.html',
            controller: 'NewUserRegistrationController'
        })
		.when('/bookConsultation', {
            templateUrl: 'html/forms/patient-book-consultation.html',
            controller: 'BookConsultationController'
        })
 		.when('/doctorCreateSession', {
            templateUrl: 'html/forms/doctor-add-session.html',
            controller: 'DoctorCreateSessionController'
        })
		.when('/listSessions', {
            templateUrl: 'html/forms/list-sessions.html',
            controller: 'ListSessionsController'
        })
		.when('/listPatients', {
            templateUrl: 'html/forms/list-patients.html',
            controller: 'ListPatientsController'
        })
		.when('/diagnosis', {
            templateUrl: 'html/forms/diagnosis.html',
            controller: 'DiagnosisController'
        })
		.when('/doctorSelection', {
            templateUrl: 'html/forms/doctor-selection.html',
			controller: 'DoctorSelectionController'
        })
		.when('/userProfileEdit', {
            templateUrl: 'html/forms/user-profile-edit.html',
			controller: 'UserProfileEditController'
        })
		//.otherwise({ redirectTo: '/landing' });
		.otherwise({ redirectTo: '/login' });
}])
.run(['$rootScope', '$location', '$cookieStore', '$http',
    function ($rootScope, $location, $cookieStore, $http) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('globals') || {};
        if ($rootScope.globals.currentUser) {
            // jshint ignore:line
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata;
        }
 
        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            // redirect to login page if not logged in and trying to access a restricted page (any page other than login,newUserRegistration,landing)
			//var restrictedPage = $.inArray($location.path(), ['/login', '/newUserRegistration', '/landing', '/', '']) === -1;
			var restrictedPage = $.inArray($location.path(), ['/login', '/', '']) === -1;
			
			
			//console.log("location.path : ->" + $location.path() + "<-");
			//console.log("restrictedPage : " + restrictedPage);
			
            var loggedIn = $rootScope.globals.currentUser;
            if (restrictedPage && !loggedIn) {
                $location.path('/login');
            }
        });
    }]);
 
