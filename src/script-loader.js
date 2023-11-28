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
