let fastShop = {};

function prepareUrlForCategory(cat) {
  let url = new URL(document.URL);
  let searchParams = url.searchParams;
  if (cat.id && cat.id !== 'root') {
    searchParams.set('cat', cat.id);
  } else {
    if (searchParams.has('cat')) searchParams.delete('cat');
  }
  url.search = searchParams.toString();
  return url.toString();
}

function preparePageTitle(cat) {
  return cat.name === 'root' ? fastShop.titleDefault : `${cat.name}${fastShop.titleAppendCategory}`;
}

function preparePageHistoryData(cat) {
  let pageTitle = preparePageTitle(cat);
  let url = new URL(document.URL);
  let searchParams = url.searchParams;
  if (cat.id && cat.id !== 'root') {
    searchParams.set('cat', cat.id);
  } else {
    if (searchParams.has('cat')) searchParams.delete('cat');
  }
  url.search = searchParams.toString();
  let newUrl = url.toString();
  let searchTerm = fastShop.quickSearch.val();
  let eventState = { catId: cat.id, searchTerm: searchTerm, pageTitle: pageTitle };
  return { eventState: eventState, pageTitle: pageTitle, newUrl: newUrl, searchTerm: searchTerm };
}

function pushPageHistory(cat) {
  let data = preparePageHistoryData(cat);
  console.log(
    `history push: catId=${cat.id}, searchTerm=${data.searchTerm}, pageTitle=${data.pageTitle}, newUrl=${data.newUrl}`
  );
  window.history.pushState(data.eventState, '', data.newUrl);
  document.title = data.pageTitle;
}

function updatePageHistory(cat) {
  let data = preparePageHistoryData(cat);
  console.log(
    `history replace current: catId=${cat.id}, searchTerm=${data.searchTerm}, pageTitle=${data.pageTitle}, newUrl=${data.newUrl}`
  );
  window.history.replaceState(data.eventState, '', data.newUrl);
  document.title = data.pageTitle;
}

function updateSearchTermInPageHistory(searchTerm) {
  let url = new URL(document.URL);
  let search_params = url.searchParams;
  if (searchTerm && searchTerm !== '') {
    search_params.set('search', searchTerm);
  } else {
    if (search_params.has('search')) search_params.delete('search');
  }
  url.search = search_params.toString();
  let new_url = url.toString();
  let pageState = window.history.state;
  if (window.history.state) {
    window.history.state.searchTerm = searchTerm;
  }
  console.log(`history update: searchTerm=${searchTerm}, newUrl=${new_url}`);
  window.history.replaceState(window.history.state, '', new_url);
}

function updateFilterOptionsInPageHistory() {
  let selectedOptions = {};
  Object.entries(fastShop.filterOptions).forEach(
    ([filterName, options]) =>
      (selectedOptions[filterName] = {
        filterName: filterName,
        selectedOptions: options.filter((o) => o.selected && o.value !== '@all').map((o) => o.value),
      })
  );
  let url = new URL(document.URL);
  let search_params = url.searchParams;

  Object.entries(selectedOptions).forEach(([filterName, filter]) => {
    let urlFilterName = 'f-' + filterName;
    //if (search_params.has(urlFilterName)) search_params.delete(urlFilterName);
    if (filter.selectedOptions.length > 0) {
      search_params.set(urlFilterName, filter.selectedOptions.map((o) => (o.length === 0 ? '@empty' : o)).join('|'));
    } else {
      if (search_params.has(urlFilterName)) search_params.delete(urlFilterName);
    }
  });

  url.search = search_params.toString();
  let new_url = url.toString();
  let pageState = window.history.state;
  if (window.history.state) {
    window.history.state.filterSelectedOptions = selectedOptions;
  }
  console.log(
    `history update: filters=${JSON.stringify(selectedOptions)}, newUrl=${new_url}, newState=${JSON.stringify(
      window.history.state
    )}`
  );
  window.history.replaceState(window.history.state, '', new_url);
}

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

