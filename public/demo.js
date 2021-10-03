function switchCategory(categoryId, replaceHistoryData = false) {
  console.log(`switchCategory: catId=${categoryId}`);
  let category = findObjectInHierarchy(fastShop.json.categories, 'categories', 'id', categoryId);
  if (!category) {
    category = fastShop.json.categories;
  }
  onCatSelected(null, category, false, false);
  if (replaceHistoryData) {
    updatePageHistory(category);
  }
}

function onCatSelected(selectedCatElement, cat, updatePageHistory = true, clearSearch = true) {
  if (!cat) return;
  console.log(`onCatSelected: catId=${cat.id}, catName=${cat.name}`);
  filterByCategories(cat, updatePageHistory, clearSearch);

  if ((cat.level === 2 && cat.categories) || (cat.level === 3 && cat.id !== fastShop.categories3.categoryId)) {
    fastShop.categories3.empty();
    buildCategoriesMenuLevel(cat.level === 2 ? cat : cat.parent, 3).appendTo(fastShop.categories3);
  } else if (cat.level < 3) {
    fastShop.categories3.empty();
  }

  $('#categories ul li a').removeClass('selected');
  if (cat.level === 3) {
    $('#categories3 ul li a').removeClass('selected');
  }

  /*if (selectedCatElement) {
        selectedCatElement.addClass('selected');
    } else */
  {
    cat.uiElements?.forEach((uiElement) => {
      uiElement.addClass('selected');
    });
    if (cat.level === 3) {
      cat.parent.uiElements?.forEach((uiElement) => {
        uiElement.addClass('selected');
      });
    }
    if (cat.level === 2) {
      cat.uiElementsOfAggregatingCats?.forEach((uiElement) => {
        uiElement.addClass('selected');
      });
    }
  }
}

function buildCategoriesMenuLevel(parentCat, level) {
  let ulCat = $(`<ul class="category${level}"></ul>`);

  if (level === 3) {
    let liCatAllName = $(
      `<a class="categoryName selected" data-catLevel="${level}" data-id="cat3all" href="${prepareUrlForCategory(
        parentCat
      )}">Все товары категории "${parentCat.name}"</a>`
    ).on('click', function () {
      onCatSelected($(this), parentCat);
      return false;
    });
    parentCat.uiElementsOfAggregatingCats = [liCatAllName];
    $('<li></li>').append(liCatAllName).appendTo(ulCat);
  }

  $.each(parentCat.categories, function (i, cat) {
    let liCatName = $(
      `<a class="categoryName" data-catLevel="${level}" data-id="${cat.id}" href="${prepareUrlForCategory(cat)}">${
        cat.name
      }</a>`
    ).on('click', function () {
      onCatSelected($(this), cat);
      return false;
    });
    cat.uiElements = [liCatName];
    let liCat = $('<li></li>').append(liCatName);
    if (cat.categories && level === 1) {
      buildCategoriesMenuLevel(cat, level + 1).appendTo(liCat);
    }
    liCat.appendTo(ulCat);
  });
  return ulCat;
}

function fillCategoriesMetaData(categories, parentCategory, level) {
  $.each(categories, function (i, cat) {
    cat.level = level;
    cat.parent = parentCategory;
    fillCategoriesMetaData(cat.categories, cat, level + 1);
  });
}

function buildCategoriesMenu() {
  buildCategoriesMenuLevel(fastShop.json.categories, 1).appendTo($('#categories'));
}

function setQuickSearchFieldValue(searchTerm) {
  fastShop.quickSearch.val(searchTerm);
  updateQuickSearchEmptyInnerVisibility(searchTerm);
}

