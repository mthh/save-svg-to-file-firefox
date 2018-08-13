let current_source = null;

function removeButton() {
  browser.contextMenus.onHidden.removeListener(removeButton);
  return browser.contextMenus.remove('save-svg-as')
    .then((a) => {
      // console.log('removed entry in context menu');
      return Promise.resolve(true);
    },
    (b) => {
      // console.log('error removing entry in context menu')
      return Promise.resolve(false);
    });
}

function notify(message) {
  if (message.removeButton) {
    removeButton();
  }
  if (message.src) {
    current_source = message.src;
  }
  if (message.addButton) {
    // removeButton().then(() => {
      browser.contextMenus.create({
          id: "save-svg-as",
          title: "Save svg as ...",
          contexts: ["all"],
      });
      browser.contextMenus.onHidden.addListener(removeButton);
    // });
  }
  return Promise.resolve(true);
}

function clickLinkFromDataUrl(url) {
  return fetch(url)
    .then(res => res.blob())
    .then((blob) => {
      const blobUrl = URL.createObjectURL(blob);
      const downloading = browser.downloads.download({
        url : blobUrl,
        filename: 'export_element.svg',
        saveAs: true,
      });

			browser.downloads.onChanged.addListener(function (download) {
				console.log(download);
			});
  });
}

browser.runtime.onMessage.addListener(notify);
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "save-svg-as" && current_source !== null) {
      clickLinkFromDataUrl(current_source);
      removeButton();
  }
});
browser.contextMenus.onShown.addListener(function() {
  browser.contextMenus.onHidden.addListener(removeButton);
});
