var mgoAdmin = angular.module('mgoAdmin', ['ui.router','just']);


mgoAdmin.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('app', {
            url: '/admin',
            abstract: true,
            templateUrl: '/mgosites-admin/AdminApp/AdminMenu.html',
            controller: 'mgoAdminMenu'
        })
        .state('init', {
            url: '/initialization',
            cache: false, // to avoid wrong handling of login/logout
            templateUrl: '/mgosites-admin/AdminApp/AdminInit.html'
        })
        .state('login', {
            url: '/login',
            templateUrl: '/mgosites-admin/AdminApp/AdminLogin.html',
            controller: 'mgoAdminLogin'
        })
        .state('register', {
            url: '/register',
            templateUrl: '/mgosites-admin/AdminApp/AdminRegister.html',
            controller: 'mgoAdminRegister'
        })
    ;

    //$urlRouterProvider.otherwise('/initialization');

    $urlRouterProvider.otherwise(function ($injector) {
        var $state = $injector.get("$state");
        $state.go("init");
    });
});
