class FullGradeFilter extends Module {
  static {
    Module.register(this.name, this);
  }

  static SCORE_THRESHOLDS = new Map([
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

  run($, window) {
    // Strip out any options that conflict with the score tiers we defined
    $("#lights option").each((_, opt) => {
        if(FullGradeFilter.SCORE_THRESHOLDS.has(opt.value)) { $(opt).remove();}
    });

    // Now, inject them just above the "Clear" node (lamp index 1)
    let clearNode = $("#lights option[value=1]");
    FullGradeFilter.SCORE_THRESHOLDS.forEach((threshold, grade) => {
        $(`<option value="${grade}">${grade}</option>`).insertBefore(clearNode);
    });

    // Finally, replace the original `filterChartsUnderLamp` with our modified version
    window.filterChartsUnderLamp = (lamp) => this.filterChartsUnderLamp($, lamp);
  }

  /*
   * Modified copy of sanbai's `filterChartsUnderLamp()` function that can handle additional grades.
   * This function gets called any time the filter value changes, supplying its value here as `lamp`.
   */
  filterChartsUnderLamp($, lamp) {
    $('.div-dark').remove();

    var isAboveThreshold = (score) => undefined;

    // `lamp` will be one of two things:
    // 1. A letter grade, which means we should have a threshold for it in our Map
    // 2. A number, which means it's an index to compare (0 = None, 6 = MFC, etc)
    if (FullGradeFilter.SCORE_THRESHOLDS.has(lamp)) {
        let threshold = FullGradeFilter.SCORE_THRESHOLDS.get(lamp);

        console.log(`Got "${lamp}", we will darken songs with a score of at least ${threshold}.`)
        isAboveThreshold = (score) => score.score >= threshold;
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
  }
}