window.onpopstate = function (event) {
  //alert(`location: ${document.location}, state: ${JSON.stringify(event.state)}`)
  if (event && event.state && event.state.catId) {
    console.log(`onpopstate: event.state=${JSON.stringify(event.state)}`);
    switchCategory(event.state.catId);

    let searchTerm = event.state.searchTerm ?? '';
    setQuickSearchFieldValue(searchTerm);
    doQuickSearch(searchTerm, false);

    let filterSelectedOptions = event.state.filterSelectedOptions ?? [];
    Object.entries(fastShop.filterOptions).forEach(([filterName, options]) => {
      if (filterSelectedOptions[filterName] && filterSelectedOptions[filterName].selectedOptions.length > 0) {
        options.forEach(
          (o) => (o.selected = filterSelectedOptions[filterName].selectedOptions.indexOf(o.value) !== -1)
        );
      } else {
        options.forEach((o) => (o.selected = o.value === '@all'));
      }
      $(`#select-${filterName}`).bsMultiSelect('UpdateOptionsSelected');
      applyFilter(filterName);
    });
  }
};

$(document).ready(function () {
  $('#catalog').DataTable({
    rowGroup: {
      dataSrc: function (row) {
        return (
          row['cat1'] +
          (row['cat2'] && row['cat2'].length > 0 ? '|' + row['cat2'] : '') +
          (row['cat3'] && row['cat3'].length > 0 ? '|' + row['cat3'] : '')
        );
      },
      startRender: function (rows, group) {
        let categoryName = group.split('|').slice(-1)[0];
        if (fastShop?.json?.categories) {
          let category = findObjectInHierarchy(fastShop.json.categories, 'categories', 'name', categoryName);
          if (category) {
            let categoryElement = $(
              `<a class="categoryTableGroup" href="${prepareUrlForCategory(category)}">${category.name}</a>`
            );
            categoryElement.on('click', function () {
              onCatSelected(null, category);
              return false;
            });
            return categoryElement;
          }
        }
        return categoryName;
      },
    },
    //language

    initComplete: function () {
      fastShop.dataTable = $('#catalog').DataTable();
      fastShop.json = fastShop.dataTable.ajax.json();
      fastShop.currentCategory = fastShop.json.categories;
      fastShop.breadcrumbs = $('#breadcrumbs');
      fastShop.json.categories.level = 0;
      //$('#toolbarInner').detach().appendTo('#toolbar');
      this.api()
        .columns([4, 5, 6])
        .every(function () {
          let column = this;
          $('<br>').appendTo($(column.header()));
          // let select1 = $('<select id="select-' + column.dataSrc().match('^[a-zA-Z]+') + '"><option value="">Все варианты</option></select>')
          //     //.appendTo($(column.header()))
          //     .on('change', function () {
          //         let val = $.fn.dataTable.util.escapeRegex($(this).val());
          //         column.search((val && val !== '@all' || val === '') ? '^' + val + '$' : '', true, false).draw();
          //     });

          let dataName = column.dataSrc().match('^[a-zA-Z]+');
          let selectElementId = 'select-' + dataName;
          let selectDivElementId = 'selectDiv-' + dataName;
          let selectDiv = $(
            `<div id="${selectDivElementId}" style="display: table;width: 100%; height: 44px; padding: 3px;"><div style="display: table-cell;vertical-align:middle;width: 60px;">${$(
              column.header()
            ).text()}</div></div>`
          ).appendTo($('#toolbarInner'));
          let select = $(`<div id="${selectElementId}" style="display: table-cell;vertical-align:middle;"></div>`)
            // .appendTo(column.header());
            .appendTo(selectDiv);

          fastShop.filterOptions[dataName] = [
            { text: 'Все', value: '@all', hidden: false, disabled: false, selected: true },
          ];
        });

      fillCategoriesMetaData(fastShop.json.categories.categories, fastShop.json.categories, 1);
      buildCategoriesMenu();
      initFiltersAndSearch();

      $('#clearFilters').on('click', function () {
        clearFilters();
      });

      fastShop.quickSearch.on('input change paste keyup', function (event) {
        onQuickSearchInputChanged.call(this, event);
      });

      fastShop.quickSearch.on('search', function (event) {
        onQuickSearchInputChanged.call(this, event);
        this.blur();
      });

      fastShop.quickSearch.on('click', function () {
        cancelPrintPhrases();
      });

      $('.quickSearchEmptyInner').on('click', function () {
        setQuickSearchFieldValue('');
        doQuickSearch('');
      });

      let urlSearchParam = new URL(window.location.href).searchParams.get('search');
      if (urlSearchParam) {
        setQuickSearchFieldValue(urlSearchParam);
        doQuickSearch(urlSearchParam, false);
      }

      $('#catalog tbody').on('click', 'button', function () {
        let data = fastShop.dataTable.row($(this).parents('tr')).data();
        //openAddToCart(data);
      });

      $('#openCartButton').on('click', function () {
        openCart();
      });

      $('#multilineSearchToggle').change(function () {
        if ($(this).prop('checked')) {
          fastShop.quickSearch.hide();
          $('#multilineSearchWrapper').show();
        } else {
          fastShop.quickSearch.show();
          $('#multilineSearchWrapper').hide();
        }
      });

      animateMultiSearchPlaceholder();

      $('#catalogInfoDate').text(new Date(fastShop.json.date).toLocaleDateString('ru-RU'));
      $('#catalogInfoCount').text(fastShop.dataTable.rows().count());

      $('#catalog tbody').on('click', 'tr', function () {
        let row = fastShop.dataTable.row(this);
        let data = row.data();
        openAddToCart(data, row);
      });

      setTimeout(() => {
        cartApi.getCart((cart) => {
          fastShop.cart = cart;
          if (cart?.items) {
            // cart?.items.forEach(cartItem => {
            // });
            fastShop.dataTable
              .cells((index, data, node) => {
                // if (index.column === 9) debugger;
                return index.column === 9; // && cart.items.some(i=>i.id===data);
              })
              .invalidate();
          }
        });
      }, 1);
    },
  });

  let textAreas = document.getElementsByTagName('textarea');
  Array.prototype.forEach.call(textAreas, function (elem) {
    elem.placeholder = elem.placeholder.replace(/\\n/g, '\n');
  });

  $('#quickSearchEverywhere').on('click', function () {
    clearFilters(fastShop.quickSearch.val());
  });

  $(document).on('click', (e) => {
    closeAllAutocomplete();
  });

  $('#quickSearchAutocompleteDown')
    .show()
    .on('click', (e) => {
      openAutocomplete();
      e.stopPropagation();
    });
  $('#quickSearchAutocompleteUp')
    .hide()
    .on('click', (e) => {
      closeAllAutocomplete();
      e.stopPropagation();
    });
});

