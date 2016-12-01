mgoAdmin.controller('mgoAdminMenu', function($scope, $mongoSitesApi, $state) {

    $scope.User = null;
    $scope.localStorage = localStorage;

    // check if the user is logged in or not
    mongoSitesApi.auth_check().then(
        function (data) {

            $scope.User = data;
            if (data.login) {

            } else {
                $state.go("login");
            }
        }, function () {
            $state.go("login");
        }
    );

    $scope.handleLogout = function() {
        $mongoSitesApi.auth_logout().then(function() {
            $state.go("login");
        });
    };

    mongoSitesApi.admin_sites().then(function(data) {
        $scope.sites = data;
    });

    $scope.switchSite = function(site) {
        localStorage.sitename = site;
        location.reload();
    };
});