function initFiltersAndSearch() {
  //filterByCategories('RANDOMBADVALUE', '', '');

  let url = new URL(document.URL);
  let searchParams = url.searchParams;
  console.log(`initFiltersAndSearch: searchParams=${searchParams.toString()}`);

  if (searchParams.has('cat')) {
    switchCategory(searchParams.get('cat'), true);
  } else {
    switchCategory('root', true);
  }

  let searchTerm = searchParams.has('search') ? searchParams.get('search') : '';
  setQuickSearchFieldValue(searchTerm);
  doQuickSearch(searchTerm, true);

  Object.entries(fastShop.filterOptions).forEach(([filterName, options]) => {
    let selectedOptions = searchParams.has('f-' + filterName)
      ? searchParams
          .get('f-' + filterName)
          .split('|')
          .filter((o) => o.length > 0)
          .map((o) => (o === '@empty' ? '' : o))
      : [];
    if (selectedOptions.length > 0) {
      options.forEach((o) => (o.selected = selectedOptions.indexOf(o.value) !== -1));
    } else {
      options.forEach((o) => (o.selected = o.value === '@all'));
    }
    $(`#select-${filterName}`).bsMultiSelect('UpdateOptionsSelected');
    applyFilter(filterName);
  });
  updateFilterOptionsInPageHistory();
  setTimeout(() => fetchLastSearchTerms(), 1);
}

function updateQuickSearchEmptyInnerVisibility(searchTerm) {
  if (searchTerm && searchTerm !== '') {
    $('.quickSearchEmptyInner').addClass('visible');
  } else {
    $('.quickSearchEmptyInner').removeClass('visible');
  }
}

function onQuickSearchInputChanged(event) {
  console.log(`quickSearch-event: str:"${this.value}", event_type:${event.type}`);
  updateQuickSearchEmptyInnerVisibility(this.value);
  if (this.value !== fastShop.quickSearchLastFieldValue || this.value !== fastShop.quickSearchLastSearchedValue) {
    fastShop.quickSearchLastFieldValue = this.value;
    doQuickSearch(this.value);
  }
}

window.mobileCheck = function () {
  let check = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};

function applyFilter(dataName) {
  let showAll = fastShop.filterOptions[dataName].filter((f) => f.value === '@all').every((f) => f.selected);
  let selectedItems = fastShop.filterOptions[dataName]
    .filter((f) => f.selected)
    .map((f) => '^' + $.fn.dataTable.util.escapeRegex(f.value) + '$');
  let selectedRegex = selectedItems.join('|');
  fastShop.dataTable
    .column(`${dataName}:name`)
    .search(selectedRegex && !showAll ? selectedRegex : '', true, false)
    .draw();
}

function processFilterOptionSelected(o, i, dataName) {
  let selectElementId = 'select-' + dataName;
  if (fastShop.filterOptions[dataName].length < 2) {
    o.selected = true;
    setTimeout(() => {
      $(`#${selectElementId}`).bsMultiSelect('UpdateOptionsSelected');
    }, 0);
    return true;
  }
  o.selected = i;
  console.log(`selected filter option: '${o.text}, json: ${JSON.stringify(o)}, value: '${i}'`);

  if (o.value === '@all') {
    fastShop.filterOptions[dataName].filter((f) => f.value !== '@all').forEach((f) => (f.selected = !i));
  } else {
    let allSelected = fastShop.filterOptions[dataName].filter((f) => f.value !== '@all').every((f) => !f.selected);
    fastShop.filterOptions[dataName].filter((f) => f.value === '@all').forEach((f) => (f.selected = allSelected));
  }
  setTimeout(() => {
    $(`#${selectElementId}`).bsMultiSelect('UpdateOptionsSelected');
  }, 0);
  applyFilter(dataName);
  updateFilterOptionsInPageHistory();
}

function updateTableRowAppearance(row) {
  row?.invalidate().draw();
}

