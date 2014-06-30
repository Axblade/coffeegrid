(function($) {
  return $.fn.coffeeGrid = function(options) {
    var addDecorators, bindPaging, bindPerPage, bindSearch, clearTable, clearTableBody, constructQuery, fillSearchPanner, loadList, readCache, reloadTableData, renderDecorators, renderPagination, renderSearchPannel, renderTableData, renderTableHeader, searchField, wrap, writeCache;
    this.defaults = {
      url: "",
      showing: true,
      urlToOpen: "",
      rowIdentifier: "",
      headers: [],
      fields: [],
      rowsPerPage: 10,
      perPage: [5, 10, 50],
      pageLinks: ["prev", "next"],
      pageDelimiter: "of",
      topPaging: false,
      searchExternal: false,
      searchFieldId: "",
      searchButtonId: "",
      searchLabel: "Find",
      cache: true,
      cookieExpirationDays: 1
    };
    this.settings = $.extend(this.defaults, options);
    this.params = {
      currentPage: 1,
      q: "",
      perPage: this.settings.rowsPerPage
    };
    clearTable = (function(_this) {
      return function() {
        return $(_this.table).removeChildren;
      };
    })(this);
    clearTableBody = (function(_this) {
      return function() {
        $("div.wrap.container." + _this.tableId).removeChildren;
        return $("#" + _this.tableId + " tbody").removeChildren;
      };
    })(this);
    renderTableHeader = (function(_this) {
      return function() {
        var h, header, _i, _len, _ref;
        header = "<thead><tr>";
        _ref = _this.settings.headers;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          h = _ref[_i];
          header += "<th>";
          header += h;
          header += "</th>";
        }
        header += "</tr></thead><tbody></tbody>";
        return $(_this.table).append(header);
      };
    })(this);
    renderTableData = (function(_this) {
      return function(data) {
        var field, row, rows, _i, _j, _len, _len1, _ref;
        rows = "";
        for (_i = 0, _len = data.length; _i < _len; _i++) {
          row = data[_i];
          rows += "<tr>";
          _ref = _this.settings.fields;
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            field = _ref[_j];
            rows += "<td>";
            if (_this.settings.showing) {
              rows += "<a href='" + _this.settings.urlToOpen.replace(/::/, row[_this.settings.rowIdentifier]) + "' >";
            }
            rows += row[field];
            if (_this.settings.showing) {
              rows += "</a>";
            }
            rows += "</td>";
          }
          rows += "</tr>";
        }
        rows += "";
        return $("#" + _this.tableId + " tbody").append(rows);
      };
    })(this);
    renderPagination = (function(_this) {
      return function(current, total, perPage) {
        var paginationHTML, pp, _i, _len, _ref;
        paginationHTML = "";
        paginationHTML += "<div id='tablePagination" + _this.tableId + "' class='paginator'>";
        paginationHTML += "<div class='per-page-selector'><select class='perPage tablePerPage_" + _this.tableId + "' name='per-page'>";
        _ref = _this.settings.perPage;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          pp = _ref[_i];
          paginationHTML += "<option value='" + pp;
          if (pp === perPage) {
            paginationHTML += "' selected='selected";
          }
          paginationHTML += "'>" + pp + "</option>";
        }
        paginationHTML += "</select></div>";
        paginationHTML += "<div class='page-links'><span>";
        if (current !== 1) {
          paginationHTML += "<a class='tablePagination_prevPage" + _this.tableId + "' href='javascript:;'>";
        }
        paginationHTML += _this.settings.pageLinks[0];
        if (current !== 1) {
          paginationHTML += "</a>";
        }
        paginationHTML += "</span>";
        paginationHTML += "&nbsp;<&nbsp;" + current;
        paginationHTML += "&nbsp;" + _this.settings.pageDelimiter + "&nbsp;" + total;
        paginationHTML += "&nbsp;>&nbsp;";
        if (current !== total) {
          paginationHTML += "<a class='tablePagination_nextPage" + _this.tableId + "' href='javascript:;'>";
        }
        paginationHTML += _this.settings.pageLinks[1];
        if (current !== total) {
          paginationHTML += "</a>";
        }
        paginationHTML += "</div>";
        return paginationHTML += "</div>";
      };
    })(this);
    renderSearchPannel = (function(_this) {
      return function() {
        var html;
        html = "";
        html += "<div class='search-pannel'><input type='text' class='input-medium search-query' id='q_";
        html += _this.tableId;
        html += "'>";
        html += "<button type='submit' class='btn' id='q_" + _this.tableId + "_btn'>";
        html += _this.settings.searchLabel;
        return html += "</button></div>";
      };
    })(this);
    searchField = (function(_this) {
      return function() {
        if (_this.settings.searchExternal === true) {
          return "#" + _this.settings.searchFieldId;
        } else {
          return "#q_" + _this.tableId;
        }
      };
    })(this);
    fillSearchPanner = (function(_this) {
      return function() {
        searchField = searchField();
        return $(searchField).val(_this.params.q);
      };
    })(this);
    renderDecorators = (function(_this) {
      return function(data) {
        var pager, top;
        pager = renderPagination(data.page, data.total, data.perPage);
        if (_this.settings.topPaging || !_this.settings.searchExternal) {
          top = "";
          if (!_this.settings.searchExternal) {
            top += renderSearchPannel();
          }
          top += pager;
          $(_this.table).before(wrap(top));
        }
        return $(_this.table).after(wrap(pager));
      };
    })(this);
    bindPaging = (function(_this) {
      return function(data) {
        $(".tablePagination_nextPage" + _this.tableId).on("click", function(e) {
          var page;
          page = _this.params.currentPage < data.total ? _this.params.currentPage = _this.params.currentPage + 1 : _this.params.currentPage >= data.total ? _this.params.currentPage = data.total : _this.params.currentPage = 1;
          return reloadTableData(page);
        });
        return $(".tablePagination_prevPage" + _this.tableId).on("click", function(e) {
          var page;
          page = _this.params.currentPage <= data.total ? _this.params.currentPage = _this.params.currentPage - 1 : _this.params.currentPage > data.total ? _this.params.currentPage = data.total : _this.params.currentPage = 1;
          return reloadTableData(page);
        });
      };
    })(this);
    bindPerPage = (function(_this) {
      return function() {
        return $(".tablePerPage_" + _this.tableId).on('change', {
          tableId: _this.tableId,
          current: _this.params.currentPage
        }, function(e) {
          var perPage;
          perPage = $(this).val() || this.params.perPage;
          $(".perPage.tablePerPage_" + e.data.tableId).val(perPage);
          this.params.perPage = perPage;
          return reloadTableData(e.data.current);
        });
      };
    })(this);
    bindSearch = (function(_this) {
      return function() {
        var searchButton;
        searchButton = _this.settings.searchExternal === true ? "#" + _this.settings.searchButtonId : "#q_" + _this.tableId + "_btn";
        return $(searchButton).on('click', {
          current: _this.params.currentPage
        }, function(e) {
          return reloadTableData(e.data.current);
        });
      };
    })(this);
    addDecorators = (function(_this) {
      return function(data) {
        renderDecorators(data);
        if (data.total > 1) {
          bindPaging(data);
        }
        bindPerPage();
        return bindSearch();
      };
    })(this);
    wrap = (function(_this) {
      return function(target) {
        var html;
        html = "";
        html += "<div class='wrap container " + _this.tableId + "'>";
        html += target;
        return html += "</div>";
      };
    })(this);
    constructQuery = (function(_this) {
      return function(page) {
        var query;
        query = "";
        query += "?page=";
        query += page;
        query += "&perPage=";
        query += $(".perPage.tablePerPage_" + _this.tableId).val() || _this.params.perPage;
        query += "&order=";
        query += "1";
        query += "&q=";
        return query += $("#q_" + _this.tableId).val() || _this.params.q;
      };
    })(this);
    writeCache = (function(_this) {
      return function() {
        var page, pageCookie, perPage, perPageCookie, q, qCookie;
        perPage = $(".perPage.tablePerPage_" + _this.tableId).val();
        perPageCookie = "cg_perPage_" + _this.tableId;
        searchField = searchField();
        q = $(searchField).val();
        qCookie = "cg_q_" + _this.tableId;
        page = _this.params.currentPage;
        pageCookie = "cg_page_" + _this.tableId;
        if (_this.settings.perPage.indexOf(parseInt(perPage)) > -1) {
          $.cookie(perPageCookie, perPage, {
            expires: _this.settings.cookieExpirationDays
          });
        } else {
          $.cookie(perPageCookie, _this.params.perPage, {
            expires: _this.settings.cookieExpirationDays
          });
        }
        $.cookie(qCookie, q, {
          expires: _this.settings.cookieExpirationDays
        });
        return $.cookie(pageCookie, page, {
          expires: _this.settings.cookieExpirationDays
        });
      };
    })(this);
    readCache = (function(_this) {
      return function() {
        var page, perPage, q;
        perPage = $.cookie("cg_perPage_" + _this.tableId);
        q = $.cookie("cg_q_" + _this.tableId);
        page = $.cookie("cg_page_" + _this.tableId);
        _this.params.perPage = _this.settings.perPage.indexOf(parseInt(perPage)) > 0 ? perPage : _this.params.perPage;
        _this.params.q = q !== void 0 ? q : "";
        return _this.params.currentPage = page !== void 0 ? page : 1;
      };
    })(this);
    loadList = (function(_this) {
      return function() {
        var url;
        if (_this.settings.cache) {
          readCache();
        }
        url = _this.settings.cache ? _this.settings.url + constructQuery(_this.params.currentPage) : _this.settings.url;
        return $.ajax(url, {
          data: "json",
          type: "GET",
          error: function() {
            return alert("error");
          },
          success: function(data) {
            var tds;
            $("#" + this.tableId + " tbody").removeChildren;
            tds = renderTableData(data.data);
            $(this.table).append(tds);
            addDecorators(data);
            return fillSearchPanner();
          }
        });
      };
    })(this);
    reloadTableData = (function(_this) {
      return function(page) {
        var q;
        q = constructQuery(page);
        if (_this.settings.cache) {
          writeCache();
        }
        return $.ajax(_this.settings.url + q, {
          data: "json",
          type: "GET",
          error: function() {
            return alert("error");
          },
          success: function(data) {
            var tds;
            clearTableBody();
            tds = renderTableData(data.data);
            renderDecorators(data);
            bindPaging(data);
            bindPerPage();
            bindSearch();
            fillSearchPanner();
            return $(this.table).append(tds);
          }
        });
      };
    })(this);
    return this.each((function(_this) {
      return function() {
        _this.table = $(_this)[0];
        _this.tableId = _this.table.id;
        clearTable();
        renderTableHeader();
        return loadList();
      };
    })(this));
  };
})(jQuery);

//# sourceMappingURL=coffeegrid.js.map
