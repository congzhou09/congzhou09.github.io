(function (w, d) {
  var body = d.body,
    $ = d.querySelector.bind(d),
    $$ = d.querySelectorAll.bind(d),
    root = $('html'),
    gotop = $('#gotop'),
    menu = $('#menu'),
    menuShowed = false,
    header = $('#header'),
    mask = $('#mask'),
    menuToggle = $('#menu-toggle'),
    loading = $('#loading'),
    animate = w.requestAnimationFrame,
    scrollSpeed = 200 / (1000 / 60),
    forEach = Array.prototype.forEach,
    even =
      'ontouchstart' in w &&
      /Mobile|Android|iOS|iPhone|iPad|iPod|Windows Phone|KFAPWI/i.test(
        navigator.userAgent
      )
        ? 'touchstart'
        : 'click',
    noop = function () {},
    offset = function (el) {
      var x = el.offsetLeft,
        y = el.offsetTop;

      if (el.offsetParent) {
        var pOfs = arguments.callee(el.offsetParent);
        x += pOfs.x;
        y += pOfs.y;
      }

      return {
        x: x,
        y: y
      };
    },
    rootScollTop = function () {
      return d.documentElement.scrollTop || d.body.scrollTop;
    };

  var Blog = {
    goTop: function (end) {
      var top = rootScollTop();
      var interval =
        arguments.length > 2 ? arguments[1] : Math.abs(top - end) / scrollSpeed;

      if (top && top > end) {
        w.scrollTo(0, Math.max(top - interval, 0));
        animate(arguments.callee.bind(this, end, interval));
      } else if (end && top < end) {
        w.scrollTo(0, Math.min(top + interval, end));
        animate(arguments.callee.bind(this, end, interval));
      } else {
        this.toc.actived(end);
      }
    },
    toggleGotop: function (top) {
      if (top > w.innerHeight / 2) {
        gotop.classList.add('in');
      } else {
        gotop.classList.remove('in');
      }
    },
    toggleMenu: function (flag) {
      var main = $('#main');
      if (flag) {
        mask.classList.add('in');
        menu.classList.add('show');

        root.classList.add('lock');
      } else {
        menu.classList.remove('show');
        mask.classList.remove('in');
        root.classList.remove('lock');
      }

      // 图片懒加载
      if (!menuShowed) {
        var brandWrapElem = $('.brand-wrap-img'),
          avatarImgElem = $('.avatar img');
        brandWrapElem.setAttribute('src', brandWrapElem.getAttribute('finalsrc'));
        avatarImgElem.setAttribute('src', avatarImgElem.getAttribute('finalsrc'));

        menuShowed = true;
      }
    },
    fixedHeader: function (top) {
      var headerH = header.clientHeight;
      if (top >= headerH) {
        header.classList.add('fixed');
      } else {
        header.classList.remove('fixed');
      }
    },
    toc: (function () {
      var toc = $('#post-toc');

      if (!toc || !toc.children.length) {
        return {
          fixed: noop,
          actived: noop
        };
      }

      var bannerH = $('.post-header').clientHeight,
        headerH = header.clientHeight,
        titles = $('#post-content').querySelectorAll('h1, h2, h3, h4, h5, h6');

      toc
        .querySelector('a[href="#' + encodeURIComponent(titles[0].id) + '"]')
        .parentNode.classList.add('active');

      return {
        fixed: function (top) {
          top >= bannerH - headerH
            ? toc.classList.add('fixed')
            : toc.classList.remove('fixed');
        },
        actived: function (top) {
          for (i = 0, len = titles.length; i < len; i++) {
            if (top > offset(titles[i]).y - headerH - 5) {
              toc.querySelector('li.active').classList.remove('active');

              var active = toc.querySelector(
                'a[href="#' + encodeURIComponent(titles[i].id) + '"]'
              ).parentNode;
              active.classList.add('active');
            }
          }

          if (top < offset(titles[0]).y) {
            toc.querySelector('li.active').classList.remove('active');
            toc
              .querySelector('a[href="#' + encodeURIComponent(titles[0].id) + '"]')
              .parentNode.classList.add('active');
          }
        }
      };
    })(),
    hideOnMask: [],
    modal: function (target) {
      this.$modal = $(target);
      this.$off = this.$modal.querySelector('.close');

      var _this = this;

      this.show = function () {
        mask.classList.add('in');
        _this.$modal.classList.add('ready');
        setTimeout(function () {
          _this.$modal.classList.add('in');
        }, 0);
      };

      this.onHide = noop;

      this.hide = function () {
        _this.onHide();
        mask.classList.remove('in');
        _this.$modal.classList.remove('in');
        setTimeout(function () {
          _this.$modal.classList.remove('ready');
        }, 300);
      };

      this.toggle = function () {
        return _this.$modal.classList.contains('in') ? _this.hide() : _this.show();
      };

      Blog.hideOnMask.push(this.hide);
      this.$off && this.$off.addEventListener(even, this.hide);
    },
    share: function () {
      var pageShare = $('#pageShare'),
        fab = $('#shareFab');

      var shareModal = new this.modal('#globalShare');

      $('#menuShare').addEventListener(even, shareModal.toggle);

      if (fab) {
        fab.addEventListener(
          even,
          function () {
            pageShare.classList.toggle('in');
          },
          false
        );

        d.addEventListener(
          even,
          function (e) {
            !fab.contains(e.target) && pageShare.classList.remove('in');
          },
          false
        );
      }

      var wxModal = new this.modal('#wxShare');
      wxModal.onHide = shareModal.hide;

      forEach.call($$('.wxFab'), function (el) {
        el.addEventListener(even, wxModal.toggle);
      });
    },
    reward: function () {
      var modal = new this.modal('#reward');
      $('#rewardBtn').addEventListener(even, modal.toggle);

      var $rewardToggle = $('#rewardToggle');
      var $rewardCode = $('#rewardCode');
      if ($rewardToggle) {
        $rewardToggle.addEventListener('change', function () {
          $rewardCode.src = this.checked ? this.dataset.alipay : this.dataset.wechat;
        });
      }
    },
    waterfall: function () {
      if (w.innerWidth < 760) return;

      forEach.call($$('.waterfall'), function (el) {
        var childs = el.querySelectorAll('.waterfall-item');
        var columns = [0, 0];

        forEach.call(childs, function (item) {
          var i = columns[0] <= columns[1] ? 0 : 1;
          item.style.cssText =
            'top:' + columns[i] + 'px;left:' + (i > 0 ? '50%' : 0);
          columns[i] += item.offsetHeight;
        });

        el.style.height = Math.max(columns[0], columns[1]) + 'px';
        el.classList.add('in');
      });
    },
    tabBar: function (el) {
      el.parentNode.parentNode.classList.toggle('expand');
    },
    page: (function () {
      var $elements = $$('.fade, .fade-scale');
      var visible = false;

      return {
        loaded: function () {
          forEach.call($elements, function (el) {
            el.classList.add('in');
          });
          visible = true;
        },
        unload: function () {
          forEach.call($elements, function (el) {
            el.classList.remove('in');
          });
          visible = false;
        },
        visible: visible
      };
    })(),
    lightbox: (function () {
      function LightBox(element) {
        this.$img = element.querySelector('img');
        this.$overlay = element.querySelector('overlay');
        this.margin = 40;
        this.title = this.$img.title || this.$img.alt || '';
        this.isZoom = false;

        var naturalW, naturalH, imgRect, docW, docH;

        this.calcRect = function () {
          docW = body.clientWidth;
          docH = body.clientHeight;
          var inH = docH - this.margin * 2;
          var w = naturalW;
          var h = naturalH;
          var t = this.margin;
          var l = 0;
          var sw = w > docW ? docW / w : 1;
          var sh = h > inH ? inH / h : 1;
          var s = Math.min(sw, sh);

          w = w * s;
          h = h * s;

          return {
            w: w,
            h: h,
            t: (docH - h) / 2 - imgRect.top,
            l: (docW - w) / 2 - imgRect.left + this.$img.offsetLeft
          };
        };

        this.setImgRect = function (rect) {
          this.$img.style.cssText =
            'width: ' +
            rect.w +
            'px; max-width: ' +
            rect.w +
            'px; height:' +
            rect.h +
            'px; top: ' +
            rect.t +
            'px; left: ' +
            rect.l +
            'px';
        };

        this.setFrom = function () {
          this.setImgRect({
            w: imgRect.width,
            h: imgRect.height,
            t: 0,
            l: (element.offsetWidth - imgRect.width) / 2
          });
        };

        this.setTo = function () {
          this.setImgRect(this.calcRect());
        };

        // this.updateSize = function () {
        //     var sw = sh = 1;
        //     if (docW !== body.clientWidth) {
        //         sw = body.clientWidth / docW;
        //     }

        //     if (docH !== body.clientHeight) {
        //         sh = body.clientHeight / docH;
        //     }

        //     docW = body.clientWidth;
        //     docH = body.clientHeight;
        //     var rect = this.$img.getBoundingClientRect();
        //     var w = rect.width * sw;
        //     var h = rect.height * sh;

        //     this.$img.classList.remove('zoom-in');
        //     this.setImgRect({
        //         w: w,
        //         h: h,
        //         t: this.$img.offsetTop - (h - rect.height) / 2,
        //         l: this.$img.offsetLeft - (w - rect.width) / 2
        //     })
        // }

        this.addTitle = function () {
          if (!this.title) {
            return;
          }
          this.$caption = d.createElement('div');
          this.$caption.innerHTML = this.title;
          this.$caption.className = 'overlay-title';
          element.appendChild(this.$caption);
        };

        this.removeTitle = function () {
          this.$caption && element.removeChild(this.$caption);
        };

        var _this = this;

        this.zoomIn = function () {
          naturalW = this.$img.naturalWidth || this.$img.width;
          naturalH = this.$img.naturalHeight || this.$img.height;
          imgRect = this.$img.getBoundingClientRect();
          element.style.height = imgRect.height + 'px';
          element.classList.add('ready');
          this.setFrom();
          this.addTitle();
          this.$img.classList.add('zoom-in');

          setTimeout(function () {
            element.classList.add('active');
            _this.setTo();
            _this.isZoom = true;
          }, 0);
        };

        this.zoomOut = function () {
          this.isZoom = false;
          element.classList.remove('active');
          this.$img.classList.add('zoom-in');
          this.setFrom();
          setTimeout(function () {
            _this.$img.classList.remove('zoom-in');
            _this.$img.style.cssText = '';
            _this.removeTitle();
            element.classList.remove('ready');
            element.removeAttribute('style');
          }, 300);
        };

        element.addEventListener('click', function (e) {
          _this.isZoom
            ? _this.zoomOut()
            : e.target.tagName === 'IMG' && _this.zoomIn();
        });

        d.addEventListener('scroll', function () {
          _this.isZoom && _this.zoomOut();
        });

        w.addEventListener('resize', function () {
          // _this.isZoom && _this.updateSize()
          _this.isZoom && _this.zoomOut();
        });
      }

      forEach.call($$('.img-lightbox'), function (el) {
        new LightBox(el);
      });
    })(),
    loadScript: function (scripts) {
      scripts.forEach(function (src) {
        var s = d.createElement('script');
        s.src = src.url;
        s.async = src.async;
        body.appendChild(s);
      });
    }
  };

  w.addEventListener('load', function () {
    loading.classList.remove('active');
    Blog.page.loaded();
    w.lazyScripts && w.lazyScripts.length && Blog.loadScript(w.lazyScripts);
  });

  w.addEventListener('DOMContentLoaded', function () {
    Blog.waterfall();
    var top = rootScollTop();
    Blog.toc.fixed(top);
    Blog.toc.actived(top);
    Blog.page.loaded();
  });

  var ignoreUnload = false;
  var $mailTarget = $('a[href^="mailto"]');
  if ($mailTarget) {
    $mailTarget.addEventListener(even, function () {
      ignoreUnload = true;
    });
  }

  w.addEventListener('beforeunload', function (e) {
    if (!ignoreUnload) {
      Blog.page.unload();
    } else {
      ignoreUnload = false;
    }
  });

  w.addEventListener('pageshow', function () {
    // fix OSX safari #162
    !Blog.page.visible && Blog.page.loaded();
  });

  w.addEventListener('resize', function () {
    w.BLOG.even = even = 'ontouchstart' in w ? 'touchstart' : 'click';
    Blog.toggleMenu();
    Blog.waterfall();
  });

  gotop.addEventListener(
    even,
    function () {
      animate(Blog.goTop.bind(Blog, 0));
    },
    false
  );

  menuToggle.addEventListener(
    even,
    function (e) {
      Blog.toggleMenu(true);
      e.preventDefault();
    },
    false
  );

  mask.addEventListener(
    even,
    function (e) {
      Blog.toggleMenu();
      Blog.hideOnMask.forEach(function (hide) {
        hide();
      });
      e.preventDefault();
    },
    false
  );

  d.addEventListener(
    'scroll',
    function () {
      var top = rootScollTop();
      Blog.toggleGotop(top);
      Blog.fixedHeader(top);
      Blog.toc.fixed(top);
      Blog.toc.actived(top);
    },
    false
  );

  if (w.BLOG.SHARE) {
    Blog.share();
  }

  if (w.BLOG.REWARD) {
    Blog.reward();
  }

  Blog.noop = noop;
  Blog.even = even;
  Blog.$ = $;
  Blog.$$ = $$;

  Object.keys(Blog).reduce(function (g, e) {
    g[e] = Blog[e];
    return g;
  }, w.BLOG);

  if (w.Waves) {
    Waves.init();
    Waves.attach('.global-share li', ['waves-block']);
    Waves.attach('.article-tag-list-link, #page-nav a, #page-nav span', [
      'waves-button'
    ]);
  }

  var doCopyDebounce = (function () {
    var timer = null;
    function core(textToCopy) {
      var maskElem = document.querySelector('#mask');
      var textToCopyElem = document.createElement('input');
      textToCopyElem.style.height = '0';
      textToCopyElem.style.opacity = '0';
      textToCopyElem.value = textToCopy;
      maskElem.appendChild(textToCopyElem);
      var range = document.createRange();
      range.selectNode(textToCopyElem);
      var selection = window.getSelection();
      if (selection.rangeCount > 0) selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand('copy');
      selection.removeAllRanges();
      maskElem.removeChild(textToCopyElem);
    }
    return function (textToCopy) {
      if (timer) {
        clearTimeout(timer);
      } else {
        core(textToCopy);
      }
      timer = setTimeout(function () {
        clearTimeout(timer);
        timer = null;
      }, 2000);
    };
  })();

  document.querySelector('.mail').addEventListener('click', function (e) {
    var hintContainerElem = document.querySelector('.hint-container');
    var oneHintElem = document.createElement('div');
    oneHintElem.className = 'hint';
    oneHintElem.innerHTML = '已复制';
    hintContainerElem.appendChild(oneHintElem);
    setTimeout(function () {
      hintContainerElem.removeChild(oneHintElem);
    }, 2500);

    doCopyDebounce(e.currentTarget.lastElementChild.textContent);
  });

  Fancybox.bind('[data-fancybox]', {
    contentClick: 'close',
    showClass: 'f-fadeFastIn',
    hideClass: 'f-fadeFastOut',
    Images: {
      zoom: false, // zoom animation
      Panzoom: {
        maxScale: 2
      }
    },
    on: {
      reveal: function (fancybox, slide) {
        if (slide['imgErr']) {
          fancybox.close();
        }
      }
    }
  });
})(window, document);
