/*************************************************************
 * Main code, responsible for configuring the steps and their
 * actions.
 *
 * Author: LITW Team.
 *
 * © Copyright 2017-2024 LabintheWild.
 * For questions about this file and permission to use
 * the code, contact us at tech@labinthewild.org
 *************************************************************/

// load webpack modules
window.$ = require("jquery");
window.jQuery = window.$;
require("../js/jquery.i18n");
require("../js/jquery.i18n.messagestore");
require("jquery-ui-bundle");
let Handlebars = require("handlebars");
window.$.alpaca = require("alpaca");
window.bootstrap = require("bootstrap");
window._ = require("lodash");
// var mathjs = require("mathjs");


import progressHTML from "../templates/progress.html";
Handlebars.registerPartial('prog', Handlebars.compile(progressHTML));
import introHTML from "./pages/introduction.html";
import irb_LITW_HTML from "../templates/irb2-litw.html";
import quest1HTML from "./pages/question1.html";
import quest2HTML from "./pages/question2.html";
import demographicsHTML from "../templates/demographics.html";
import loadingHTML from "../templates/loading.html";
import resultsHTML from "./pages/results.html";
import resultsFooterHTML from "../templates/results-footer.html";
import commentsHTML from "../templates/comments.html";

require("../js/litw/jspsych-display-slide");
//CONVERT HTML INTO TEMPLATES
let introTemplate = Handlebars.compile(introHTML);
let irbTemplate = Handlebars.compile(irb_LITW_HTML);
let question1Template = Handlebars.compile(quest1HTML);
let question2Template = Handlebars.compile(quest2HTML);
let demographicsTemplate = Handlebars.compile(demographicsHTML);
let loadingTemplate = Handlebars.compile(loadingHTML);
let resultsTemplate = Handlebars.compile(resultsHTML);
let resultsFooterTemplate = Handlebars.compile(resultsFooterHTML);
let commentsTemplate = Handlebars.compile(commentsHTML);

