(function() {
	'use strict';

	angular
		.module('observatoryApp')
		.factory('EncuestasFactory', EncuestasFactory);

	function EncuestasFactory($http, $q) {
		var factory = {
			store: store,
			getAll: getAll
		};

		return factory;

		function store(encuesta) {
			var defered = $q.defer();
			var promise = defered.promise;

			$http({
				method: 'POST',
				url: 'api/encuestas/registro',
				data: encuesta
			})
			.success(function(response) {
				defered.resolve(response);
			})
			.error(function(err) {
				defered.reject(err);
			});

			return promise;
		}
		function getAll() {
			var defered = $q.defer();
			var promise = defered.promise;

			$http.get('api/encuestas/todas')
			.success(function(response) {
				defered.resolve(response);
			})
			.error(function(err) {
				defered.reject(err);
			});

			return promise;
		}
	}
})();