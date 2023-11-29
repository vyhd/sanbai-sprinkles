// ==UserScript==
// @name         Sanbai Sprinkles
// @namespace    https://vyhd.dev
// @version      2.2.0
// @description  An unaffiliated collection of UserScripts that enhance the experience of using Sanbai Ice Cream (https://3icecream.com)
// @license      CC0-1.0; https://creativecommons.org/publicdomain/zero/1.0/
// @author       vyhd@vyhd.dev
// @match        https://3icecream.com/difficulty_list/*
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/vyhd/sanbai-sprinkles/release/script.js
// @updateURL    https://raw.githubusercontent.com/vyhd/sanbai-sprinkles/release/script.js
// @supportURL   https://github.com/vyhd/sanbai-sprinkles
// ==/UserScript==

/*
 * Module: describes a single "logical" UserScript that gets loaded in when the page starts.
 */
class Module {
  /* Provide a way for subclassed modules to register themselves for easy lookup later. */
  static AVAILABLE_MODULES = new Map();
  static register(name, cls) {
    Module.AVAILABLE_MODULES.set(name, cls);
  }

  constructor($, window) {
    return;
  }

  /* Contains CSS that should be injected into the document */
  css() {
    return undefined;
  }

  /* The logic that configures this script to be used on the page. */
  run($, window) {
    return;
  }
}

const LOCKED_CHART_TYPES = new Set([
  100, // Challenge charts only in nonstop
  190, // GRAND PRIX charts only in A3
]);

const CSP_AND_CDP = [4,8]; // many songs have A3 challenge charts we want to hide