function openAddToCart(data, row) {
  let productModal = new bootstrap.Modal($('#productModal'));
  $('#productModalLabel').html(data['nameFull']);
  $('#productModalFieldSize').html(data['size'][0]);
  $('#productModalFieldMark').html(data['mark'][0]);
  $('#productModalFieldLength').html(data['length'][0]);
  $('#productModalFieldPrice').html(formatPrice(data['price'], data['priceQuantityUnit']));
  $('#productModalFieldPriceQuantityUnit').html(formatPriceQuantityUnit(data['priceQuantityUnit']));
  let productModalInputCount = $('#productModalInputCount');
  let productModalAddToCart = $('#productModalAddToCart');
  let productModalRemoveFromCart = $('#productModalRemoveFromCart');
  $('#productModalInCartCountQuantityUnit').html(formatPriceQuantityUnit(data['priceQuantityUnit']));
  let productModalFooterGeneral = $('#productModalFooterGeneral');
  let productModalFooterInCart = $('#productModalFooterInCart');
  let productModalInCartCount = $('#productModalInCartCount');
  let productModalInCartTotalPrice = $('#productModalInCartTotalPrice');
  let productModalInCartDiv = $('#productModalInCartDiv');

  productModalAddToCart.prop('disabled', false);
  productModalRemoveFromCart.prop('disabled', false);

  productModalFooterInCart.hide();
  productModalInCartDiv.hide();
  productModalFooterGeneral.show();
  productModalAddToCart.prop('disabled', true);

  $('#productModalFieldTotalPrice').empty();
  productModalInputCount.val(1);
  fastShop.lastProductModalInputCountValue = 1;
  productModalInputCount.prop('disabled', true);
  $('#productModalInputCountSpinner').show();
  $('#productModalFieldTotalPriceSpinner').show();
  $('#productModalUpdateCart').prop('disabled', true);

  $('#productModalUpdateCartSpinner').hide();
  $('#productModalUpdateCartLabelInCart').show();
  $('#productModalUpdateCartLabelUpdating').hide();

  $('#productModalInCartDivSpinner').hide();

  cartApi.getCartItemIfExists(data['idUnique'], (cartItem) => {
    console.log(`cart: itemId: ${data['idUnique']}, cartItem: ${JSON.stringify(cartItem)}`);

    let inCart = cartItem && cartItem.count > 0;
    let inCartCount = inCart ? cartItem.count : 1;
    if (inCart) {
      productModalFooterInCart.show();
      productModalInCartDiv.show();
      productModalFooterGeneral.hide();
      productModalInputCount.val(inCartCount);
      fastShop.lastProductModalInputCountValue = inCartCount;
      productModalInCartCount.html(formatInteger(inCartCount));
      let totalPrice = '' + Math.ceil(data['price'] * inCartCount);
      let totalPriceFormatted = formatPrice(totalPrice);
      productModalInCartTotalPrice.html(totalPriceFormatted);
    } else {
      productModalFooterInCart.hide();
      productModalInCartDiv.hide();
      productModalFooterGeneral.show();
      productModalInputCount.val(1);
      fastShop.lastProductModalInputCountValue = 1;
    }

    productModalInputCount.off('input change paste keyup');
    productModalAddToCart.off('click');
    productModalRemoveFromCart.off('click');

    productModalInputCount
      .on('input change paste keyup', function (event) {
        if (!productModalInputCount[0].validity.valid) {
          $('#productModalFieldTotalPrice').html('Количество введено неправильно');
          fastShop.lastProductModalInputCountValue = undefined;
          return;
        }

        let productCount = productModalInputCount.val();
        if (fastShop.lastProductModalInputCountValue === productCount) {
          return;
        }
        fastShop.lastProductModalInputCountValue = productCount;

        let totalPrice = '' + Math.ceil(data['price'] * productCount);
        let totalPriceFormatted = formatPrice(totalPrice);
        $('#productModalFieldTotalPrice').html(totalPriceFormatted);
        if (productCount > 0) {
          productModalAddToCart.prop('disabled', false);
          if (inCart) {
            inCartCount = productCount;

            $('#productModalUpdateCartSpinner').show();
            $('#productModalUpdateCartLabelInCart').hide();
            $('#productModalUpdateCartLabelUpdating').show();
            productModalRemoveFromCart.prop('disabled', true);
            $('#productModalInCartDivSpinner').show();

            addToCart(data, inCartCount, (cart) => {
              fastShop.cart = cart;
              //TODO: обработать ошибку при обновлении. Сделать активной кнопку с текстом "обновить корзину", повесить обработчик на кнопку
              //TODO: для productModalInCartCount брать данные из данных, пришедших с сервера?
              productModalInCartCount.html(formatInteger(inCartCount));
              productModalInCartTotalPrice.html(totalPriceFormatted);
              updateTableRowAppearance(row);
              $('#productModalUpdateCartSpinner').hide();
              $('#productModalUpdateCartLabelInCart').show();
              $('#productModalUpdateCartLabelUpdating').hide();
              $('#productModalInCartDivSpinner').hide();
              productModalRemoveFromCart.prop('disabled', false);
            });
          }
        } else {
          productModalAddToCart.prop('disabled', true);
        }
      })
      .change();

    productModalAddToCart.on('click', () => {
      if (productModalInputCount[0].validity.valid) {
        inCartCount = productModalInputCount.val();

        $('#productModalAddToCartSpinner').show();
        productModalAddToCart.prop('disabled', true);
        $('#wait_lightbox').show(0);

        addToCart(data, inCartCount, (cart) => {
          //TODO: Выдать ошибку, если нужно
          updateTableRowAppearance(row);
          $('#productModalAddToCartSpinner').hide();
          productModalAddToCart.prop('disabled', false);
          $('#wait_lightbox').hide(0);

          productModal.hide();
        });
      }
    });

    productModalRemoveFromCart.on('click', () => {
      $('#productModalRemoveFromCartSpinner').show();
      productModalRemoveFromCart.prop('disabled', true);
      $('#wait_lightbox').show(0);

      cartApi.removeFromCart(data['idUnique'], (cart) => {
        productModalFooterInCart.hide();
        productModalInCartDiv.hide();
        productModalFooterGeneral.show();
        fastShop.cart = cart;
        console.log(`cart: ${JSON.stringify(fastShop.cart)}`);
        updateTableRowAppearance(row);
        //TODO: Выдать ошибку, если нужно
        $('#productModalRemoveFromCartSpinner').hide();
        productModalRemoveFromCart.prop('disabled', false);
        $('#wait_lightbox').hide(0);
      });
    });
    productModalAddToCart.prop('disabled', false);
    $('#productModalInputCountSpinner').hide();
    $('#productModalFieldTotalPriceSpinner').hide();
    productModalInputCount.prop('disabled', false);
  });

  productModal.show();
}

