(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
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
      clearTable = __bind(function() {
        $(this.table).text("");
        return $(this.table).removeChildren;
      }, this);
      clearTableBody = __bind(function() {
        $("div.wrap.container." + this.tableId).text("");
        $("div.wrap.container." + this.tableId).removeChildren;
        $("#" + this.tableId + " tbody").text("");
        return $("#" + this.tableId + " tbody").removeChildren;
      }, this);
      renderTableHeader = __bind(function() {
        var h, header, _i, _len, _ref;
        header = "<thead><tr>";
        _ref = this.settings.headers;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          h = _ref[_i];
          header += "<th>";
          header += h;
          header += "</th>";
        }
        header += "</tr></thead><tbody></tbody>";
        return $(this.table).append(header);
      }, this);
      renderTableData = __bind(function(data) {
        var field, row, rows, _i, _j, _len, _len2, _ref;
        rows = "";
        for (_i = 0, _len = data.length; _i < _len; _i++) {
          row = data[_i];
          rows += "<tr>";
          _ref = this.settings.fields;
          for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
            field = _ref[_j];
            rows += "<td>";
            if (this.settings.showing) {
              rows += "<a href='" + this.settings.urlToOpen.replace(/::/, row[this.settings.rowIdentifier]) + "' >";
            }
            rows += row[field];
            if (this.settings.showing) {
              rows += "</a>";
            }
            rows += "</td>";
          }
          rows += "</tr>";
        }
        rows += "";
        return $("#" + this.tableId + " tbody").append(rows);
      }, this);
      renderPagination = __bind(function(current, total, perPage) {
        var paginationHTML, pp, _i, _len, _ref;
        paginationHTML = "";
        paginationHTML += "<div id='tablePagination" + this.tableId + "' class='paginator'>";
        paginationHTML += "<div class='per-page-selector'><select class='perPage tablePerPage_" + this.tableId + "' name='per-page'>";
        _ref = this.settings.perPage;
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
          paginationHTML += "<a class='tablePagination_prevPage" + this.tableId + "' href='javascript:;'>";
        }
        paginationHTML += this.settings.pageLinks[0];
        if (current !== 1) {
          paginationHTML += "</a>";
        }
        paginationHTML += "</span>";
        paginationHTML += "&nbsp;<&nbsp;" + current;
        paginationHTML += "&nbsp;" + this.settings.pageDelimiter + "&nbsp;" + total;
        paginationHTML += "&nbsp;>&nbsp;";
        if (current !== total) {
          paginationHTML += "<a class='tablePagination_nextPage" + this.tableId + "' href='javascript:;'>";
        }
        paginationHTML += this.settings.pageLinks[1];
        if (current !== total) {
          paginationHTML += "</a>";
        }
        paginationHTML += "</div>";
        return paginationHTML += "</div>";
      }, this);
      renderSearchPannel = __bind(function() {
        var html;
        html = "";
        html += "<div class='search-pannel'><input type='text' class='input-medium search-query' id='q_";
        html += this.tableId;
        html += "'>";
        html += "<button type='submit' class='btn' id='q_" + this.tableId + "_btn'>";
        html += this.settings.searchLabel;
        return html += "</button></div>";
      }, this);
      searchField = __bind(function() {
        if (this.settings.searchExternal === true) {
          return "#" + this.settings.searchFieldId;
        } else {
          return "#q_" + this.tableId;
        }
      }, this);
      fillSearchPanner = __bind(function() {
        searchField = searchField();
        return $(searchField).val(this.params.q);
      }, this);
      renderDecorators = __bind(function(data) {
        var pager, top;
        pager = renderPagination(data.page, data.total, data.perPage);
        if (this.settings.topPaging || !this.settings.searchExternal) {
          top = "";
          if (!this.settings.searchExternal) {
            top += renderSearchPannel();
          }
          top += pager;
          $(this.table).before(wrap(top));
        }
        return $(this.table).after(wrap(pager));
      }, this);
      bindPaging = __bind(function(data) {
        $(".tablePagination_nextPage" + this.tableId).on("click", __bind(function(e) {
          var page;
          page = this.params.currentPage < data.total ? this.params.currentPage = this.params.currentPage + 1 : this.params.currentPage >= data.total ? this.params.currentPage = data.total : this.params.currentPage = 1;
          return reloadTableData(page);
        }, this));
        return $(".tablePagination_prevPage" + this.tableId).on("click", __bind(function(e) {
          var page;
          page = this.params.currentPage <= data.total ? this.params.currentPage = this.params.currentPage - 1 : this.params.currentPage > data.total ? this.params.currentPage = data.total : this.params.currentPage = 1;
          return reloadTableData(page);
        }, this));
      }, this);
      bindPerPage = __bind(function() {
        return $(".tablePerPage_" + this.tableId).on('change', {
          tableId: this.tableId,
          current: this.params.currentPage
        }, function(e) {
          var perPage;
          perPage = $(this).val() || this.params.perPage;
          $(".perPage.tablePerPage_" + e.data.tableId).val(perPage);
          this.params.perPage = perPage;
          return reloadTableData(e.data.current);
        });
      }, this);
      bindSearch = __bind(function() {
        var searchButton;
        searchButton = this.settings.searchExternal === true ? "#" + this.settings.searchButtonId : "#q_" + this.tableId + "_btn";
        return $(searchButton).on('click', {
          current: this.params.currentPage
        }, function(e) {
          return reloadTableData(e.data.current);
        });
      }, this);
      addDecorators = __bind(function(data) {
        renderDecorators(data);
        if (data.total > 1) {
          bindPaging(data);
        }
        bindPerPage();
        return bindSearch();
      }, this);
      constructQuery = __bind(function(page) {
        var query;
        query = "";
        query += "?page=";
        query += page;
        query += "&perPage=";
        query += $(".perPage.tablePerPage_" + this.tableId).val() || this.params.perPage;
        query += "&order=";
        query += "1";
        query += "&q=";
        return query += $("#q_" + this.tableId).val() || this.params.q;
      }, this);
      wrap = __bind(function(target) {
        var html;
        html = "";
        html += "<div class='wrap container " + this.tableId + "'>";
        html += target;
        return html += "</div>";
      }, this);
      writeCache = __bind(function() {
        var page, pageCookie, perPage, perPageCookie, q, qCookie;
        perPage = $(".perPage.tablePerPage_" + this.tableId).val();
        perPageCookie = "cg_perPage_" + this.tableId;
        searchField = searchField();
        q = $(searchField).val();
        qCookie = "cg_q_" + this.tableId;
        page = this.params.currentPage;
        pageCookie = "cg_page_" + this.tableId;
        if (this.settings.perPage.indexOf(parseInt(perPage)) > -1) {
          $.cookie(perPageCookie, perPage, {
            expires: this.settings.cookieExpirationDays
          });
        } else {
          $.cookie(perPageCookie, this.params.perPage, {
            expires: this.settings.cookieExpirationDays
          });
        }
        $.cookie(qCookie, q, {
          expires: this.settings.cookieExpirationDays
        });
        return $.cookie(pageCookie, page, {
          expires: this.settings.cookieExpirationDays
        });
      }, this);
      readCache = __bind(function() {
        var page, perPage, q;
        perPage = $.cookie("cg_perPage_" + this.tableId);
        q = $.cookie("cg_q_" + this.tableId);
        page = $.cookie("cg_page_" + this.tableId);
        this.params.perPage = this.settings.perPage.indexOf(parseInt(perPage)) > 0 ? perPage : this.params.perPage;
        this.params.q = q !== void 0 ? q : "";
        return this.params.currentPage = page !== void 0 ? page : 1;
      }, this);
      loadList = __bind(function() {
        var url;
        if (this.settings.cache) {
          readCache();
        }
        url = this.settings.cache ? this.settings.url + constructQuery(this.params.currentPage) : this.settings.url;
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
      }, this);
      reloadTableData = __bind(function(page) {
        var q;
        q = constructQuery(page);
        if (this.settings.cache) {
          writeCache();
        }
        return $.ajax(this.settings.url + q, {
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
      }, this);
      return this.each(__bind(function() {
        this.table = $(this)[0];
        this.tableId = this.table.id;
        clearTable();
        renderTableHeader();
        return loadList();
      }, this));
    };
  })(jQuery);
}).call(this);
