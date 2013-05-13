(( $ ) ->
  $.fn.coffeeGrid = (options) ->
    # plugin default settings
    @defaults = {
      url: ""                     # base url for ajax calls
      showing: true               # render links in table flag
      urlToOpen: ""               # url as a href for links, :: is a parameter placeholder
      rowIdentifier: ""           # field value to replace :: in urlToOpen link
      headers: []                 # table headers
      fields: []                  # field identifiers in json data
      rowsPerPage: 10             # base paging value
      perPage: [5, 10, 50]        # paging options
      pageLinks: ["prev", "next"] # text for paging links
      pageDelimiter: "of"         # paging delimiter aka "current <delimiter> total"
      topPaging: false            # render paging links on top
      searchExternal: false        # use external input for search
      searchFieldId: ""           # external search field id (without # or any other jQuery symbols)
      searchButtonId: ""          # external search button id (without # or any other jQuery symbols)
      searchLabel: "Find"         # label for search field (if internal is used)
      cache: true                 # flag for storing selection in cookies
      cookieExpirationDays: 1     # time to keep cookies (in days)
    }

    # plugin settings
    @settings = $.extend(
      @defaults,
      options
    )

    # array of current values
    @params = {
      currentPage: 1
      q: ""
      perPage: @settings.rowsPerPage
    }

    # clear <table> tag
    clearTable = () =>
      $(@table).text("")
      $(@table).removeChildren

    # cleat only <tbody> of <table>
    clearTableBody = () =>
      $("div.wrap.container." + @tableId).text("")
      $("div.wrap.container." + @tableId).removeChildren
      $("#" + @tableId + " tbody").text("")
      $("#" + @tableId + " tbody").removeChildren

    # draw <thead>, values are taken from "headers" array
    renderTableHeader = () =>
      header = "<thead><tr>"
      for h in @settings.headers
        header += "<th>"
        header += h
        header += "</th>"
      header += "</tr></thead><tbody></tbody>"
      $(@table).append(header)

    # draw <tbody>'s <tr>'s, values are taken from "fields" array
    # create link on each value if "showing" setting is "true"
    renderTableData = (data) =>
      rows = ""
      for row in data
        rows += "<tr>"
        for field in @settings.fields
          rows += "<td>"
          rows += "<a href='" + @settings.urlToOpen.replace(/::/, row[@settings.rowIdentifier]) + "' >" if @settings.showing
          rows += row[field]
          rows += "</a>" if @settings.showing
          rows += "</td>"
        rows += "</tr>"
      rows += ""
      $("#" + @tableId + " tbody").append(rows)

    # draw pagination links and selector
    renderPagination = (current, total, perPage) =>
      paginationHTML = ""
      paginationHTML += "<div id='tablePagination" + @tableId + "' class='paginator'>"
      paginationHTML += "<div class='per-page-selector'><select class='perPage tablePerPage_" + @tableId + "' name='per-page'>"
      for pp in @settings.perPage
        paginationHTML += "<option value='" + pp
        paginationHTML += "' selected='selected" if pp == perPage
        paginationHTML += "'>" + pp + "</option>"
      paginationHTML += "</select></div>"
      paginationHTML += "<div class='page-links'><span>"
      paginationHTML += "<a class='tablePagination_prevPage" + @tableId + "' href='javascript:;'>"  if current != 1
      paginationHTML += @settings.pageLinks[0]
      paginationHTML += "</a>" if current != 1
      paginationHTML += "</span>"
      paginationHTML += "&nbsp;<&nbsp;" + current
      paginationHTML += "&nbsp;" +  @settings.pageDelimiter + "&nbsp;" + total
      paginationHTML += "&nbsp;>&nbsp;"
      paginationHTML += "<a class='tablePagination_nextPage" + @tableId + "' href='javascript:;'>"  if current != total
      paginationHTML += @settings.pageLinks[1]
      paginationHTML += "</a>" if current != total
      paginationHTML += "</div>"
      paginationHTML += "</div>"

    # draw search pannel (inner)
    renderSearchPannel = () =>
      html = ""
      html += "<div class='search-pannel'><input type='text' class='input-medium search-query' id='q_"
      html += @tableId
      html += "'>"
      html += "<button type='submit' class='btn' id='q_" + @tableId + "_btn'>"
      html += @settings.searchLabel
      html += "</button></div>"

    # create selector for a search field (internal or external)
    searchField = () =>
     if (@settings.searchExternal == true)
       "#" + @settings.searchFieldId
     else
       "#q_" + @tableId

    # put search query data to search field (internal or external)
    fillSearchPanner = () =>
      searchField = searchField()
      $(searchField).val(@params.q)

    # render paging and search bar depending on settings
    renderDecorators = (data) =>
      pager = renderPagination(data.page, data.total, data.perPage)
      if (@settings.topPaging or not @settings.searchExternal)
        top = ""
        top += renderSearchPannel() if not @settings.searchExternal
        top += pager
        $(@table).before(wrap(top))
      $(@table).after(wrap(pager))

    # bind 'onclick' to paging links
    bindPaging = (data) =>
      $(".tablePagination_nextPage" + @tableId).on("click", (e) =>
        # load next page
        page = if (@params.currentPage < data.total)
          @params.currentPage = @params.currentPage + 1
        else if (@params.currentPage >= data.total)
          @params.currentPage = data.total
        else
          @params.currentPage = 1
        reloadTableData(page)
      )
      $(".tablePagination_prevPage" + @tableId).on("click", (e) =>
        # load next page
        page = if (@params.currentPage <= data.total)
          @params.currentPage = @params.currentPage - 1
        else if (@params.currentPage > data.total)
          @params.currentPage = data.total
        else
          @params.currentPage = 1
        reloadTableData(page)
      )

    # bind 'onchange' to perPage selectors
    bindPerPage = () =>
      $(".tablePerPage_" + @tableId).on('change', {tableId: @tableId, current: @params.currentPage}, (e) ->
        perPage = $(this).val() || @params.perPage
        $(".perPage.tablePerPage_" + e.data.tableId).val(perPage)
        @params.perPage = perPage
        # load new number of data
        reloadTableData(e.data.current)
      )

    # bind 'onclick' to search button
    bindSearch = () =>
      searchButton = if (@settings.searchExternal == true)
        "#" + @settings.searchButtonId
      else
        "#q_" + @tableId + "_btn"
      $(searchButton).on('click', {current: @params.currentPage}, (e) ->
        # load filtered
        reloadTableData(e.data.current)
      )

    # render search bar and paging, then bind events
    addDecorators = (data) =>
      renderDecorators(data)
      if (data.total > 1)
        bindPaging(data)
      bindPerPage()
      bindSearch()

    # wrap target string into a div ('container' class is used to set full-width element for bootstrap css)
    wrap = (target) =>
      html = ""
      html += "<div class='wrap container " + @tableId + "'>"
      html += target
      html += "</div>"

    # translate current values to ajax query GET parameters
    constructQuery = (page) =>
      query = ""
      query += "?page="
      query += page
      query += "&perPage="
      query += $(".perPage.tablePerPage_" + @tableId).val() || @params.perPage
      query += "&order="
      query += "1"
      query += "&q="
      query += $("#q_" + @tableId).val() || @params.q

    # store current params in cookies
    writeCache = () =>
      perPage = $(".perPage.tablePerPage_" + @tableId).val()
      perPageCookie = "cg_perPage_" + @tableId
      searchField = searchField()
      q = $(searchField).val()
      qCookie = "cg_q_" + @tableId
      page = @params.currentPage
      pageCookie = "cg_page_" + @tableId
      if @settings.perPage.indexOf(parseInt(perPage)) > -1
        $.cookie perPageCookie, perPage, {expires: @settings.cookieExpirationDays}
      else
        $.cookie perPageCookie, @params.perPage, {expires: @settings.cookieExpirationDays}
      $.cookie qCookie, q, {expires: @settings.cookieExpirationDays}
      $.cookie pageCookie, page, {expires: @settings.cookieExpirationDays}

    # read current params from cookies
    readCache = () =>
      perPage = $.cookie "cg_perPage_" + @tableId
      q = $.cookie "cg_q_" + @tableId
      page = $.cookie "cg_page_" + @tableId
      # read per page cookie
      @params.perPage = if @settings.perPage.indexOf(parseInt(perPage)) > 0
        perPage
      else
        @params.perPage
      # read query cookie
      @params.q = if q != undefined
        q
      else
        ""
      # read page cookie
      @params.currentPage = if page != undefined
        page
      else
        1

    # initial ajax call to get data
    loadList = () =>
      readCache() if (@settings.cache)
      url = if (@settings.cache)
        @settings.url + constructQuery(@params.currentPage)
      else
        @settings.url
      $.ajax url,
        data: "json"
        type: "GET"
        error: () ->
          alert "error"
        success: (data) ->
          $("#" + @tableId + " tbody").removeChildren
          tds = renderTableData(data.data)
          $(@table).append(tds)
          addDecorators(data)
          fillSearchPanner()

    # ajax call to rerender <table>'s <tbody>
    reloadTableData = (page) =>
      q = constructQuery(page)
      writeCache() if @settings.cache
      $.ajax @settings.url + q,
        data: "json"
        type: "GET"
        error: () ->
          alert "error"
        success: (data) ->
          clearTableBody()
          tds = renderTableData(data.data)
          renderDecorators(data)
          bindPaging(data)
          bindPerPage()
          bindSearch()
          fillSearchPanner()
          $(@table).append(tds)

    # do all of defined machinery command
    this.each( () =>
      @table = $(this)[0]
      @tableId = @table.id
      clearTable()
      renderTableHeader()
      loadList()
    )
)( jQuery )