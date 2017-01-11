mgoAdmin.controller('ModalAddUserPass', function($scope, $just) {

    $scope.handleSavePassword = function() {
        var
              login    = $scope.state.userLogin.trim()
            , password = $scope.state.userPass.trim();

        if(login.length && password.length) {
            $scope.state.loading = true;
            $just.auth_register({_id: login, password: password})
                .then(function(result) {
                    $scope.state.loading = false;
                    $scope.handleCloseModal();
                    $scope.handleSelectDataType('Users');
                })
                .catch(function(error) {
                    $scope.state.loading = false;
                    console.error(error);
                    $scope.handleCloseModal();
                });
        }
    };

    $scope.handleCloseModal = function() {
        $scope.state.$value = false;
        $scope.state.userPass = "";
        $scope.state.userLogin = "";
        $scope.state.shouldShowAddUserPassModal = null;

        $scope.$$phase || $scope.$apply();
    }
});
