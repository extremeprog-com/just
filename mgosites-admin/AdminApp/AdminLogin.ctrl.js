mgoAdmin.controller('mgoAdminLogin', function($scope, $just, $state, $location) {
    $scope.state = {
          login: localStorage.email || ''
        , site: localStorage.sitename || ''
        , password: ''
        , error: ''
    };

    $scope.handleLogin = function() {
        var login       = $scope.state.login.trim();
        var password    = $scope.state.password.trim();

        if (!login || !password) {
            return;
        }

        loadMSAScriptOnPage(function() {
            $just.auth($scope.state.login, $scope.state.password).then(
                function(data) {
                    if(data.token) $state.go('init');
                },
                function(error) {
                    $scope.state.password = '';
                    $scope.state.error = 'Login and password do not match.';
                }
            );
        });
    };

    $scope.handleEmailChange = function() {
        localStorage.email = $scope.state.login;
    };

    $scope.handleSiteChange = function() {
        localStorage.sitename = $scope.state.site;

        $location.search('site', $scope.state.site);
    };

    function loadMSAScriptOnPage(cb) {
        JUST_SITE = $scope.state.site;

        var s = document.createElement("script");
        s.type = "text/javascript";
        s.src = "/just.extremeprog.js?site=" + localStorage.sitename;
        document.querySelector("head").appendChild(s);

        s.onload = function() {
            cb();
        }
    }
});
