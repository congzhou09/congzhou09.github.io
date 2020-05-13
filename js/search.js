(function() {
  var G = window || this,
    even = G.BLOG.even,
    $ = G.BLOG.$,
    searchIco = $("#search"),
    searchWrap = $("#search-wrap"),
    keyInput = $("#key"),
    searchPanel = $("#search-panel"),
    searchResult = $("#search-result"),
    searchTpl = $("#search-tpl").innerHTML,
    JSON_DATA = (G.BLOG.ROOT + "/content.json").replace(/\/{2}/g, "/"),
    searchData;

  function loadData(success) {
    if (!searchData) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", JSON_DATA, true);

      xhr.onload = function() {
        if (this.status >= 200 && this.status < 300) {
          var res = JSON.parse(this.response);
          searchData = res instanceof Array ? res : res.posts;
          success(searchData);
        } else {
          console.error(this.statusText);
        }
      };

      xhr.onerror = function() {
        console.error(this.statusText);
      };

      xhr.send();
    } else {
      success(searchData);
    }
  }

  function tpl(html, data) {
    return html.replace(/\{\w+\}/g, function(str) {
      var prop = str.replace(/\{|\}/g, "");
      return data[prop] || "";
    });
  }

  var noop = G.BLOG.noop;
  var root = $("html");

  var Control = {
    show: function() {
      G.innerWidth < 760 ? root.classList.add("lock-size") : noop;
      searchPanel.classList.add("in");
    },
    hide: function() {
      G.innerWidth < 760 ? root.classList.remove("lock-size") : noop;
      searchPanel.classList.remove("in");
    }
  };

  function render(data) {
    var html = "";
    if (data.length) {
      html = data
        .map(function(post) {
          return tpl(searchTpl, {
            title: post.title,
            path: (G.BLOG.ROOT + "/" + post.path).replace(/\/{2,}/g, "/"),
            date: new Date(post.date).toLocaleDateString(),
            tags: post.tags
              .map(function(tag) {
                return "<span>#" + tag.name + "</span>";
              })
              .join("")
          });
        })
        .join("");
    } else {
      html =
        '<li class="tips"><i class="icon icon-coffee icon-3x"></i><p>Results not found!</p></li>';
    }

    searchResult.innerHTML = html;
  }

  function regtest(raw, regExp) {
    regExp.lastIndex = 0;
    return regExp.test(raw);
  }

  function matcher(post, regExp) {
    return (
      regtest(post.title, regExp) ||
      post.tags.some(function(tag) {
        return regtest(tag.name, regExp);
      }) ||
      regtest(post.text, regExp)
    );
  }

  function search(e) {
    var key = e.target.value.trim();
    if (!key) {
      return;
    }

    var regExp = new RegExp(key.replace(/[ ]/g, "|"), "gmi");

    loadData(function(data) {
      var result = data.filter(function(post) {
        return matcher(post, regExp);
      });

      render(result);
      Control.show();
    });
  }

  searchIco.addEventListener(even, function(e) {
    searchWrap.classList.toggle("in");
    keyInput.value = "";
    searchWrap.classList.contains("in") ? keyInput.focus() : keyInput.blur();
    e.preventDefault();
  });

  function closest(el, selector) {
    var matchesSelector =
      el.matches ||
      el.webkitMatchesSelector ||
      el.mozMatchesSelector ||
      el.msMatchesSelector;

    var ret = null;
    while (el) {
      if (matchesSelector.call(el, selector)) {
        break;
      }
      ret = el = el.parentElement;
    }
    return ret;
  }

  document.addEventListener(even, function(e) {
    if (e.target === keyInput) {
      search(e);
    } else if (!closest(e.target, '.search-panel')) {
      Control.hide();
    }
    e.stopPropagation();
  });

  keyInput.addEventListener("input", function(e) {
    if (!e.target.value) {
      Control.hide();
    } else {
      search(e);
    }
  });
}.call(this));
