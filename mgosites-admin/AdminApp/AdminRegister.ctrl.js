mgoAdmin.controller('mgoAdminRegister', function($scope, $mongoSitesApi, $state) {
    $scope.state = {
        login: localStorage.email || ''
        , password: ''
        , error: ''
    };

    $scope.handleLogin = function() {
        var login       = $scope.state.login.trim();
        var password    = $scope.state.password.trim();

        if (!login || !password) {
            return;
        }

        $mongoSitesApi.auth($scope.state.login, $scope.state.password).then(
            function(data) {
                if(data.token) $state.go('init');
            },
            function(error) {
                $scope.state = {login: $scope.state.login, password: '', error: error};
            }
        );
    };

    $scope.handleEmailChange = function() {
        localStorage.email = $scope.state.login;
    };
});