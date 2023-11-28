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
