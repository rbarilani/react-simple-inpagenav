const CONSTANTS = {
    SECTION_ID_SUFFIX: '__simple-inpagenav',
    DEBOUNCED_SCROLL_EVENT: 'simple-inpagenav.scroll',
    SCROLL_EVENT: 'scroll.simpleinapgenav',
    LOAD_EVENT: 'load.simpleinpagenav',
    RESIZE_EVENT: 'resize.simpleinpagenav',
    DEBOUNCED_SCROLL_EVENT_DELAY: 300,
    DEFAULT_OPTIONS: {
        scrollThreshold: 0.4,
        scrollOffset: 50,
        scrollTo: {
            duration: 300,
            offset: -40
        }
    }
};

module.exports = CONSTANTS;
