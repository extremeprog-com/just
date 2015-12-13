mgoAdmin.config(function($stateProvider) {
    $stateProvider
        .state('app.panel', {
            url: '/panel',
            views: {
                'menuContent': {
                    templateUrl: '/mgosites-admin/AdminPanel/AdminPanel.html',
                    controller: 'mgoAdminPanel'
                }
            }
        })
});