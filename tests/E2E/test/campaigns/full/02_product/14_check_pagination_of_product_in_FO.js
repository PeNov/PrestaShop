const {AccessPageBO} = require('../../../selectors/BO/access_page');
const {AddProductPage} = require('../../../selectors/BO/add_product_page');
const {ProductSettings} = require('../../../selectors/BO/shopParameters/product_settings');
const {ShopParameters} = require('../../../selectors/BO/shopParameters/shop_parameters');
const {TrafficAndSeo} = require('../../../selectors/BO/shopParameters/shop_parameters');
const {productPage} = require('../../../selectors/FO/product_page');
const {Menu} = require('../../../selectors/BO/menu.js');
const commonProductScenarios = require('../../common_scenarios/product');
let promise = Promise.resolve();

scenario('Check that the pagination works fine on the product page in the Front Office', () => {
  scenario('Open the browser and connect to the Back Office', client => {
    test('should open the browser', () => client.open());
    test('should login successfully in the Back Office', () => client.signInBO(AccessPageBO));
  }, 'common_client');
  scenario('Edit the number of product per page', client => {
    test('should go to "Product settings" page', () => client.goToSubtabMenuPage(Menu.Configure.ShopParameters.shop_parameters_menu, Menu.Configure.ShopParameters.product_settings_submenu));
    test('should set the "Products per page" input', () => client.waitAndSetValue(ProductSettings.Pagination.products_per_page_input, 6));
    test('should click on "Save" button', () => client.waitForExistAndClick(ProductSettings.save_button.replace("%POS", 4)));
    test('should verify the appearance of the green validation', () => client.checkTextValue(ShopParameters.success_box, "Update successful"));
  }, 'common_client');

  /**
   * This scenario is based on the bug described in this ticket
   * http://forge.prestashop.com/browse/BOOM-4847
   **/

  scenario('Disable the Friendly URL', client => {
    test('should close symfony Profiler', () => {
      return promise
        .then(() => client.isVisible(AddProductPage.symfony_toolbar, 3000))
        .then(() => {
          if (global.isVisible) {
            client.waitForExistAndClick(AddProductPage.symfony_toolbar);
          }
        })
    });
    test('should go to "Traffic & SEO" page', () => client.goToSubtabMenuPage(Menu.Configure.ShopParameters.traffic_seo_submenu));
    test('should disable the "Friendly URL"', () => client.waitForExistAndClick(TrafficAndSeo.SeoAndUrls.friendly_url_button.replace('%s', 'off')));
    test('should click on "Save" button', () => client.scrollWaitForExistAndClick(TrafficAndSeo.SeoAndUrls.save_button));
    test('should verify the appearance of the green validation', () => client.checkTextValue(ShopParameters.success_panel, "The settings have been successfully updated."));
  }, 'common_client');

  scenario('Check the pagination in the Front Office', client => {
    test('should go to the Front Office', () => {
      return promise
        .then(() => client.waitForExistAndClick(AccessPageBO.shopname))
        .then(() => client.switchWindow(1));
    });
    test('should set the language of shop to "English"', () => client.changeLanguage());
    test('should click on "All Product" link', () => {
      return promise
        .then(() => client.scrollWaitForExistAndClick(productPage.see_all_products))
        .then(() => client.getTextInVar(productPage.current_page, 'currentPage'));
    });
    test('should check that the current page is equal to "1"', () => client.checkTextValue(productPage.current_page, tab['currentPage'].toString()));
    commonProductScenarios.checkPaginationFO(client, productPage, 'Next', '2');
    commonProductScenarios.checkPaginationFO(client, productPage, 'Next', '3');
    commonProductScenarios.checkPaginationFO(client, productPage, 'Previous', '2');
    test('should go back to the Back Office', () => client.switchWindow(0));
  }, 'product/product');

  scenario('Enable the Friendly URL', client => {
    test('should go to "Traffic & SEO" page', () => client.goToSubtabMenuPage(Menu.Configure.ShopParameters.shop_parameters_menu, Menu.Configure.ShopParameters.traffic_seo_submenu));
    test('should enable the "Friendly URL"', () => client.waitForExistAndClick(TrafficAndSeo.SeoAndUrls.friendly_url_button.replace('%s', 'on')));
    test('should click on "Save" button', () => client.scrollWaitForExistAndClick(TrafficAndSeo.SeoAndUrls.save_button));
    test('should verify the appearance of the green validation', () => client.checkTextValue(ShopParameters.success_panel, "The settings have been successfully updated."));
  }, 'common_client');

  scenario('Logout from the Back Office', client => {
    test('should logout successfully from the Back Office', () => client.signOutBO());
  }, 'common_client');
}, 'common_client', true);