function renderCartCell(data, type, row) {
  // console.log(`renderCartCell: ${row['name']}, data: ${data}, row: ${JSON.stringify(row)}`);
  if (fastShop?.cart?.items && fastShop.cart.items.some((i) => i.id === data['idUnique'])) {
    return '<button type="button" class="btn btn-success" style="white-space:nowrap;"><div style="width: 28px;"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="16px" height="16px" fill="currentColor" viewBox="0 0 405.272 405.272" style="enable-background:new 0 0 405.272 405.272;" xml:space="preserve"><g>\t<path d="M393.401,124.425L179.603,338.208c-15.832,15.835-41.514,15.835-57.361,0L11.878,227.836\t\tc-15.838-15.835-15.838-41.52,0-57.358c15.841-15.841,41.521-15.841,57.355-0.006l81.698,81.699L336.037,67.064\t\tc15.841-15.841,41.523-15.829,57.358,0C409.23,82.902,409.23,108.578,393.401,124.425z"/></g></svg></div></button>';
  } else {
    return '<button type="button" class="btn btn-primary" style="white-space:nowrap;"><div style="width: 28px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-cart" viewBox="0 0 16 16"><path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>+</div></button>';
  }
}

function formatPriceQuantityUnit(priceQuantityUnit) {
  let formattedPriceQuantityUnit = priceQuantityUnit;
  if (priceQuantityUnit === 'м2') formattedPriceQuantityUnit = 'м<sup>2</sup>';
  return formattedPriceQuantityUnit;
}

function renderPriceCell(data, type, row) {
  return formatPrice(data, row['priceQuantityUnit']);
}

function clearFilters(searchTerm = '') {
  fastShop.categories3.empty();
  fastShop.dataTable.columns().every(function () {
    let column = this;
    column.search('');
  });

  onCatSelected(null, fastShop.json.categories);
  fastShop.dataTable.search('').draw();
  setQuickSearchFieldValue(searchTerm);
  doQuickSearch(searchTerm);
  $('#categories ul li span').removeClass('selected');
}

