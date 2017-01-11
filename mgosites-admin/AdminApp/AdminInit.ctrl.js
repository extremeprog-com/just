mgoAdmin.controller('mgoAdminInit', function ($scope, $state, $just) {
    setTimeout(function() {
        $just.auth_check()
            .then(function(logged_in) {
                if (!logged_in) {
                    $state.go('login');
                } else {
                    $state.go('app.panel');
                }
            });
    }, 1000);
});
