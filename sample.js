document.addEventListener("DOMContentLoaded", function () {

    "use strict";
  
  
    /* =====================================================
       CONFIGURATION
    ===================================================== */
  
    var DISCOUNT_PERCENT = 50;
  
    var DISCOUNT_MULTIPLIER =
      (100 - DISCOUNT_PERCENT) / 100;
  
    /*
     * IMPORTANT:
     *
     * This must match the ACTIVE discount code
     * created inside Shopify Admin.
     *
     * Example:
     * SPA50
     *
     * Shopify is responsible for applying the
     * REAL discount at checkout.
     *
     * JavaScript only calculates/displays the
     * expected 50% discounted amount.
     */
  
   var SHOPIFY_DISCOUNT_CODE = "SPA-EVOUCHER-50";
  
  
    var MINIMUM_SERVICES = 3;
  
    var SLIDER_INTERVAL = 5000;
  
  
    /* =====================================================
       SERVICE DATA
    ===================================================== */
  
    var serviceVariants = {
  
      Body: 49398249586926,
  
      Scrub: 49398242541806,
  
      Facial: 49398252339438,
  
      Hair: 49398129950958
  
    };
  
  
    var servicePrices = {
  
      Body: null,
  
      Scrub: null,
  
      Facial: null,
  
      Hair: null
  
    };
  
  
    var quantities = {
  
      Body: 0,
  
      Scrub: 0,
  
      Facial: 0,
  
      Hair: 0
  
    };
  
  
    var SERVICE_CODES = {
  
      Body: "BODY",
  
      Scrub: "SCRUB",
  
      Facial: "FACIAL",
  
      Hair: "HAIR"
  
    };
  
  
    /* =====================================================
       ELEMENTS
    ===================================================== */
  
    var cards =
      document.querySelectorAll(".spa-card");
  
    var counter =
      document.getElementById("spaCount");
  
    var originalTotalDisplay =
      document.getElementById("spaOriginalTotal");
  
    var totalDisplay =
      document.getElementById("spaTotal");
  
    var savingsDisplay =
      document.getElementById("spaSavings");
  
    var submitBtn =
      document.getElementById("spaSubmit");
  
    var error =
      document.getElementById("spaError");
  
  
    /* =====================================================
       BASIC VALIDATION
    ===================================================== */
  
    if (
      !cards.length ||
      !counter ||
      !originalTotalDisplay ||
      !totalDisplay ||
      !savingsDisplay ||
      !submitBtn ||
      !error
    ) {
  
      console.error(
        "SPA E-Voucher: Required elements are missing."
      );
  
      return;
  
    }
  
  
    /* =====================================================
       FORMAT PRICE
    ===================================================== */
  
    function formatPrice(price) {
  
      var numericPrice =
        Number(price);
  
      if (!isFinite(numericPrice)) {
  
        numericPrice = 0;
  
      }
  
      return "₱" +
        numericPrice.toLocaleString(
          "en-PH",
          {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
          }
        );
  
    }
  
  
    /* =====================================================
       DISCOUNT CALCULATIONS
    ===================================================== */
  
    function getDiscountedPrice(originalPrice) {
  
      return Number(originalPrice) *
        DISCOUNT_MULTIPLIER;
  
    }
  
  
    function getSavings(originalPrice) {
  
      return Number(originalPrice) -
        getDiscountedPrice(originalPrice);
  
    }
  
  
    /* =====================================================
       PRICE AVAILABILITY
    ===================================================== */
  
    function allPricesLoaded() {
  
      return Object.keys(
        serviceVariants
      ).every(
        function (service) {
  
          return (
            servicePrices[service] !== null &&
            isFinite(
              Number(
                servicePrices[service]
              )
            )
          );
  
        }
      );
  
    }
  
  
    function hasSelectedPriceError() {
  
      return Object.keys(
        quantities
      ).some(
        function (service) {
  
          if (
            quantities[service] <= 0
          ) {
  
            return false;
  
          }
  
          return (
            servicePrices[service] === null ||
            !isFinite(
              Number(
                servicePrices[service]
              )
            )
          );
  
        }
      );
  
    }
  
  
    /* =====================================================
       UPDATE CARD PRICE
    ===================================================== */
  
    function updateCardPrice(service) {
  
      var card =
        document.querySelector(
          '.spa-card[data-service="' +
          service +
          '"]'
        );
  
      if (!card) {
  
        return;
  
      }
  
  
      var priceElement =
        card.querySelector(
          ".spa-price"
        );
  
      if (!priceElement) {
  
        return;
  
      }
  
  
      var originalPrice =
        servicePrices[service];
  
  
      if (
        originalPrice === null ||
        !isFinite(
          Number(originalPrice)
        )
      ) {
  
        priceElement.textContent =
          "Price unavailable";
  
        priceElement.classList.add(
          "spa-price-error"
        );
  
        return;
  
      }
  
  
      var discountedPrice =
        getDiscountedPrice(
          originalPrice
        );
  
  
      var savings =
        getSavings(
          originalPrice
        );
  
  
      priceElement.innerHTML =
  
        '<div class="spa-original-price">' +
          formatPrice(originalPrice) +
        '</div>' +
  
        '<div class="spa-discounted-price">' +
          formatPrice(discountedPrice) +
          '<span class="spa-discount-label">' +
            DISCOUNT_PERCENT +
            '% OFF' +
          '</span>' +
        '</div>' +
  
        '<div class="spa-savings">' +
          "You save " +
          formatPrice(savings) +
        "</div>";
  
  
      priceElement.classList.remove(
        "spa-price-error"
      );
  
    }
  
  
    /* =====================================================
       LOAD SHOPIFY VARIANT PRICE
    ===================================================== */
  
    function loadVariantPrice(service) {
  
      var variantId =
        serviceVariants[service];
  
  
      if (!variantId) {
  
        return Promise.reject(
          new Error(
            "Missing Shopify variant ID for " +
            service +
            "."
          )
        );
  
      }
  
  
      return fetch(
        "/variants/" +
        variantId +
        ".js",
        {
          method: "GET",
          headers: {
            "Accept": "application/json"
          }
        }
      )
  
      .then(
        function (response) {
  
          if (!response.ok) {
  
            throw new Error(
              "Unable to retrieve Shopify price for " +
              service +
              "."
            );
  
          }
  
          return response.json();
  
        }
      )
  
      .then(
        function (variant) {
  
          if (
            !variant ||
            typeof variant.price ===
            "undefined"
          ) {
  
            throw new Error(
              "Shopify variant price is unavailable for " +
              service +
              "."
            );
  
          }
  
  
          var price =
            Number(variant.price) / 100;
  
  
          if (!isFinite(price)) {
  
            throw new Error(
              "Invalid Shopify price for " +
              service +
              "."
            );
  
          }
  
  
          servicePrices[service] =
            price;
  
  
          updateCardPrice(
            service
          );
  
  
          return variant;
  
        }
      );
  
    }
  
  
    /* =====================================================
       LOAD ALL PRICES
    ===================================================== */
  
    function loadAllPrices() {
  
      var requests =
        Object.keys(
          serviceVariants
        ).map(
          function (service) {
  
            return loadVariantPrice(
              service
            )
  
            .catch(
              function (priceError) {
  
                console.error(
                  "SPA price loading error:",
                  service,
                  priceError
                );
  
  
                servicePrices[service] =
                  null;
  
  
                updateCardPrice(
                  service
                );
  
  
                return null;
  
              }
            );
  
          }
        );
  
  
      return Promise.all(
        requests
      );
  
    }
  
  
    /* =====================================================
       ERROR MESSAGE
    ===================================================== */
  
    function showError(message) {
  
      error.textContent =
        message;
  
      error.style.display =
        "block";
  
    }
  
  
    function hideError() {
  
      error.textContent =
        "";
  
      error.style.display =
        "none";
  
    }
  
  
    /* =====================================================
       UPDATE QUANTITY BUTTON STATES
    ===================================================== */
  
    function updateQuantityButtons() {
  
      cards.forEach(
        function (card) {
  
          var service =
            card.getAttribute(
              "data-service"
            );
  
  
          var minusButton =
            card.querySelector(
              ".qty-minus"
            );
  
  
          if (minusButton) {
  
            minusButton.disabled =
              quantities[service] <= 0;
  
          }
  
        }
      );
  
    }
  
  
    /* =====================================================
       UPDATE SELECTION
    ===================================================== */
  
    function updateSelection() {
  
      var totalQuantity = 0;
  
      var originalTotal = 0;
  
  
      Object.keys(
        quantities
      ).forEach(
        function (service) {
  
          var qty =
            quantities[service];
  
  
          totalQuantity +=
            qty;
  
  
          var originalPrice =
            servicePrices[service];
  
  
          if (
            originalPrice !== null &&
            isFinite(
              Number(originalPrice)
            )
          ) {
  
            originalTotal +=
              qty *
              Number(originalPrice);
  
          }
  
        }
      );
  
  
      var discountedTotal =
        originalTotal *
        DISCOUNT_MULTIPLIER;
  
  
      var totalSavings =
        originalTotal -
        discountedTotal;
  
  
      counter.textContent =
        totalQuantity;
  
  
      originalTotalDisplay.textContent =
        "Original Total: " +
        formatPrice(
          originalTotal
        );
  
  
      totalDisplay.textContent =
        DISCOUNT_PERCENT +
        "% OFF Total: " +
        formatPrice(
          discountedTotal
        );
  
  
      savingsDisplay.textContent =
        "You Save: " +
        formatPrice(
          totalSavings
        );
  
  
      cards.forEach(
        function (card) {
  
          var service =
            card.getAttribute(
              "data-service"
            );
  
  
          if (
            quantities[service] > 0
          ) {
  
            card.classList.add(
              "selected"
            );
  
          } else {
  
            card.classList.remove(
              "selected"
            );
  
          }
  
        }
      );
  
  
      updateQuantityButtons();
  
  
      var minimumReached =
        totalQuantity >=
        MINIMUM_SERVICES;
  
  
      var priceProblem =
        hasSelectedPriceError();
  
  
      submitBtn.disabled =
        !minimumReached ||
        priceProblem;
  
  
      if (
        minimumReached &&
        !priceProblem
      ) {
  
        hideError();
  
      }
  
  
      if (
        totalQuantity === 0
      ) {
  
        submitBtn.disabled =
          true;
  
      }
  
    }
  
  
    /* =====================================================
       QUANTITY BUTTONS
    ===================================================== */
  
    cards.forEach(
      function (card) {
  
        var service =
          card.getAttribute(
            "data-service"
          );
  
  
        var value =
          card.querySelector(
            ".qty-value"
          );
  
  
        var plusButton =
          card.querySelector(
            ".qty-plus"
          );
  
  
        var minusButton =
          card.querySelector(
            ".qty-minus"
          );
  
  
        if (
          !value ||
          !plusButton ||
          !minusButton
        ) {
  
          return;
  
        }
  
  
        plusButton.addEventListener(
          "click",
          function (event) {
  
            event.preventDefault();
  
            event.stopPropagation();
  
  
            quantities[service] =
              quantities[service] + 1;
  
  
            value.textContent =
              quantities[service];
  
  
            updateSelection();
  
          }
        );
  
  
        minusButton.addEventListener(
          "click",
          function (event) {
  
            event.preventDefault();
  
            event.stopPropagation();
  
  
            if (
              quantities[service] > 0
            ) {
  
              quantities[service] =
                quantities[service] - 1;
  
  
              value.textContent =
                quantities[service];
  
  
              updateSelection();
  
            }
  
          }
        );
  
      }
    );
  
  
    /* =====================================================
       VOUCHER ID
    ===================================================== */
  
    function getNextServiceSerial(service) {
  
      var storageKey =
        "spa_voucher_serial_" +
        (
          SERVICE_CODES[service] ||
          "SPA"
        );
  
  
      var currentNumber =
        parseInt(
          localStorage.getItem(
            storageKey
          ) || "0",
          10
        );
  
  
      if (
        isNaN(currentNumber)
      ) {
  
        currentNumber = 0;
  
      }
  
  
      var nextNumber =
        currentNumber + 1;
  
  
      localStorage.setItem(
        storageKey,
        String(nextNumber)
      );
  
  
      return String(
        nextNumber
      ).padStart(
        3,
        "0"
      );
  
    }
  
  
    function createVoucherId(service) {
  
      var date =
        new Date();
  
  
      var year =
        date.getFullYear();
  
  
      var month =
        String(
          date.getMonth() + 1
        ).padStart(
          2,
          "0"
        );
  
  
      var day =
        String(
          date.getDate()
        ).padStart(
          2,
          "0"
        );
  
  
      var serviceCode =
        SERVICE_CODES[service] ||
        "SPA";
  
  
      var serial =
        getNextServiceSerial(
          service
        );
  
  
      return (
        "SPA-" +
        year +
        month +
        day +
        "-" +
        serviceCode +
        "-" +
        serial
      );
  
    }
  
  
    /* =====================================================
       QR CODE
    ===================================================== */
  
    function createQrCodeUrl(voucherId) {
  
      return (
        "https://api.qrserver.com/v1/create-qr-code/" +
        "?size=300x300&data=" +
        encodeURIComponent(
          voucherId
        )
      );
  
    }
  
  
    /* =====================================================
       BUILD SELECTED SERVICES
    ===================================================== */
  
    function buildSelectedServices() {
  
      var selectedServices = [];
  
  
      Object.keys(
        quantities
      ).forEach(
        function (service) {
  
          var qty =
            quantities[service];
  
  
          if (
            qty > 0
          ) {
  
            selectedServices.push(
              service +
              " x" +
              qty
            );
  
          }
  
        }
      );
  
  
      return selectedServices;
  
    }
  
  
    /* =====================================================
       BUILD CART ITEMS
    ===================================================== */
  
    function buildCartData() {
  
      var cartItems = [];
  
      var voucherRecords = [];
  
      var totalQuantity = 0;
  
      var originalTotal = 0;
  
  
      Object.keys(
        quantities
      ).forEach(
        function (service) {
  
          var qty =
            quantities[service];
  
  
          if (
            qty <= 0
          ) {
  
            return;
  
          }
  
  
          var originalPrice =
            servicePrices[service];
  
  
          if (
            originalPrice === null ||
            !isFinite(
              Number(originalPrice)
            )
          ) {
  
            throw new Error(
              "Unable to retrieve the price for " +
              service +
              " from Shopify."
            );
  
          }
  
  
          var numericPrice =
            Number(
              originalPrice
            );
  
  
          var discountedPrice =
            getDiscountedPrice(
              numericPrice
            );
  
  
          var savings =
            getSavings(
              numericPrice
            );
  
  
          totalQuantity +=
            qty;
  
  
          originalTotal +=
            qty *
            numericPrice;
  
  
          /* ---------------------------------------------
             VOUCHER ID
          --------------------------------------------- */
  
          var voucherId =
            createVoucherId(
              service
            );
  
  
          var qrCodeUrl =
            createQrCodeUrl(
              voucherId
            );
  
  
          voucherRecords.push({
  
            service:
              service,
  
            voucher_id:
              voucherId,
  
            qr_code:
              qrCodeUrl,
  
            quantity:
              qty
  
          });
  
  
          /*
           * IMPORTANT:
           *
           * We ADD THE NORMAL SHOPIFY VARIANT PRICE.
           *
           * We do NOT try to manually set the line price.
           *
           * Shopify's actual discount code will apply
           * the 50% discount at checkout.
           */
  
          cartItems.push({
  
            id:
              serviceVariants[
                service
              ],
  
            quantity:
              qty,
  
            properties: {
  
              "Voucher Type":
                "Spa E-Voucher 50% OFF",
  
              "Voucher ID":
                voucherId,
  
              "QR Code":
                qrCodeUrl,
  
              "Selected Service":
                service,
  
              "Voucher Quantity":
                String(qty),
  
              "Original Price":
                formatPrice(
                  numericPrice
                ),
  
              "Expected 50% OFF Price":
                formatPrice(
                  discountedPrice
                ),
  
              "Expected Savings":
                formatPrice(
                  savings
                )
  
            }
  
          });
  
        }
      );
  
  
      return {
  
        cartItems:
          cartItems,
  
        voucherRecords:
          voucherRecords,
  
        totalQuantity:
          totalQuantity,
  
        originalTotal:
          originalTotal
  
      };
  
    }
  
  
    /* =====================================================
       CLEAR CART
    ===================================================== */
  
    function clearCart() {
  
      return fetch(
        "/cart/clear.js",
        {
  
          method:
            "POST",
  
          headers: {
  
            "Accept":
              "application/json"
  
          }
  
        }
      )
  
      .then(
        function (response) {
  
          if (!response.ok) {
  
            throw new Error(
              "Unable to clear the cart."
            );
  
          }
  
          return response.json();
  
        }
      );
  
    }
  
  
    /* =====================================================
       ADD ITEMS TO CART
    ===================================================== */
  
    function addToCart(cartItems) {
  
      return fetch(
        "/cart/add.js",
        {
  
          method:
            "POST",
  
          headers: {
  
            "Content-Type":
              "application/json",
  
            "Accept":
              "application/json"
  
          },
  
          body:
            JSON.stringify({
  
              items:
                cartItems
  
            })
  
        }
      )
  
      .then(
        function (response) {
  
          return response
            .json()
            .catch(
              function () {
  
                return {};
  
              }
            )
            .then(
              function (data) {
  
                if (
                  !response.ok
                ) {
  
                  throw new Error(
                    data.description ||
                    data.message ||
                    "Unable to add services to cart."
                  );
  
                }
  
  
                return data;
  
              }
            );
  
        }
      );
  
    }
  
  
    /* =====================================================
       UPDATE CART ATTRIBUTES
    ===================================================== */
  
    function updateCartAttributes(data) {
  
      var discountedTotal =
        data.originalTotal *
        DISCOUNT_MULTIPLIER;
  
  
      var totalSavings =
        data.originalTotal -
        discountedTotal;
  
  
      var selectedServices =
        buildSelectedServices();
  
  
      var voucherIds =
        data.voucherRecords
          .map(
            function (record) {
  
              return record.voucher_id;
  
            }
          )
          .join(", ");
  
  
      var voucherQrCodes =
        data.voucherRecords
          .map(
            function (record) {
  
              return record.qr_code;
  
            }
          )
          .join(", ");
  
  
      return fetch(
        "/cart/update.js",
        {
  
          method:
            "POST",
  
          headers: {
  
            "Content-Type":
              "application/json",
  
            "Accept":
              "application/json"
  
          },
  
          body:
            JSON.stringify({
  
              attributes: {
  
                "Voucher Type":
                  "Spa E-Voucher 50% OFF",
  
                "Selected Services":
                  selectedServices.join(
                    ", "
                  ),
  
                "Total Services":
                  String(
                    data.totalQuantity
                  ),
  
                "Voucher IDs":
                  voucherIds,
  
                "Voucher QR Codes":
                  voucherQrCodes,
  
                "Voucher Records":
                  JSON.stringify(
                    data.voucherRecords
                  ),
  
                "Original Total":
                  formatPrice(
                    data.originalTotal
                  ),
  
                "Expected 50% OFF Total":
                  formatPrice(
                    discountedTotal
                  ),
  
                "Expected Total Savings":
                  formatPrice(
                    totalSavings
                  ),
  
                "Payment Method":
                  "Online Payment Only",
  
                "Delivery Type":
                  "Digital E-Voucher - Email Delivery"
  
              }
  
            })
  
        }
      )
  
      .then(
        function (response) {
  
          return response
            .json()
            .catch(
              function () {
  
                return {};
  
              }
            )
            .then(
              function (data) {
  
                if (
                  !response.ok
                ) {
  
                  throw new Error(
                    data.description ||
                    data.message ||
                    "Unable to update cart information."
                  );
  
                }
  
  
                return data;
  
              }
            );
  
        }
      );
  
    }
  
  
    /* =====================================================
       APPLY SHOPIFY DISCOUNT
    ===================================================== */
  
    function applyDiscountCode() {
  
      if (
        !SHOPIFY_DISCOUNT_CODE
      ) {
  
        return Promise.resolve();
  
      }
  
  
      /*
       * Shopify discount endpoint.
       *
       * The discount code MUST already exist
       * and be active in Shopify Admin.
       */
  
      var discountUrl =
        "/discount/" +
        encodeURIComponent(
          SHOPIFY_DISCOUNT_CODE
        ) +
        "?redirect=/checkout";
  
  
      /*
       * Navigate to Shopify's discount endpoint.
       *
       * Shopify will attach the discount to the
       * current cart/session and redirect to checkout.
       */
  
      window.location.href =
        discountUrl;
  
      return Promise.resolve();
  
    }
  
  
    /* =====================================================
       PROCEED TO CHECKOUT
    ===================================================== */
  
    submitBtn.addEventListener(
      "click",
      function (event) {
  
        event.preventDefault();
  
  
        if (
          submitBtn.dataset.processing ===
          "true"
        ) {
  
          return;
  
        }
  
  
        hideError();
  
  
        /* ---------------------------------------------
           VALIDATE MINIMUM
        --------------------------------------------- */
  
        var totalQuantity = 0;
  
  
        Object.keys(
          quantities
        ).forEach(
          function (service) {
  
            totalQuantity +=
              quantities[service];
  
          }
        );
  
  
        if (
          totalQuantity <
          MINIMUM_SERVICES
        ) {
  
          showError(
            "Please select at least " +
            MINIMUM_SERVICES +
            " services."
          );
  
          return;
  
        }
  
  
        /* ---------------------------------------------
           VALIDATE PRICES
        --------------------------------------------- */
  
        if (
          hasSelectedPriceError()
        ) {
  
          showError(
            "One or more selected services have an unavailable price. Please refresh the page and try again."
          );
  
          return;
  
        }
  
  
        /* ---------------------------------------------
           BUILD CART DATA
        --------------------------------------------- */
  
        var cartData;
  
  
        try {
  
          cartData =
            buildCartData();
  
        } catch (
          buildError
        ) {
  
          console.error(
            "SPA Cart Build Error:",
            buildError
          );
  
  
          showError(
            buildError.message ||
            "Unable to prepare your order."
          );
  
  
          return;
  
        }
  
  
        /* ---------------------------------------------
           FINAL VALIDATION
        --------------------------------------------- */
  
        if (
          !cartData.cartItems.length
        ) {
  
          showError(
            "Please select at least one service."
          );
  
          return;
  
        }
  
  
        if (
          cartData.totalQuantity <
          MINIMUM_SERVICES
        ) {
  
          showError(
            "Please select at least " +
            MINIMUM_SERVICES +
            " services."
          );
  
          return;
  
        }
  
  
        /* ---------------------------------------------
           PROCESSING STATE
        --------------------------------------------- */
  
        submitBtn.dataset.processing =
          "true";
  
        submitBtn.disabled =
          true;
  
        submitBtn.textContent =
          "Proceeding to Checkout...";
  
  
        /* ---------------------------------------------
           CLEAR OLD CART
        --------------------------------------------- */
  
        clearCart()
  
        /* ---------------------------------------------
           ADD NEW SPA ITEMS
        --------------------------------------------- */
  
        .then(
          function () {
  
            return addToCart(
              cartData.cartItems
            );
  
          }
        )
  
  
        /* ---------------------------------------------
           SAVE CART ATTRIBUTES
        --------------------------------------------- */
  
        .then(
          function () {
  
            return updateCartAttributes(
              cartData
            );
  
          }
        )
  
  
        /* ---------------------------------------------
           APPLY DISCOUNT + CHECKOUT
        --------------------------------------------- */
  
        .then(
          function () {
  
            if (
              SHOPIFY_DISCOUNT_CODE
            ) {
  
              /*
               * This redirects to:
               *
               * /discount/SPA50?redirect=/checkout
               *
               * Shopify then applies the discount
               * and opens checkout.
               */
  
              applyDiscountCode();
  
              return;
  
            }
  
  
            /*
             * FALLBACK:
             *
             * If no discount code is configured,
             * go directly to checkout.
             */
  
            window.location.href =
              "/checkout";
  
          }
        )
  
  
        /* ---------------------------------------------
           ERROR HANDLING
        --------------------------------------------- */
  
        .catch(
          function (checkoutError) {
  
            console.error(
              "SPA Checkout Error:",
              checkoutError
            );
  
  
            showError(
              checkoutError.message ||
              "Something went wrong. Please try again."
            );
  
  
            submitBtn.disabled =
              false;
  
            submitBtn.dataset.processing =
              "false";
  
            submitBtn.textContent =
              "Proceed to Checkout";
  
          }
        );
  
      }
    );
  
  
    /* =====================================================
       SLIDER
    ===================================================== */
  
    var slider =
      document.getElementById(
        "spaVoucherSlider"
      );
  
    var sliderTrack =
      document.getElementById(
        "spaSliderTrack"
      );
  
    var prevButton =
      document.getElementById(
        "spaSliderPrev"
      );
  
    var nextButton =
      document.getElementById(
        "spaSliderNext"
      );
  
    var dots =
      document.querySelectorAll(
        ".spa-slider-dot"
      );
  
    var slides =
      document.querySelectorAll(
        ".spa-slide"
      );
  
  
    if (
      slider &&
      sliderTrack &&
      slides.length
    ) {
  
      var currentSlide = 0;
  
      var sliderInterval = null;
  
      var totalSlides =
        slides.length;
  
  
      /* ---------------------------------------------
         SHOW SLIDE
      --------------------------------------------- */
  
      function showSlide(index) {
  
        if (
          index < 0
        ) {
  
          index =
            totalSlides - 1;
  
        }
  
  
        if (
          index >= totalSlides
        ) {
  
          index = 0;
  
        }
  
  
        currentSlide =
          index;
  
  
        sliderTrack.style.transform =
          "translateX(-" +
          (
            currentSlide * 100
          ) +
          "%)";
  
  
        dots.forEach(
          function (
            dot,
            dotIndex
          ) {
  
            dot.classList.toggle(
              "active",
              dotIndex ===
              currentSlide
            );
  
  
            dot.setAttribute(
              "aria-current",
              dotIndex ===
              currentSlide
                ? "true"
                : "false"
            );
  
          }
        );
  
      }
  
  
      /* ---------------------------------------------
         NEXT
      --------------------------------------------- */
  
      function nextSlide() {
  
        showSlide(
          currentSlide + 1
        );
  
      }
  
  
      /* ---------------------------------------------
         PREVIOUS
      --------------------------------------------- */
  
      function previousSlide() {
  
        showSlide(
          currentSlide - 1
        );
  
      }
  
  
      /* ---------------------------------------------
         START
      --------------------------------------------- */
  
      function startSlider() {
  
        clearInterval(
          sliderInterval
        );
  
  
        if (
          totalSlides <= 1
        ) {
  
          return;
  
        }
  
  
        sliderInterval =
          setInterval(
            function () {
  
              nextSlide();
  
            },
            SLIDER_INTERVAL
          );
  
      }
  
  
      /* ---------------------------------------------
         RESET
      --------------------------------------------- */
  
      function resetSlider() {
  
        clearInterval(
          sliderInterval
        );
  
        startSlider();
  
      }
  
  
      /* ---------------------------------------------
         NEXT BUTTON
      --------------------------------------------- */
  
      if (
        nextButton
      ) {
  
        nextButton.addEventListener(
          "click",
          function () {
  
            nextSlide();
  
            resetSlider();
  
          }
        );
  
      }
  
  
      /* ---------------------------------------------
         PREVIOUS BUTTON
      --------------------------------------------- */
  
      if (
        prevButton
      ) {
  
        prevButton.addEventListener(
          "click",
          function () {
  
            previousSlide();
  
            resetSlider();
  
          }
        );
  
      }
  
  
      /* ---------------------------------------------
         DOTS
      --------------------------------------------- */
  
      dots.forEach(
        function (dot) {
  
          dot.addEventListener(
            "click",
            function () {
  
              var slide =
                parseInt(
                  dot.getAttribute(
                    "data-slide"
                  ),
                  10
                );
  
  
              if (
                isNaN(slide)
              ) {
  
                return;
  
              }
  
  
              showSlide(
                slide
              );
  
  
              resetSlider();
  
            }
          );
  
        }
      );
  
  
      /* ---------------------------------------------
         PAUSE ON HOVER
      --------------------------------------------- */
  
      slider.addEventListener(
        "mouseenter",
        function () {
  
          clearInterval(
            sliderInterval
          );
  
        }
      );
  
  
      slider.addEventListener(
        "mouseleave",
        function () {
  
          startSlider();
  
        }
      );
  
  
      /* ---------------------------------------------
         MOBILE SWIPE
      --------------------------------------------- */
  
      var touchStartX = 0;
  
      var touchEndX = 0;
  
  
      slider.addEventListener(
        "touchstart",
        function (event) {
  
          if (
            !event.changedTouches.length
          ) {
  
            return;
  
          }
  
  
          touchStartX =
            event.changedTouches[0]
              .screenX;
  
        },
        {
          passive: true
        }
      );
  
  
      slider.addEventListener(
        "touchend",
        function (event) {
  
          if (
            !event.changedTouches.length
          ) {
  
            return;
  
          }
  
  
          touchEndX =
            event.changedTouches[0]
              .screenX;
  
  
          var swipeDistance =
            touchStartX -
            touchEndX;
  
  
          if (
            Math.abs(
              swipeDistance
            ) > 50
          ) {
  
            if (
              swipeDistance > 0
            ) {
  
              nextSlide();
  
            } else {
  
              previousSlide();
  
            }
  
  
            resetSlider();
  
          }
  
        },
        {
          passive: true
        }
      );
  
  
      /* ---------------------------------------------
         INITIALIZE
      --------------------------------------------- */
  
      showSlide(0);
  
      startSlider();
  
    }
  
  
    /* =====================================================
       INITIAL PRICE LOAD
    ===================================================== */
  
    updateSelection();
  
  
    loadAllPrices()
      .then(
        function () {
  
          updateSelection();
  
        }
      );
  
  });