// quick-and-dirty hack for A3's challenge charts and friends: index these IDs and difficulties too.
// (get a song's ID by name via: `ALL_SONG_DATA.filter(e => e.song_name === "foo").map(e => e.song_id)`
const MANUAL_REVOCATION_LIST = [
    // GOLDEN LEAGUE A3 Challenge charts
    {song_id: "l61ldlPo1DQ081860O86D0Qo0qdOd0qP", difficulties: CSP_AND_CDP}, // Ace out
    {song_id: "6d8DiDl0i1oldbbo0o60PQ0q96d608Dq", difficulties: CSP_AND_CDP}, // ALPACORE
    {song_id: "9DoD10OPQ999IlP0doo69olbOQ680q09", difficulties: CSP_AND_CDP}, // Avenger
    {song_id: "1qPIiqqQo0P9dD90I11q90b0ooIidbPO", difficulties: CSP_AND_CDP}, // CyberConnect
    {song_id: "dqQbQ9oPlIi6bDdi18d9qPlDb0PiDddi", difficulties: CSP_AND_CDP}, // DIGITALIZER
    {song_id: "D6ll81qoDDPIq0d89O69dIQIldQdQoId", difficulties: CSP_AND_CDP}, // Draw the Savage
    {song_id: "d9llb88lDI1q0QI10P01lqIqlI6QO0Dl", difficulties: CSP_AND_CDP}, // Give Me
    {song_id: "9IdoP1ld9098PI90QQ6bP0Idl1ibo80D", difficulties: CSP_AND_CDP}, // Glitch Angel
    {song_id: "6Obi001oi9Qd1966dOd6d6Qo66dbbill", difficulties: CSP_AND_CDP}, // Going Hypersonic
    {song_id: "dIdDQD1Q8oPQ90Q1DPbiQI661qD9oi6I", difficulties: CSP_AND_CDP}, // Golden Arrow
    {song_id: "d10d86DQqqd6QDlQlOI1bQi9do66l8Od", difficulties: CSP_AND_CDP}, // MUTEKI BUFFALO
    {song_id: "DdIo9DQ0ddDld99DQdiiqbPP06OI91I0", difficulties: CSP_AND_CDP}, // New Era
    {song_id: "Ol8PPooqO8iOqQ6900o0q0QI9dPo0O0b", difficulties: CSP_AND_CDP}, // Rampage Hero
    {song_id: "bbiPqbo0lQq9P19i06q690blI91dbbq6", difficulties: CSP_AND_CDP}, // Starlight in the Snow
    {song_id: "b80qOO6l8060990qQPod1bOd8Q9d69qo", difficulties: CSP_AND_CDP}, // The World Ends Now

    // other A3 Challenge charts
    {song_id: "o9P816l0QQ1b9l1l6i1o6OD9bl9dP00l", difficulties: CSP_AND_CDP}, // BITTER CHOCOLATE STRIKER
    {song_id: "6dO6i9qq601D8ild9QIlbO8bodbiQ1Pl", difficulties: CSP_AND_CDP}, // 灼熱Beach Side Bunny

    // A20 gold cab exclusive songs
    {song_id: "6dQQd1d1OQlqQdQ98i01DQ1i9P6QDQdQ"}, // BUTTERFLY (20th Anniversary Mix)
    {song_id: "8Io6oi89Q8DblI8IPdPPI0q98Ql9o98Q"}, // CARTOON HEROES (20th Anniversary Mix)
    {song_id: "lIlQ8DbPP6Iil1DOlQ6d8IPQblDQ8IiI"}, // HAVE YOU NEVER BEEN MELLOW (20th Anniversary Mix)
    {song_id: "D9IO16idQq6iiI88loI1i986lIID0O9O"}, // LONG TRAIN RUNNIN' (20th Anniversary Mix)
    {song_id: "IbI90PiioDlqPP19D1odPPbP1PP0009O"}, // SKY HIGH (20th Anniversary Mix)

    // GOLDEN LEAGUE PLUS songs that didn't unlock
    {song_id: "i6P0dI11PdoIIQ19D6PQPidqd0bI6lqi"}, // actualization of self (weaponized)
    {song_id: "8dqQDblP6dPI10qq10qiPbqi1llQ06iP"}, // Better Than Me
    {song_id: "O8oPP6D8OQq1Q6Q860dqlOi6609bO1lD"}, // Come Back To Me
    {song_id: "dQODIo01o98oPll086Qdol8bq9QP8d61"}, // DDR TAGMIX -LAST DanceR-
    {song_id: "i9PQoDbQI0qqd6I00d19bQo6q9PoOIbO"}, // Good Looking
    {song_id: "bqi9QiQ0lbi8id6lOi88iIi9lo6Pdd90"}, // Lightspeed
    {song_id: "I189iqQI6iPDdIDbo81b1iD6lIQiI0Po"}, // Run The Show
    {song_id: "8iiqQ9o1P089901DPIq8PDPOl6oDOl1P"}, // Step This Way
    {song_id: "Q88dlIQDd9lbiiiio0dddO6QP6O091lI"}, // THIS IS MY LAST RESORT
    {song_id: "OIOdod8llPlO0lOlb6P8iIQ90qQqoDiP"}, // Yuni's Nocturnal Days

    // returning licenses
    {song_id: "q6661PIbbb1O80OQQ11iD6bP1l6bio0Q"}, // The Light
    {song_id: "i0P1O6lbP1oDd6q6b08iPPoq6iPdI818"}, // 最終鬼畜妹フランドール・Ｓ
    {song_id: "IlbI1QQOPI0o0IdoPI6QPldqQob16DOq"}, // ナイト・オブ・ナイツ (Ryu☆Remix)
    {song_id: "illQ66d0QlbDl18OOb8P0ODD0oDP19PQ"}, // 令和

    // new restricted licenses
    {song_id: "dq6b0b6OD9DbDPQOO608oDo8Q80ODIqO"}, // Crazy Hot
    {song_id: "DDPPI6IIi0i9looibDbiODoOPOl6ID8i"}, // Feidie
    {song_id: "QbdQold98oq9lODoIloIbPiIqld6i0Qb"}, // GUILTY DIAMONDS
    {song_id: "oI0P1oq89blIobOd0QqilPqd9Didd0OD"}, // I believe what you said
    {song_id: "I9P1dbOqD1qIP8bd9O80Ooo869bldobD"}, // No Life Queen [DJ Command Remix]
    {song_id: "00ibl6biOOOdDd96OP0P0i8iObo8i09d"}, // Realize
    {song_id: "id099qDODdQ9Ooi9dq1I981Diq101QDO"}, // Seize The Day
    {song_id: "QIDqidPlPQll9q6Il0dblIo609lii1di"}, // SHINY DAYS
    {song_id: "POdll6oPi1dd68q19q8ID6iQ6d08bl99"}, // Together Going My Way
    {song_id: "IObPQb9QlP0iIiboObPoPqIqDo0O11Qi"}, // 春を告げる
    {song_id: "6lb86I9Q18Di6do1lDdod8b1Po688019"}, // 恋
    {song_id: "PIP1OIoObQ11Q0Po6idiloqOl9OQqqdd"}, // なだめスかし Negotiation
    {song_id: "1qPbqd11l6b8ibq1ODQ6di90PIo0D618"}, // ロキ(w/緒方恵美)
    {song_id: "o1d0DDobPPPlq0l8Qli1d6ODI8ldo1qb"}, // シル・ヴ・プレジデント
    {song_id: "o8IDq8P8lP9o8IIO6lPPqqQP91bo0ddl"}, // サイカ
    {song_id: "oIid19qq6dQ00O16IDiQ991D9OqdQil0"}, // 思想犯
    {song_id: "QiOl969Iq1Pl6o60QOQ9PooDbbiOPioo"}, // スカイクラッドの観測者
    {song_id: "dbod1o098DoibO0PoiPIiQ11Pdlqdoo9"}, // テレキャスタービーボーイ
    {song_id: "D6b8boIiOqQOq1QP9D1qd08I6Q0IIqq9"}, // 雑草魂なめんなよ！
]


