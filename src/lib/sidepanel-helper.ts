export function resetSidePanel() {
  if (import.meta.env.FIREFOX) {
    resetFirefoxSidePanel();
  } else {
    resetChromeSidePanel();
  }
}

export async function resetSidePanelAsync() {
  if (import.meta.env.FIREFOX) {
    await resetFirefoxSidePanelAsync();
  } else {
    await resetChromeSidePanelAsync();
  }
}

export function resetFirefoxSidePanel() {
  // @ts-ignore: sidebarAction is a Firefox-specific API
  browser.sidebarAction.setPanel({
    //tabId: tab.id, // NOTE: For some reason necessary for Firefox
    panel: browser.runtime.getURL("/sidepanel.html"),
  });
}

export function resetChromeSidePanel() {
  browser.sidePanel.setOptions({
    // NOTE: {tabId: tab.id} For some reason unnecessary for Chrome
    path: "sidepanel.html",
    enabled: true,
  });
}

export async function resetFirefoxSidePanelAsync() {
  // @ts-ignore: sidebarAction is a Firefox-specific API
  await browser.sidebarAction.setPanel({
    //tabId: tab.id, // NOTE: For some reason necessary for Firefox
    panel: browser.runtime.getURL("/sidepanel.html"),
  });
}

export async function resetChromeSidePanelAsync() {
  await browser.sidePanel.setOptions({
    path: "sidepanel.html",
    enabled: true,
  });
}
