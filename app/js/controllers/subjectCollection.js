'use strict';
/**
 * SubjectCollectionCtrl
 * Controller for all subjects.
 */

angular.module('GSB.controllers.subjectCollection', ['ngSanitize','ui.select','GSB.config', 'GSB.services.availableClasses'])
  //Inject $scope, $log, AvailableClassesService and globalConfig (see @ js/config.js, @js/services/availableClasses.js) into controller
  .controller('SubjectCollectionCtrl', ['$scope', '$log','AvailableClassesService', 'globalConfig', function ($scope, $log, AvailableClassesService, globalConfig) {

    $scope.highlightedSubject = null; //
    $scope.mainSubjectSelected = null; //The subject connected with the start point

    //  List of available subject classes that can be added to the workspace.
    $scope.availableSubjectClasses = [];

    //  Subject selected to be added to the workspace.
    $scope.selectedSubjectClass = undefined;

    AvailableClassesService.getAvailableClasses($scope.availableSubjectClasses);

    $scope.uiAddSubject = function() {
      if($scope.selectedSubjectClass) { // If the selected option is undefined no subject will be added.
        var newSubject = $scope.selectedSubjectClass;
        addSubject(newSubject.uri, newSubject.alias, newSubject.comment);
        $scope.selectedSubjectClass = undefined;
      }
    };

    /**
     * a function which adds a new subject with an uri, alias and comment
     *
     * TODO: Handle empty alias (maybe in createUniqueAlias) & empty comment
     *
     * @param uri
     * @param alias
     * @param comment
     */
    var addSubject = function (uri, alias, comment) {
      $log.info('Subject added');
      alias = createUniqueAlias(alias, uri);
      $scope.subjects.push(
        {
          alias: alias,
          label: alias,
          uri: uri,
          comment: comment,
          view: true,
          selectedProperties: [],
          availableProperties: {},
          showAdditionalFields: false
        }
      );
      //If there is only one subject, it will be the one selected by the startPoint (automatically).
      //TODO: Move to separate $watch ???
      if ($scope.subjects.length === 1) {
        $scope.mainSubjectSelected = $scope.subjects[0];
      }
    };

    /**
     * returns a unique alias for a given alias
     *
     * TODO: Handle empty alias
     *
     * @param alias
     * @param uri
     * @returns {*}
     */
    var createUniqueAlias = function (alias, uri) {
      var aliasUnique = true,
        newAlias = alias,
        key = null,
        c = 1;

      //Handling for empty alias, try an extract of uri
      if (newAlias.length == 0) {
        newAlias = uri;
      }

      do {
        for (key in $scope.subjects) {
          if ($scope.subjects.hasOwnProperty(key)) {
            if ($scope.subjects[key].alias === newAlias) {
              aliasUnique = false;
              newAlias = alias + "_" + c;
              break;
            }
            aliasUnique = true;
          }
          c += 1;
        }
      } while (!aliasUnique);
      return newAlias;
    };

    /**
     * Removes a given subject from the Workspace
     * @param subjectInst
     */
    $scope.removeSubject = function (subjectInst) {
      $scope.subjects.splice($scope.subjects.indexOf(subjectInst), 1);
      //If there is only one subject, it will be the one selected by the startPoint automatically .
      //TODO: Move to separate $watch ???
      if ($scope.subjects.length === 1) {
        $scope.mainSubjectSelected = $scope.subjects[0];
      }
    };

    $scope.$on('setHighLightTo',function(event,data) {
        $scope.highlightedSubject = data;
      });
	  
	$scope.$on('translationEvent',function() {
      $scope.translateJSONtoSPARQL($scope.mainSubjectSelected, $scope.subjects);
    });  
	  


    $scope.availableSubjectClasses = [];
    $scope.subjects = [];
    AvailableClassesService.getAvailableClasses($scope.availableSubjectClasses);
    addSubject('mockup/Person.json', "Mensch", "Ein Individuum der Spezies Mensch.");
    addSubject('mockup/Stadt.json', "Stadt", "Eine Siedlung, größer als ein Dorf.");

  }]);