/*
 * Finds all song jackets that belong to A3-locked content and caches them to be toggled on demand via `.toggle()`.
 */
class A3ContentToggle extends Module {
  static {
    Module.register(this.name, this);
  }

  static STORAGE_KEY = "_us_3ic_display_a3_content";

  // jQuery selectors to find all charts for a song, or a single chart if its difficulty is given.
  // `difficulty_id` must be between 0 and 8: values 0-4 are bSP thru CSP, 5-8 are BDP thru CDP.
  static SELECT_BY_SONG_ID = (song_id) => $(`div[id^=div-jacket-${song_id}]`);
  static SELECT_BY_SONG_AND_DIFFICULTY_ID = (song_id, difficulty_id) => $(`#div-jacket-${song_id}-${difficulty_id}`);

  constructor($, window) {
    super();

    // Note that we store the value as "1" or "0", to simplify converting strings from/to Booleans
    this.hideContent = Boolean(Number(localStorage.getItem(A3ContentToggle.STORAGE_KEY) ?? true));
    console.log("Hide content: ", this.hideContent);
    this.elementsToToggle = new Array();

    // Manually include the "Insufficient Data" row (if it exists): all A20 PLUS content is ranked, so don't render it
    this.elementsToToggle.push($("#no-rating-row").get());

    // ALL_SONG_DATA contains an array of song data structured like {song_id, song_name, version_num}, etc:
    // Find all the song jackets that map to DDR A3 (version_num === 19) for toggling.
    let newSongs = window.ALL_SONG_DATA.filter(e => e.version_num == 19);
    this.elementsToToggle.push(...newSongs.map(e => A3ContentToggle.SELECT_BY_SONG_ID(e.song_id)).flat());

    // Next, find charts that are unavailable for regular play on A20 PLUS and have `lock_types` that say so.
    // `lock_types` is an array mapped by `difficulty_id`, e.g. [0, 0, 0, 0, 190, 0, 0, 0, 190] for locked CSP/CDP charts.
    let songsWithLockedCharts = window.ALL_SONG_DATA.filter(e => e.version_num <= 18 && Object.hasOwn(e, 'lock_types'));
    songsWithLockedCharts.forEach(e => {
      e.lock_types.forEach((lock_value, difficulty_id) => {
        if (LOCKED_CHART_TYPES.has(lock_value)) {
          this.elementsToToggle.push(A3ContentToggle.SELECT_BY_SONG_AND_DIFFICULTY_ID(e.song_id, difficulty_id));
        }
      })
    });

    // Finally, apply the manual revocation list to cover all cases we couldn't programmatically cover above.
    MANUAL_REVOCATION_LIST.forEach(e => {
      let selection = (e.difficulties)
        ? e.difficulties.map(d => A3ContentToggle.SELECT_BY_SONG_AND_DIFFICULTY_ID(e.song_id, d))
        : A3ContentToggle.SELECT_BY_SONG_ID(e.song_id);

      // Weirdly, empty jQuery selectors return "not iterable" with the spread operator, so we hoof it here.
      Array.prototype.push.apply(this.elementsToToggle, selection);
    });
  }