module.exports = (function(exports) {
	const study_times= {
		SHORT: 5,
		MEDIUM: 10,
		LONG: 15,
	};
	let timeline = [];
	let params = {
		study_id: "5c24566f-b855-4783-9bf8-85d5ba864657",
		study_recommendation: [],
		preLoad: ["../img/btn-next.png","../img/btn-next-active.png","../img/ajax-loader.gif"],
		countries: {},
		slides: {
			INTRODUCTION: {
				name: "introduction",
				type: "display-slide",
				template: introTemplate,
				display_element: $("#intro"),
				display_next_button: false,
			},
			INFORMED_CONSENT: {
				name: "informed_consent",
				type: "display-slide",
				template: irbTemplate,
				template_data: {
					time: study_times.SHORT,
				},
				display_element: $("#irb"),
				display_next_button: false,
			},
			QUESTION1: {
				name: "question_behavior",
				type: "display-slide",
				template: question1Template,
				display_element: $("#question1"),
				display_next_button: false,
			},
			QUESTION2: {
				name: "question_norms",
				type: "display-slide",
				template: question2Template,
				template_data: getExpectationQuestions,
				display_element: $("#question2"),
				display_next_button: false,
			},
			DEMOGRAPHICS: {
				type: "display-slide",
				template: demographicsTemplate,
				template_data: {
					local_data_id: 'LITW_DEMOGRAPHICS'
				},
				display_element: $("#demographics"),
				name: "demographics",
				finish: function(){
					let dem_data = $('#demographicsForm').alpaca().getValue();
					LITW.data.addToLocal(this.template_data.local_data_id, dem_data);
					LITW.data.submitDemographics(dem_data);
				}
			},
			COMMENTS: {
				type: "display-slide",
				template: commentsTemplate,
				display_element: $("#comments"),
				name: "comments",
				finish: function(){
					let comments = $('#commentsForm').alpaca().getValue();
					if (Object.keys(comments).length > 0) {
						LITW.data.submitComments({
							comments: comments
						});
					}
				}
			},
			RESULTS: {
				type: "call-function",
				func: function(){
					calculateResults();
				}
			}
		},
		behavioral_questions: getBehavioralQuestions(5, 15, 12),
		norms_q_results: null
	};

	function configureStudy() {
		timeline.push(params.slides.INTRODUCTION);
		timeline.push(params.slides.INFORMED_CONSENT);
		timeline.push(params.slides.QUESTION1);
		timeline.push(params.slides.QUESTION2);
		timeline.push(params.slides.DEMOGRAPHICS);
		timeline.push(params.slides.COMMENTS);
		timeline.push(params.slides.RESULTS);
	}

	function getBehavioralQuestions(numQ, numSituations, numBehaviors) {
		let questions = [];
		for (let count= 1; count <= numQ; count++){
			let randomSituationID = Math.floor(Math.random()*numSituations);
			let randomBehaviorID = Math.floor(Math.random()*numBehaviors);
			questions.push(
				{
					situation: {
						ID: randomSituationID,
					},
					behavior: {
						ID: randomBehaviorID,
					}
				}
			)
		}
		return questions;
	}

	function getExpectationQuestions() {
		let numQ = 6;
		let numA = 6;
		let quest = {
			questions: [],
			responses: []
		}
		let counter = 1;
		while(counter <= Math.max(numQ, numA)) {
			if (counter <= numQ) {
				quest.questions.push({
					id: counter,
					text: $.i18n(`study-tl-q2-${counter}`)
				})
			}
			if (counter <= numA) {
				quest.responses.push({
					id: counter,
					text: $.i18n(`study-tl-q2-r${counter}`)
				})
			}
			counter++;
		}
		return quest;
	}

	function calculateScore(quest_responses) {
		//Inverse Q4 coding and calculate simple sum score
		let q4_response = quest_responses[4];
		quest_responses[4] = (6-q4_response)+1;
		let score = _.sum(Object.values(quest_responses));
		//Dimension 1: [6,36] (min-max) point in questionnaire
		let quest_min = 6;
		let quest_max = 36;
		//Dimension 2: [1.6, 12.3] (min-max) national scores in tight-loose dataset
		let tl_min = _.min(Object.values(params.tight_loose));
		let tl_max = _.max(Object.values(params.tight_loose));
		let conversion_rate = (tl_max-tl_min)/(quest_max-quest_min)
		//Map individual score into countries tight-loose dimension!
		return ((score-quest_min)*conversion_rate)+tl_min;
	}

	function calculateResults() {
		let norms_data = {};
		if(params.norms_q_results) {
			norms_data = JSON.parse(JSON.stringify(params.norms_q_results));
		} else {
			//Test data!
			norms_data = {
				'country': 'Brazil',
				'responses': {
					1: 4,
					2: 3,
					3: 3,
					4: 5,
					5: 3,
					6: 1
				}
			};
		}
		let tl_score = calculateScore(norms_data.responses);
		let tl_min = _.min(Object.values(params.tight_loose));
		let tl_max = _.max(Object.values(params.tight_loose));
		let tl_center = (((tl_max-tl_min)/2)+tl_min);
		let results_data = {
			message: (tl_score > tl_center) ? $.i18n("study-tl-results-message-maker") : $.i18n("study-tl-results-message-breaker"),
			country: norms_data.country,
			score: tl_score.toFixed(1)
		};
		showResults(results_data, true);
	}

	function showResults(results = {}, showFooter = false) {
		if('PID' in params.URL) {
			//REASON: Default behavior for returning a unique PID when collecting data from other platforms
			results.code = LITW.data.getParticipantId();
		}
		console.log("RESULT", results);
		$("#results").html(
			resultsTemplate({
				data: results
			}));
		if(showFooter) {
			$("#results-footer").html(resultsFooterTemplate(
				{
					share_url: window.location.href,
					share_title: $.i18n('litw-irb-header'),
					share_text: $.i18n('litw-template-title'),
					more_litw_studies: params.study_recommendation
				}
			));
		}
		$("#results").i18n();
		LITW.utils.showSlide("results");
	}

	function readSummaryData() {
		$.getJSON( "summary.json", function( data ) {
			//TODO: 'data' contains the produced summary form DB data
			//      in case the study was loaded using 'index.php'
			//SAMPLE: The example code gets the cities of study partcipants.
			console.log(data);
		});
	}

	async function loadResourcesInParallel() {
		let countries_data = await fetch('../templates/i18n/countries-en.json');
		params.countries = await countries_data.json();
		let tight_loose_data = await fetch('./data/country-tl.json');
		params.tight_loose = await tight_loose_data.json();
	}

	function startStudy() {
		// generate unique participant id and geolocate participant
		LITW.data.initialize();
		// save URL params
		params.URL = LITW.utils.getParamsURL();
		if( Object.keys(params.URL).length > 0 ) {
			LITW.data.submitData(params.URL,'litw:paramsURL');
		}
		// populate study recommendation
		LITW.engage.getStudiesRecommendation(2, (studies_list) => {
			params.study_recommendation = studies_list;
		});
		// initiate pages timeline
		jsPsych.init({
		  timeline: timeline
		});
	}

	function startExperiment(){
		//TODO These methods should be something like act1().then.act2().then...
		//... it is close enough to that... maybe the translation need to be encapsulated next.
		// get initial data from database (maybe needed for the results page!?)
		//readSummaryData();

		// determine and set the study language
		$.i18n().locale = LITW.locale.getLocale();
		var languages = {
			'en': './i18n/en.json?v=1.0'
		};
		//TODO needs to be a little smarter than this when serving specific language versions, like pt-BR!
		//TODO this sort of functionality should be refactored into a library method!
		var language = LITW.locale.getLocale().substring(0,2);
		var toLoad = {};
		if(language in languages) {
			toLoad[language] = languages[language];
		} else {
			toLoad['en'] = languages['en'];
		}
		$.i18n().load(toLoad).done(
			function() {
				$('head').i18n();
				$('body').i18n();

				LITW.utils.showSlide("img-loading");
				//start the study when resources are preloaded
				jsPsych.pluginAPI.preloadImages(params.preLoad,
					function () {
						configureStudy();
						startStudy();
					},

					// update loading indicator
					function (numLoaded) {
						$("#img-loading").html(loadingTemplate({
							msg: $.i18n("litw-template-loading"),
							numLoaded: numLoaded,
							total: params.preLoad.length
						}));
					}
				);
			});
	}



	// when the page is loaded, start the study!
	$(document).ready(function() {
		loadResourcesInParallel();
		startExperiment();
	});
	exports.study = {};
	exports.study.params = params;
	exports.study.calculateScore = calculateScore;

})( window.LITW = window.LITW || {} );