function doQuickSearch(str, updatePageHistory = true) {
  console.log(`doQuickSearch: str=${str}, updatePageHistory=${updatePageHistory}`);
  let searchTerm = str.length === 1 && fastShop.currentCategory?.id === 'root' ? '' : str;
  cancelPrintPhrases();
  if (updatePageHistory) updateSearchTermInPageHistory(searchTerm);
  if (searchTerm && searchTerm !== '' && fastShop.currentCategory.name !== 'root') {
    // $('#quickSearchInfoTerm').text(searchTerm);
    $('#quickSearchInfoWhere').text(fastShop.currentCategory.name);
    $('#quickSearchInfo').show();
  } else {
    $('#quickSearchInfo').hide();
  }
  if (searchTerm && searchTerm !== '' && fastShop.currentCategory.name === 'root') {
    $('#quickSearchInfoNotFound').show();
  } else {
    $('#quickSearchInfoNotFound').hide();
  }
  if (fastShop.quickSearchLastSearchedValue === searchTerm) return;
  fastShop.quickSearchLastSearchedValue = searchTerm;
  fastShop.dataTable
    .column('searchTerms:name')
    .search(searchTerm ? clearMorphologyInSearchTerm(searchTerm) : '', false, true)
    .draw();
  if (
    searchTerm &&
    searchTerm.trim() !== '' &&
    searchTerm.trim().length > 1 &&
    fastShop.dataTable.rows({ search: 'applied' }).count() > 0
  ) {
    setTimeout(
      () =>
        searchHistory?.addSearchTerm(searchTerm.trim(), () => {
          fetchLastSearchTerms();
        }),
      15
    );
  }
}

function closeAllAutocomplete() {
  $('#quickSearchAutocompleteUp').hide();
  $('#quickSearchAutocompleteDown').show();
  /*close all autocomplete lists in the document, except the one passed as an argument:*/
  $('.quickSearchAutocomplete-items').remove();
}

function clearMorphologyInSearchTerm(searchTerm) {
  let trimmedSearchTerm = searchTerm
    .replaceAll('\n', ' ')
    .replaceAll('\r', ' ')
    .replaceAll('\t', ' ')
    // eslint-disable-next-line quotes
    .replaceAll("'", ' ')
    .replaceAll('"', ' ')
    .replaceAll('`', ' ')
    .trim();
  let blocks = trimmedSearchTerm.split(' ');
  ['ые', 'ый', 'ая', 'ами', 'ой', 'ем', 'ие', 'ий', 'ой', 'иеся', 'ийся', 'аяся'].forEach((ch) => {
    blocks = blocks.map((b) => {
      return b.length >= 6 ? trimRightChars(b, ch) : b;
    });
  });
  let joined = blocks.join(' ');
  return joined;
}

function trimRightChars(str, chars) {
  return str.replace(new RegExp(`${chars}\$`, 'g'), '');
}

function GetCategoryChain(category) {
  let catChain = [];
  let curCat = category;
  while (curCat.parent !== undefined) {
    catChain.unshift(curCat);
    curCat = curCat.parent;
  }
  return catChain;
}

