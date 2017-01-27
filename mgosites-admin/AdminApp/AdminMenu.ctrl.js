mgoAdmin.controller('mgoAdminMenu', function($scope, $just, $state) {

    $scope.User = null;
    // check if the user is logged in or not
    just.auth_check().then(
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
        $just.auth_logout().then(function() {
            $state.go("login");
        });
    }
});