function addToCart(item, count, callback) {
  cartApi.addToCart(item['idUnique'], count, (cart) => {
    fastShop.cart = cart;
    console.log(`cart: ${JSON.stringify(fastShop.cart)}`);
    if (callback) callback(cart);
  });
}

function updateCartModalTotalCartPriceValue(cart, cartItemsData) {
  let totalCartPrice = cart.items
    .map((cartItem) => (cartItemsData.find((i) => i.idUnique === cartItem.id)?.price ?? 0) * cartItem.count)
    .reduce((a, b) => a + b, 0);
  $('#cartModalTotalCartPriceValue').html(formatPrice(totalCartPrice));
}

function onCartModalCartUpdated(cart, cartModal) {
  console.log(`cart: ${JSON.stringify(cart)}`);
  let cartModalMakeOrder = $('#cartModalMakeOrder');
  let cartModalCartItemsTableBody = $('#cartModalCartItemsTableBody');
  let cartModalCartItemDeleteButtonTemplate = $('#cartModalCartItemDeleteButtonTemplate');
  let cartModalTableUpdatingSpinner = $('#cartModalTableUpdatingSpinner');
  let cartModalTotalCartPriceSpinner = $('#cartModalTotalCartPriceSpinner');
  let cartModalTotalCartPriceValue = $('#cartModalTotalCartPriceValue');
  fastShop.cart = cart;

  cartModalCartItemsTableBody.empty();

  if (!cart?.items) {
    console.log('Cart is empty.');
    return;
  }

  let cartItemsIds = cart.items.map((i) => i.id);

  let cartItemsData = fastShop.json.data.filter((p) => cartItemsIds.indexOf(p['idUnique']) !== -1);
  updateCartModalTotalCartPriceValue(cart, cartItemsData);

  cart.items.forEach((cartItem) => {
    let cartItemData = cartItemsData.find((i) => i.idUnique === cartItem.id);
    let inCartCount = cartItem.count;

    fastShop.lastCartModalInputCountValues[cartItem.id] = inCartCount;

    let cartRow = $('<tr></tr>');
    cartRow.append($(`<td>${cartItemData?.nameFull ?? 'Неизвестный товар или товара нет в наличии'}</td>`));
    cartRow.append(
      $(
        `<td class="text-end">${
          cartItemData ? formatPrice(cartItemData.price, cartItemData.priceQuantityUnit) : '-'
        }</td>`
      )
    );

    let cartModalCartItemInputCount = $('<input style="width: 100px;" type="number" step="0.1" min="0.1">');
    if (!cartItemData) cartModalCartItemInputCount.prop('disabled', true);
    cartModalCartItemInputCount.val(inCartCount);

    cartRow.append($('<td></td>').append(cartModalCartItemInputCount));

    let cartModalItemTotalPriceSpinner = $(
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" style="display: none"></span>'
    );
    let cartModalItemTotalPriceSpan = $(
      `<span>${cartItemData ? formatPrice('' + Math.ceil(cartItemData.price * inCartCount)) : '-'}</span>`
    );
    let cartModalItemTotalPriceTd = $('<td class="text-end"></td>')
      .append(cartModalItemTotalPriceSpinner)
      .append(cartModalItemTotalPriceSpan);
    cartRow.append(cartModalItemTotalPriceTd);

    let cartModalCartItemDeleteButton = cartModalCartItemDeleteButtonTemplate.clone();
    cartRow.append($('<td></td>').append(cartModalCartItemDeleteButton));

    cartModalCartItemsTableBody.append(cartRow);

    cartModalCartItemInputCount
      .on('input change paste keyup', function (event) {
        if (!cartModalCartItemInputCount[0].validity.valid) {
          cartModalItemTotalPriceSpan.html('ошибка в кол-ве');
          fastShop.lastCartModalInputCountValues[cartItem.id] = undefined;
          return;
        }

        let productCount = cartModalCartItemInputCount.val();
        if (fastShop.lastCartModalInputCountValues[cartItem.id] === productCount) {
          return;
        }
        fastShop.lastCartModalInputCountValues[cartItem.id] = productCount;

        if (productCount > 0) {
          cartModalMakeOrder.prop('disabled', true);
          inCartCount = productCount;

          cartModalItemTotalPriceSpinner.show();
          cartModalItemTotalPriceSpan.hide();

          cartModalTotalCartPriceSpinner.show();
          cartModalTotalCartPriceValue.hide();

          cartModalCartItemDeleteButton.prop('disabled', true);

          addToCart(cartItemData, inCartCount, (cart) => {
            fastShop.cart = cart;
            //TODO: обработать ошибку при обновлении. Сделать видимой и активной кнопку с текстом "обновить корзину", повесить обработчик на кнопку
            //TODO: для cartModalItemTotalPriceSpan брать данные КОЛИЧЕСТВА из данных, пришедших с сервера?
            if (cartItemData) {
              let totalPrice = '' + Math.ceil(cartItemData.price * productCount);
              let totalPriceFormatted = formatPrice(totalPrice);
              cartModalItemTotalPriceSpan.html(totalPriceFormatted);
            }

            updateCartModalTotalCartPriceValue(cart, cartItemsData);

            //TODO: У НАС ЗДЕСЬ НЕТ ROW!!!!
            //updateTableRowAppearance(row);
            cartModalItemTotalPriceSpinner.hide();
            cartModalItemTotalPriceSpan.show();

            cartModalTotalCartPriceSpinner.hide();
            cartModalTotalCartPriceValue.show();

            cartModalCartItemDeleteButton.prop('disabled', false);
            cartModalMakeOrder.prop('disabled', false);
          });
        } else {
          cartModalMakeOrder.prop('disabled', false);
        }
      })
      .change();

    cartModalCartItemDeleteButton.on('click', () => {
      cartModalMakeOrder.prop('disabled', true);
      cartModalItemTotalPriceSpinner.show();
      cartModalItemTotalPriceSpan.hide();

      cartModalTotalCartPriceSpinner.show();
      cartModalTotalCartPriceValue.hide();

      cartModalCartItemDeleteButton.prop('disabled', true);
      cartModalCartItemInputCount.prop('disabled', true);
      // $('#wait_lightbox').show(0);

      cartApi.removeFromCart(cartItemData.idUnique, (cart) => {
        //TODO: Выдать ошибку, если нужно
        fastShop.cart = cart;

        //TODO: У НАС ЗДЕСЬ НЕТ ROW!!!!
        //updateTableRowAppearance(row);

        onCartModalCartUpdated(cart, cartModal);
        // $('#wait_lightbox').hide(0);
      });
    });
  });

  cartModalMakeOrder.prop('disabled', false);
  cartModalTableUpdatingSpinner.hide();

  cartModalTotalCartPriceSpinner.hide();
  cartModalTotalCartPriceValue.show();
}

