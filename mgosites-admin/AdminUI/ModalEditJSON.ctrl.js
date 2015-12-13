mgoAdmin.controller('ModelEditJSON', function($scope, $mongoSitesApi) {

    $scope.JSON = JSON;

    $scope.editor_vm = {
        template: {_id: 'JSON', title: 'JSON'}
    };

    function setCaretPosition(el, caretPos) {
        el.value = el.value;
        // ^ this is used to not only get "focus", but
        // to make sure we don't have it everything -selected-
        // (it causes an issue in chrome, and having it doesn't hurt any other browser)

        if (el !== null) {
            if (el.createTextRange) {
                var range = el.createTextRange();
                range.move('character', caretPos);
                range.select();
                return true;
            } else {
                // (el.selectionStart === 0 added for Firefox bug)
                if (el.selectionStart || el.selectionStart === 0) {
                    el.focus();
                    el.setSelectionRange(caretPos, caretPos);
                    return true;
                } else  { // fail city, fortunately this never happens (as far as I've tested) :)
                    el.focus();
                    return false;
                }
            }
        }
    }

    $scope.$watch('object', function() {
        if($scope.editor_vm.template._id != 'JSON') {
            $scope.state.codeToEdit = JSON.stringify(angular.copy($scope.object), null, '  ');
        }
    }, true);

    $scope.setCodeToEdit = function(code) {

        $scope.object = code;

        $scope.state.codeToEdit = typeof code === 'string'
            ? JSON.stringify(JSON.parse(angular.copy(code)), null, '  ')
            : JSON.stringify(angular.copy(code), null, '  ');

        //var type = JSON.parse($scope.state.codeToEdit)._type;
        var type = $scope.state.activeDataType;
        console.log(type);
        if(type) {
            $mongoSitesApi.mgoInterface
                .aggregate([
                    { "$match": { "_type": "Plugin" } },
                    { "$unwind": "$editTemplates" },
                    { "$match": { "editTemplates.type": type } },
                    { "$project": { "_id": "$editTemplates.title", "title": "$editTemplates.title", htmlTemplate: "$editTemplates.htmlTemplate" } }
                ])
                .then(function(res) {
                    console.log(res);
                    if(res[0]) {
                        $scope.editTemplates = res;
                        console.log(res);
                        $scope.$$phase || $scope.$apply();

                    } else {
                    }
                });
        }
    };

    $scope.setCodeToEdit($scope.state.shouldShowEditJSONModal[0].code);
    $scope.state.activeTab = $scope.state.shouldShowEditJSONModal[0]._id;

    $scope.handleCloseEditor = function() {
        $scope.state.codeToEdit = "";
        $scope.state.shouldShowEditJSONModal = null;
    };

    $scope.isInvalidJSON = function() {
        try {
            //JSON.parse(textCodeEl.value);
            JSON.parse($scope.state.codeToEdit);
        } catch (e) {
            return true;
        }
    };

    $scope.handleSaveJSON = function () {
        var json = JSON.parse($scope.state.codeToEdit);

        $scope.state.loading = true;

        if (json._type) {
            $mongoSitesApi.save(json).then(function () {
                $scope.state.loading = false;
                $scope.handleCloseEditor();
                $scope.loadDataTypes();
                $scope.runRequest();
            });
        } else {
            $mongoSitesApi.auth_update(json).then(function () {
                $scope.state.loading = false;
                $scope.handleCloseEditor();
                $scope.runRequest();
            });
        }
    };

    $scope.handleDelete = function () {
        $scope.state.loading = true;

        confirm("Are you sure want delete it?") &&
        ($scope.state.activeDataType === 'Users' ?
            $mongoSitesApi.auth_delete(JSON.parse($scope.state.codeToEdit)._id).then(function () {
                $scope.state.loading = false;
                $scope.handleCloseEditor();
                $scope.runRequest();
            }) :
            $mongoSitesApi.mgoInterface.remove({_id: JSON.parse($scope.state.codeToEdit)._id}).then(function () {
                $scope.state.loading = false;
                $scope.handleCloseEditor();
                $scope.runRequest();
                $scope.loadDataTypes();
            })
        );
    };
    
    $scope.handleKeyPress = function(e) {
        console.log(e);
        if(e.code === 'Tab') {
            e.preventDefault();
            
            var 
                  start = e.target.selectionStart
                , code  = e.target.value;

            angular.element(e.target).val(code.substring(0, start) + '  ' + code.substring(start));
            setCaretPosition(e.target, start + 2);
        }
    };

});