function filterByCategories(category, updatePageHistory = true, clearSearch = true) {
  console.log(
    `filterByCategories: catId=${category.id}, catName=${category.name}, updatePageHistory=${updatePageHistory}, clearSearch=${clearSearch}`
  );
  if (fastShop.currentCategory !== category && updatePageHistory) {
    pushPageHistory(category);
  }
  fastShop.currentCategory = category;

  let catChain = GetCategoryChain(category);
  fastShop.dataTable
    .column(0)
    .search(
      !catChain[0] || catChain[0].name === '' ? '' : '^' + $.fn.dataTable.util.escapeRegex(catChain[0].name) + '$',
      true,
      false
    );
  fastShop.dataTable
    .column(1)
    .search(
      !catChain[1] || catChain[1].name === '' ? '' : '^' + $.fn.dataTable.util.escapeRegex(catChain[1].name) + '$',
      true,
      false
    );
  fastShop.dataTable
    .column(2)
    .search(
      !catChain[2] || catChain[2].name === '' ? '' : '^' + $.fn.dataTable.util.escapeRegex(catChain[2].name) + '$',
      true,
      false
    )
    .draw();
  $('.tableCellSizeTitle').text(category?.columnNames?.size ?? 'Размер');
  $('.tableCellMarkTitle').text(category?.columnNames?.mark ?? 'Марка');
  $('.tableCellLengthTitle').text(category?.columnNames?.length ?? 'Длина');
  //$('.tableCellPriceQuantityUnit').text(category?.priceQuantityUnit ?? 'т');
  fastShop.dataTable.columns([4, 5, 6]).every(function () {
    let column = this;
    column.search('');
  });
  if (clearSearch) {
    setQuickSearchFieldValue('');
    doQuickSearch('', updatePageHistory);
  }
  // fastShop.quickSearch.change();
  updateFilterLists(category, updatePageHistory);
  updateTitleAndBreadcrumbs(category);
}

function updateTitleAndBreadcrumbs(category) {
  console.log(`updateTitleAndBreadcrumbs: catId:"${category.id}, catName:"${category.name}"`);
  let catChain = GetCategoryChain(category);
  $('#currentCategoryName').text(category.name === 'root' ? 'Каталог' : category.name);
  fastShop.breadcrumbs.empty();
  if (catChain.length > 0) {
    fastShop.breadcrumbs.append(
      $(`<a class="breadcrumbsItem" href="${prepareUrlForCategory(fastShop.json.categories)}">Каталог</a>`).on(
        'click',
        function () {
          onCatSelected(null, fastShop.json.categories);
          return false;
        }
      )
    );
    catChain.forEach((cat) => {
      fastShop.breadcrumbs.append($('<span> &rarr;&nbsp;</span>'));
      let breadcrumbsItem = $(`<a class="breadcrumbsItem" href="${prepareUrlForCategory(cat)}">${cat.name}</a>`);
      breadcrumbsItem.on('click', function () {
        onCatSelected(null, cat);
        return false;
      });
      fastShop.breadcrumbs.append(breadcrumbsItem);
    });
  }
}

function updateFilterLists(category, updatePageHistory) {
  fastShop.currentCategory = category;
  updateFilterList('size', category /*, 'Все размеры'*/);
  updateFilterList('mark', category /*, 'Все марки'*/);
  updateFilterList('length', category);
  if (updatePageHistory) {
    updateFilterOptionsInPageHistory();
  }
}

function updateFilterList(filterName, category, allName = 'Все') {
  fastShop.filterOptions[filterName].length = 0;
  fastShop.filterOptions[filterName].push({
    text: allName,
    value: '@all',
    hidden: false,
    disabled: false,
    selected: true,
  });
  if (category.filters && category.filters[filterName]) {
    $.each(category.filters[filterName] ?? [], function (i, item) {
      let itemName = typeof item === 'object' && item !== null ? item.name : item;
      let itemIsPopular = typeof item === 'object' && item !== null ? item.isPopular ?? false : false;
      fastShop.filterOptions[filterName].push({
        text: itemName === '' ? 'не указано' : itemName,
        value: itemName,
        hidden: false,
        disabled: false,
        selected: false,
        isPopular: itemIsPopular,
      });
    });
  }
  let select = $('#select-' + filterName);
  select?.bsMultiSelect('UpdateData');
  applyFilter(filterName);
}

function findObjectInHierarchy(hierarchicalObject, childName, propName, value) {
  if (propName === undefined || value === undefined || childName === undefined || hierarchicalObject === undefined)
    return null;
  let result = null;
  if (hierarchicalObject instanceof Array) {
    for (const hierarchicalObjectItem of hierarchicalObject) {
      result = findObjectInHierarchy(hierarchicalObjectItem, childName, propName, value);
      if (result) break;
    }
  } else {
    if (hierarchicalObject[propName] === value) return hierarchicalObject;
    if (hierarchicalObject[childName] && hierarchicalObject[childName] instanceof Array) {
      result = findObjectInHierarchy(hierarchicalObject[childName], childName, propName, value);
    }
  }
  return result;
}
