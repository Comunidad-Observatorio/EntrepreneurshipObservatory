(function() {
	'use strict';

	angular
		.module('observatoryApp')
		.factory('AnalisisFactory', AnalisisFactory);

	function AnalisisFactory($http, $q) {
		var factory = {
			get: get,
			calculateICEBySector: calculateICEBySector,
			groupByEntrepreneur: groupByEntrepreneur,
            calculateNs: calculateNs,
            calculatePs: calculatePs,
            calculateN: calculateN,
            calculateNir: calculateNir,
            calculatePir: calculatePir,
            calculateXir: calculateXir
		};

		return factory;

		function get(idPeriodo) {
			var defered = $q.defer();

			$http({
				method: 'GET',
				url: 'api/analisis/get/' + idPeriodo
			})
			.success(function(response) {
				defered.resolve(response);
			})
			.error(function(err) {
				defered.reject(err);
			});

			return defered.promise;
		}

        function calculateValue(value){
            var result;
            switch (value){
                case 'Muy bueno':
                    result = 1;
                    break;
                case 'Bueno':
                    result = 2;
                    break;
                case 'Regular':
                    result = 3;
                    break;
                case 'Malo':
                    result = 4;
                    break;
                case 'Muy malo':
                    result = 5;
                    break;
            }
            return result;
        }

		function calculateICEBySector(sector, entrepreneurs) {
            var ICEbySector = {
                sector: sector,
                scores: []
            },
                index = 0;

            entrepreneurs.forEach(function(entrepreneur){

                ICEbySector.scores.push({
                    resultadoNegocios: 0,
                    empleo: 0,
                    inversiones: 0,
                    precios: 0,
                    costesTotales: 0
                });

                if(entrepreneur.sector === sector) {
                    entrepreneur.answers.forEach(function(answer){
                       	switch (answer.indicador){
                           	case 'Resultado de negocio':
                               ICEbySector.scores[index].resultadoNegocios += calculateValue(answer.answer);
                               break;
                           	case 'Empleo':
                               ICEbySector.scores[index].empleo += calculateValue(answer.answer);
                               break;
                           	case 'Inversiones':
                               ICEbySector.scores[index].inversiones += calculateValue(answer.answer);
                               break;
                           	case 'Precios':
                               ICEbySector.scores[index].precios += calculateValue(answer.answer);
                               break;
                           	case 'Costes totales':
                               ICEbySector.scores[index].costesTotales += calculateValue(answer.answer);
                               break;
                      	}
                    });
                    index ++;
                }
            });

            return ICEbySector;
		}

		function destroyAnswer(answers, answer) {
			answers = answers.filter(function(item) {
				return answer !== item;
			});

			return answers;
		}

		function groupByEntrepreneur(answers){
			var i = 0,
				j = 0,
				index = 0,
				entrepreneurs = [];

			for ( ; i < answers.length; i++) {

				entrepreneurs.push({
					id: answers[i].id,
                    sector: answers[i].sector,
					answers: []
				});

				for ( ; j < answers.length; j++) {
					if (entrepreneurs[index].id === answers[j].id) {
						entrepreneurs[index].answers.push({
							indicador: answers[j].nombre,
							answer: answers[j].respuesta
						});
						answers = destroyAnswer(answers, answers[j]);
						j--;
					}
				}

				i = -1;
				j = 0;
				index++;
			}

			return entrepreneurs;
		}

        /*
        * Calcular el Ns de las encuestas
        * @param{Array} encuestas aplicadas, utilizadas para determinar a que sector pertenece cada aplicacion
        * */
        function calculateNs(entrepreneurs){
            var nsResults = {
                agricola: 0,
                manufactura: 0,
                comercio: 0,
                turismo: 0,
                servicios: 0
            };

            entrepreneurs.forEach(function(entrepreneur){
                entrepreneur.scores.forEach(function (score) {
                    if(score.costesTotales !== 0 || score.empleo !== 0 || score.inversiones !== 0
                        || score.precios !== 0 || score.resultadoNegocios !== 0){
                        switch(entrepreneur.sector){
                            case 'Agricultura y pesca':
                                nsResults.agricola ++;
                                break;
                            case 'Industria manufacturera':
                                nsResults.manufactura ++;
                                break;
                            case 'Comercio y reparación':
                                nsResults.comercio ++;
                                break;
                            case 'Turismo':
                                nsResults.turismo ++;
                                break;
                            case 'Otros servicios':
                                nsResults.servicios ++;
                                break;
                        }
                    }
                })
            });
            return nsResults;
        }

        /*
        * Calcular el Ps, que corresponde al ponderado de aplicaciones por sector (peso en la medicion)
        * @param{Object} Ns con los valores que indican el numero de encuestas por sector
        * */
        function calculatePs(ns, total){

            return {
                agricola: ns.agricola / total,
            	manufactura: ns.manufactura / total,
                comercio: ns.comercio / total,
                turismo: ns.turismo / total,
                servicios: ns.servicios / total
            };

        }

        function calculateN(ns){
            return ns.agricola + ns.manufactura + ns.comercio + ns.turismo + ns.servicios;
        }

        function getPosition(value) {
        	var i = -1;
        	switch(value) {
        		case 1:
        			i = 0;
        			break;
        		case 2:
        			i = 1;
        			break;
        		case 3:
        			i = 2;
        			break;
        		case 4:
        			i = 3;
        			break;
        		case 5:
        			i = 4;
        			break;
        	}

        	return i;
        }
        function getScoreForSector(score, indicadores, nir) {
        	var i;
        	indicadores.forEach(function(indicador) {
        		switch(indicador.nombre) {
	        		case 'Resultado de negocio':
	        			i = getPosition(score.resultadoNegocios);
	        			if (i >= 0) {
	        				nir[0].scores[i] += 1;
	        			}
	                   	break;
	               	case 'Empleo':
	               		i = getPosition(score.empleo);
	        			if (i >= 0) {
	        				nir[1].scores[i] += 1;
	        			}
	                   	break;
	               	case 'Inversiones':
	               		i = getPosition(score.inversiones);
	        			if (i >= 0) {
	        				nir[2].scores[i] += 1;
	        			}
	                   	break;
	               	case 'Precios':
	               		i = getPosition(score.precios);
	        			if (i >= 0) {
	        				nir[3].scores[i] += 1;
	        			}
	                   	break;
	               	case 'Costes totales':
	               		i = getPosition(score.costesTotales);
	        			if (i >= 0) {
	        				nir[4].scores[i] += 1;
	        			}
	                   	break;
	        	}
        	});
			return nir;
        }

        function calculateNir(ICEBySector, indicadores) {
        	var nir = [
    			{
    				indicador: 'Resultado de negocio',
    				scores: [0, 0, 0, 0, 0]
    			},
    			{
    				indicador: 'Empleo',
    				scores: [0, 0, 0, 0, 0]
    			},
    			{
    				indicador: 'Inversiones',
    				scores: [0, 0, 0, 0, 0]
    			},
    			{
    				indicador: 'Precios',
    				scores: [0, 0, 0, 0, 0]
    			},
    			{
    				indicador: 'Costes totales',
    				scores: [0, 0, 0, 0, 0]
    			}
    		];

    		ICEBySector.forEach(function(ICE) {
        		ICE.scores.forEach(function(score) {
        			nir = getScoreForSector(score, indicadores, nir)
        		});
        	});

        	return nir;
        }

        function calculatePir(nir, n) {
        	var i = 0,
        		j = 0,
        		pir = [
    			{
    				indicador: 'Resultado de negocio',
    				scores: [0, 0, 0, 0, 0]
    			},
    			{
    				indicador: 'Empleo',
    				scores: [0, 0, 0, 0, 0]
    			},
    			{
    				indicador: 'Inversiones',
    				scores: [0, 0, 0, 0, 0]
    			},
    			{
    				indicador: 'Precios',
    				scores: [0, 0, 0, 0, 0]
    			},
    			{
    				indicador: 'Costes totales',
    				scores: [0, 0, 0, 0, 0]
    			}
    		];

        	nir.forEach(function(indicador) {
        		indicador.scores.forEach(function(score) {
        			pir[i].scores[j] = (nir[i].scores[j] * 100) / n;
        			j++;
        		});
        		i++;
        		j = 0;
        	});
        	
        	return pir;
        }

        function getPercent(value) {
        	var percent = 0;
        	switch(value) {
        		case 1:
        			percent = 1;
        			break;
        		case 2:
        			percent = 0.75;
        			break;
        		case 3:
        			percent = 0.5;
        			break;
        		case 4:
        			percent = 0.25;
        			break;
        	}

        	return percent;
        }

        function calculateXir(pir) {
        	var i = 0,
        		j = 0,
        		xir = [
    			{
    				indicador: 'Resultado de negocio',
    				scores: [0, 0, 0, 0, 0]
    			},
    			{
    				indicador: 'Empleo',
    				scores: [0, 0, 0, 0, 0]
    			},
    			{
    				indicador: 'Inversiones',
    				scores: [0, 0, 0, 0, 0]
    			},
    			{
    				indicador: 'Precios',
    				scores: [0, 0, 0, 0, 0]
    			},
    			{
    				indicador: 'Costes totales',
    				scores: [0, 0, 0, 0, 0]
    			}
    		];

        	pir.forEach(function(indicador) {
        		indicador.scores.forEach(function(score) {
        			xir[i].scores[j] = pir[i].scores[j] * getPercent(j + 1);
        			j++;
        		});
        		i++;
        		j = 0;
        	});
        	
        	return xir;
        }
	}
})();