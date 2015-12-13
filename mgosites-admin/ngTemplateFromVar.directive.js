mgoAdmin.directive('ngTemplateFromVar', function($compile) {
    return {
        restrict: "A",
        link: function(scope, element, attr) {
            scope.$watch(attr.ngTemplateFromVar, function(data) {
                $compile(angular.element(element).html(data || '').contents())(scope);
            })
        }
    }
});