  run($, window) {
    // Create a toggle button for A3 content
    const hideText = "Hide A3 Charts";
    const showText = "Show A3 Charts";

    const button = document.createElement('div');
    button.setAttribute('class', 'div-options-btn');
    button.setAttribute('id', 'toggle-a3-content');

    const text = document.createTextNode(this.hideContent ? showText : hideText);
    button.appendChild(text);

    button.onclick = () => {
      this.toggle();
      text.data = this.hideContent ? showText : hideText;
    };

    // Install the A3 toggle button under the "What's this list?" link in the top right
    let link = document.querySelector("#explanation")
    link.parentNode.insertBefore(button, link.nextSibling);

    // Now, hide everything we need to hide
    if (this.hideContent) {
      this.elementsToToggle.forEach((elem) => $(elem).toggle());
    }
  }

  toggle() {
    this.hideContent = !this.hideContent;
    localStorage.setItem(A3ContentToggle.STORAGE_KEY, Number(this.hideContent));
    console.log("Hide content: ", this.hideContent);

    this.elementsToToggle.forEach((elem) => $(elem).toggle());
  }
}

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

/*
 * HideSongJackets: allows moving song jackets between a given tier row and a "Hidden" row,
 * used to simplify score floor/lamp tracking by removing songs that are not available to play.
 */

// Wraps a comma-delimited list of jacket IDs to hide, persisted in `localStorage` and keyed by difficulty.
class ListLoader {
    static STORAGE_KEY = (function () {
        let difficulty = window.location.pathname.split("/").pop(); // "/difficulty_list/14" -> "14"
        let style = window.location.href.split("?").pop() === "spdp=1" ? "dp" : "sp";

        return `_us_3ic_tier_${style}${difficulty}_hidden_jackets`;
    })();

    static load() {
        let result = new Set();

        try {
            let payload = localStorage.getItem(ListLoader.STORAGE_KEY) ?? "";

            payload.split(",")
                .filter((s) => s.length > 0) // "".split(",") -> [""], which we want to ignore
                .forEach((s) => result.add(s));
        } catch (err) {
            console.log("Sanbai jacket load failed, resetting IDs", err);
            localStorage.removeItem(HideSongJackets.STORAGE_KEY);
        }

        return result;
    }

    static save(jacketIds) {
        let payload = [...jacketIds].join(",");
        localStorage.setItem(ListLoader.STORAGE_KEY, payload);
    }
}


class HideSongJackets extends Module {
  static {
    Module.register(this.name, this);
  }

  // Where we store a reference to the original parent, in case of necessary unhiding
  static STORED_PARENT_ATTR = "data-original-parent";

  static HIDDEN_ROW_DIV_ID = "hidden-jacket-row";
  static HIDDEN_ROW_LABEL_DIV_ID = "label-hidden-jacket";
  static HIDDEN_ROW_JACKETS_DIV_ID = "jackets-hidden";

  static TOGGLE_DIV_CLASS = "div-hide-toggle";

  constructor($, window) {
    super();

    // Build a few lookup tables so we don't have to go sniffing around the DOM later
    // Note: jQuery's `map` flattens arrays, which we don't want (because the Map ctor needs
    // an array of arrays). We hack around it by adding a second "decoy" array to flatten.
    this.jackets = new Map($(".div-jacket").map((idx, elem) => [[elem.id, elem]]).get());
    this.jacketTiers = new Map($(".div-jackets").map((idx, elem) => [[elem.id, elem]]).get());

    // Create a "Hidden" tier in the bottom row that matches the "Insufficient data" row structure.
    // We have to build our own: if all jackets are ranked, 3icecream removes it from the DOM (sigh).
    this.hiddenRow = $($.parseHTML(`
        <tr id="${HideSongJackets.HIDDEN_ROW_DIV_ID}">
            <td class="td-label"><p id="${HideSongJackets.HIDDEN_ROW_LABEL_DIV_ID}" class="p-tier-label">Hidden</p></td>
            <td class="td-jackets"><div class="div-jackets" id="${HideSongJackets.HIDDEN_ROW_JACKETS_DIV_ID}"></div></td>
        </tr>
    `));

    // Keep a reference to this so we can easily swap jackets in/out later
    this.hiddenJacketsDiv = this.hiddenRow.children(".td-jackets").children(".div-jackets").get();

    // Hide the row 'til we know there's something to render (see `toggleVisibility`)
    this.hiddenRow.hide();
  }