function openCart() {
  let cartModal = new bootstrap.Modal($('#cartModal'));
  $('#cartModalSessionCode').text(fastShop.sessionCode);
  $('#cartModalCartItemsTableBody').empty();
  $('#cartModalTableUpdatingSpinner').show();

  $('#cartModalTotalCartPriceSpinner').show();
  $('#cartModalTotalCartPriceValue').hide();

  $('#cartModalMakeOrder').prop('disabled', true);

  cartApi.getCart((cart) => {
    onCartModalCartUpdated(cart, cartModal);
  });

  cartModal.show();
}

$(document).ready(function () {
  fastShop.currentCategory = undefined;
  fastShop.quickSearch = $('#quickSearch');
  fastShop.categories3 = $('#categories3');
  fastShop.categories3.categoryId = null;
  fastShop.quickSearchLastFieldValue = '';
  fastShop.quickSearchLastSearchedValue = '';
  fastShop.titleDefault = 'Металлопрокат оптом и в розницу в Москве';
  fastShop.titleAppendCategory = ' оптом и в розницу в Москве';
  fastShop.titleAppend = ' - Металлопрокат оптом и в розницу в Москве';
  fastShop.tablePageLength = window.mobileCheck() ? 50 : 100;
  fastShop.filterOptionsColumns = window.mobileCheck() ? 2 : 5;
  fastShop.filterOptionsAllUnselectedLastTime = 0;
  fastShop.filterOptions = {};
  fastShop.sessionCode = '12345';

  $('#pageHeaderSessionCode').text(fastShop.sessionCode);

  fastShop.lastProductModalInputCountValue = undefined;
  fastShop.lastCartModalInputCountValues = {};

  $('#catalog').DataTable({
    ajax: {
      url: 'export-collapsed-flat.json',
      cache: true,
    },
    columns: [
      { data: 'cat1', visible: false },
      { data: 'cat2', visible: false },
      { data: 'cat3', visible: false },
      { data: 'name' },
      { data: 'size[; ]', name: 'size', width: '150px' },
      { data: 'mark[; ]', name: 'mark', width: '150px' },
      { data: 'length[; ]', name: 'length', width: '150px' },
      { data: 'price', render: renderPriceCell },
      // {data: "priceQuantityUnit"},
      { data: 'searchTerms', visible: false, name: 'searchTerms' },
      { data: null, render: renderCartCell },

      // {data: null, visible: false},
      // {data: null, visible: false},
      // {data: null, visible: false},
      // {data: null},
      // {data: null},
      // {data: null},
      // {data: null},
      // {data: null},
      // {data: null},
      // {data: null, visible: false, name: 'searchTerms'},
      // {data: null},
    ],
    paging: true,
    //scroller: true,
    //scrollY: 600,
    pageLength: fastShop.tablePageLength,
    ordering: false,
    fixedHeader: true,
    searching: true,
    deferRender: true,
    dom: '<"#toolbar">rtip',
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

          $(`#${selectElementId}`).bsMultiSelect({
            options: fastShop.filterOptions[dataName],
            cssPatch: {
              choices: { columnCount: fastShop.filterOptionsColumns },
              picks_disabled: { backgroundColor: '#e0e5ff' },
              picks_focus: {
                backgroundColor: '#e0e5ff',
                borderColor: '#80bdff',
                boxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)',
              },
              picks_focus_valid: {
                backgroundColor: '#e0e5ff',
                borderColor: '',
                boxShadow: '0 0 0 0.2rem rgba(40, 167, 69, 0.25)',
              },
              picks_focus_invalid: {
                backgroundColor: '#e0e5ff',
                borderColor: '',
                boxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)',
              },

              pick: { paddingLeft: '0', paddingRight: '.5rem', paddingInlineStart: '0', paddingInlineEnd: '0.5rem' },
              pickButton: { fontSize: '0.8em', float: 'none', verticalAlign: 'text-top' },
              pickContent_disabled: { opacity: '.65' },
            },
            isNoResultsWarningEnabled: true,
            noResultsWarning: 'не найдено',
            // useChoicesDynamicStyling: true,
            // placeholder: "Все варианты",
            setSelected: function (o, i) {
              if (o.value === '@all' && i === false) {
                //hack for backspace key pressed
                fastShop.filterOptionsAllUnselectedLastTime = Date.now();
              }
              processFilterOptionSelected(o, i, dataName, selectElementId);
            },
            customChoiceStylings: function (choiceDom, option) {
              if (option.isPopular) {
                choiceDom.choiceElement.style.backgroundColor = '#FFD700';
                return {
                  // updateHoverIn, updateDisabled, updateSelected, updateHighlighted are  possible
                  updateHoverIn(state) {
                    if (state.isHoverIn) {
                      choiceDom.choiceElement.style.setProperty('background-color', '#ffef99', 'important');
                    } else {
                      choiceDom.choiceElement.style.setProperty('background-color', '#FFD700');
                    }
                  },
                };
              }
            },
            customPickStylings: function (pickDom, option) {
              pickDom.pickContentElement.parentElement.classList.add('filterPickedItem');
              if (option.value === '@all') {
                pickDom.pickButtonElement.style.setProperty('display', 'none');
              }
            },
            // getDisabled : () => {},
            // getValidity : () => {},
          });

          /*				column.data().unique().sort().each( function ( d, j ) {
                                    select.append( '<option value="'+d+'">'+d+'</option>' )
                                } );*/

          $(`#${selectElementId} input:only-child`).on('keydown', function (e) {
            //hack for backspace key pressed
            if (e.keyCode === 8) {
              if (Date.now() - fastShop.filterOptionsAllUnselectedLastTime < 100) {
                processFilterOptionSelected(
                  fastShop.filterOptions[dataName].filter((f) => f.value === '@all')[0],
                  true,
                  dataName
                );
              }
            }
          });
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

function formatInteger(price, forHtml) {
  let withSpaceBetweenThousands = price.toString().replaceAll(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return forHtml ? withSpaceBetweenThousands.replaceAll(' ', '&nbsp;') : withSpaceBetweenThousands;
}

function formatPrice(price, priceQuantityUnit) {
  let priceStr = formatInteger(price, true) + '&nbsp₽';
  return priceQuantityUnit ? priceStr + '/' + formatPriceQuantityUnit(priceQuantityUnit) : priceStr;
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

function fetchLastSearchTerms() {
  searchHistory.getLastSearchTerms(15, (lastSearchTerms) => updateLastSearchTerms(lastSearchTerms));
}

function updateLastSearchTerms(lastSearchTerms) {
  console.log(JSON.stringify(lastSearchTerms));
  fastShop.lastSearchTerms = lastSearchTerms;
}

function openAutocomplete() {
  closeAllAutocomplete();
  $('#quickSearchAutocompleteDown').hide();
  $('#quickSearchAutocompleteUp').show();
  let quickSearchAutocompleteList = $(
    '<div id="quickSearchAutocomplete-list" class="quickSearchAutocomplete-items"></div>'
  )
    .append($('<div class="quickSearchAutocomplete-itemsHeader">Вы искали:</div>'))
    .appendTo($('#quickSearchAutocomplete'));
  fastShop.lastSearchTerms?.forEach((searchTerm) => {
    $(`<div class="quickSearchAutocomplete-item">${searchTerm}</div>`)
      .on('click', () => {
        closeAllAutocomplete();
        setQuickSearchFieldValue(searchTerm);
        doQuickSearch(searchTerm);
      })
      .appendTo(quickSearchAutocompleteList);
  });
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

function animateMultiSearchPlaceholder() {
  // let phrases = [
  //     "сталь г/к лист 8\nПрофнастил оцинкованный 0.4 1000\nБалка 18 Б2\nПолоса нерж. никельсодержащая 30х3\nсталь сорт констр Круг горячекатаный 10\nАрматура 8 А3"
  // ];
  //printPhrases(phrases, $('#multilineSearch'));
  let phrases = [
    'лист г/к',
    'лист горячекатаный',
    'Трубы ЭСВ низколегир 89х3',
    'Трубы электросварные низколегир 89х3',
    'Проволока нихромовая 0.2',
    'Проволока нихром 0,2',
  ];
  printPhrases(phrases, fastShop.quickSearch, 'Что ищем?');
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
