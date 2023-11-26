// ==UserScript==
// @name         Full Letter Grade Filter
// @namespace    https://vyhd.dev
// @version      0.1.0
// @description  Adds all remaining letter grades into the difficult_list filters
// @license      CC0-1.0; https://creativecommons.org/publicdomain/zero/1.0/
// @author       vyhd@vyhd.dev
// @match        https://3icecream.com/difficulty_list/*
// @grant        none
// ==/UserScript==

'use strict';

// borrow Sanbai's jQuery instance so we don't need to pull in another - 1.11.1 as of this writing
let $ = window.jQuery;

let SCORE_THRESHOLDS = new Map([
    ["AAA", 990000],
    ["AA+", 950000],
    ["AA",  900000],
    ["AA-", 890000],
    ["A+",  850000],
    ["A",   800000],
    ["A-",  790000],
    ["B+",  750000],
    ["B",   700000],
    ["B-",  690000],
    ["C+",  650000],
    ["C",   600000],
    ["C-",  590000],
    ["D+",  550000]
]);

/*
 * Modified copy of sanbai's `filterChartsUnderLamp()` function that can handle additional grades.
 * This function gets called any time the filter value changes, supplying its value here as `lamp`.
 */
let enrichedFilterUnderLamp = function(lamp) {
    $('.div-dark').remove();

    var isAboveThreshold = (score) => undefined;

    // `lamp` will be one of two things:
    // 1. A letter grade, which means we should have a threshold for it in our Map
    // 2. A number, which means it's an index to compare (0 = None, 6 = MFC, etc)
    if (SCORE_THRESHOLDS.has(lamp)) {
        console.log(`Got "${lamp}", we will darken songs with a score of at least ${SCORE_THRESHOLDS.get(lamp)}.`)
        isAboveThreshold = (score) => score.score >= SCORE_THRESHOLDS.get(lamp);
    } else {
        console.log(`Got "${lamp}", we will compare that index to [0=NONE, 1=CLEAR, 2=LIFE4, 3=FC, 4=GFC, 5=PFC, 6=MFC].`)
        isAboveThreshold = (score) => score.lamp >= lamp;
    }

    for (let chartKey of Object.keys(difficultyList).concat(missingChartsChartKeys)) {
        let score = indexedAllScores[chartKey];

        if (lamp != 0 && score && isAboveThreshold(score)) {
            let divDark = document.createElement('div');
            divDark.classList.add('div-dark');
            $('#div-jacket-' + chartKey.replace('/', '-')).append(divDark);
        }
    }
};


(function() {
    // Strip out any options that conflict with the score tiers we defined
    $("#lights option").each((_, opt) => {
        if(SCORE_THRESHOLDS.has(opt.value)) { $(opt).remove();}
    });

    // Now, inject them just above the "Clear" node (lamp index 1)
    let clearNode = $("#lights option[value=1]");
    SCORE_THRESHOLDS.forEach((threshold, grade) => {
        $(`<option value="${grade}">${grade}</option>`).insertBefore(clearNode);
    });

    window.filterChartsUnderLamp = enrichedFilterUnderLamp;
})();