  run($, window) {
    // Install a toggle div on each song jacket
    this.jackets.forEach((jacketDiv, jacketId) => {
      let toggler = document.createElement("div");

      toggler.classList.add(HideSongJackets.TOGGLE_DIV_CLASS);
      toggler.onclick = () => this.toggleVisibility(jacketId);
      toggler.textContent = "×";

      jacketDiv.appendChild(toggler);
    });

    // Install the hidden row at the end of the tier list
    $("#difficulty-list-table tbody").append(this.hiddenRow);

    // Load the list of hidden jackets and hide them
    this.hiddenJacketIds = ListLoader.load();
    this.hiddenJacketIds.forEach((id) => this.toggleVisibility(id));

    // If someone clicks "Save as image", hide the little Xs in the export
    let originalSaveAsImage = window.saveAsImage;
    window.saveAsImage = function() {
        $("." + HideSongJackets.TOGGLE_DIV_CLASS).hide();
        originalSaveAsImage();
        $("." + HideSongJackets.TOGGLE_DIV_CLASS).show();
    };
  }

  toggleVisibility(jacketId) {
    const jacketDiv = $(this.jackets.get(jacketId));

    if (jacketDiv.length !== 1) {
        console.log(`Did not find jacket with ID '${jacketId}'; ignoring.`, this);
        return;
    }

    let toggleDiv = jacketDiv.find(`.${HideSongJackets.TOGGLE_DIV_CLASS}`);
    let parentId = jacketDiv.parent()[0].id;

    if (parentId != HideSongJackets.HIDDEN_ROW_JACKETS_DIV_ID) {
      console.log(`Hiding ${jacketId}`);
      this.hiddenJacketIds.add(jacketId);
      ListLoader.save(this.hiddenJacketIds);

      jacketDiv.attr(HideSongJackets.STORED_PARENT_ATTR, parentId);
      jacketDiv.appendTo(this.hiddenJacketsDiv);
    } else {
      console.log(`Unhiding ${jacketId}`);
      this.hiddenJacketIds.delete(jacketId);
      ListLoader.save(this.hiddenJacketIds);

      jacketDiv.appendTo($(`#${jacketDiv.attr(HideSongJackets.STORED_PARENT_ATTR)}`));
      jacketDiv.removeAttr(HideSongJackets.STORED_PARENT_ATTR);
    }

    if (this.hiddenJacketIds.size === 0) {
        this.hiddenRow.hide();
    } else {
        this.hiddenRow.show();
    }
  }

  css() {
    return `
#${HideSongJackets.HIDDEN_ROW_JACKETS_DIV_ID}
{
    min-height: unset;
}

#${HideSongJackets.HIDDEN_ROW_JACKETS_DIV_ID} > .div-jacket > .img-jacket
{
    height: 40px;
    width: 40px;
    margin: 4px;
}

#${HideSongJackets.HIDDEN_ROW_JACKETS_DIV_ID} > .div-jacket > .div-dark
{
    height: 48px;
    width: 48px;
    top: 4px;
    left: 4px;
}

#${HideSongJackets.HIDDEN_ROW_LABEL_DIV_ID}
{
    font-size: 18px;
}

.${HideSongJackets.TOGGLE_DIV_CLASS}
{
  cursor: cell;
  position: absolute;
  background-color: rgba(0, 0, 0, 0.5);
  text-align: center;

  font-size: 24px;
  line-height: 24px;

  height: 24px;
  width: 24px;
  top: 12px;
  right: 12px;
}

#${HideSongJackets.HIDDEN_ROW_JACKETS_DIV_ID} .${HideSongJackets.TOGGLE_DIV_CLASS}, #jackets-no-rating .${HideSongJackets.TOGGLE_DIV_CLASS}
{
  font-size: 16px;
  line-height: 16px;

  height: 16px;
  width: 16px;
  top: 8px;
  right: 8px;
}
`;
  }
}

// borrow Sanbai's jQuery instance so we don't need to pull in another - 1.11.1 as of this writing
let $ = window.jQuery;

(function(){
  /* 1. Instantiate all available modules */
  let modules = new Map([...Module.AVAILABLE_MODULES].map(([name, cls]) => {
    console.log(`Instantiating module ${name}`);
    return [name, new cls($, window)];
  }));

  /* 2. For each module that declares CSS, create a style tag to inject it. */
  [...modules.values()].map(m => m.css()).filter(Boolean).forEach(css =>
    $("<style>").prop("type", "text/css").html(css).appendTo("head")
  );

  /* 3. Run the logic for each module now that initial setup and CSS are done. */
  [...modules.values()].forEach(m => m.run($, window));
})();
