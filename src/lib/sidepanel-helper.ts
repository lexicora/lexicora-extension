export function resetSidePanel(tabId?: number) {
  if (import.meta.env.FIREFOX) {
    resetFirefoxSidePanel(tabId);
  } else {
    resetChromeSidePanel(tabId);
  }
}

export async function resetSidePanelAsync(tabId?: number) {
  if (import.meta.env.FIREFOX) {
    await resetFirefoxSidePanelAsync(tabId);
  } else {
    await resetChromeSidePanelAsync(tabId);
  }
}

export function resetFirefoxSidePanel(tabId?: number) {
  const options: any = { panel: browser.runtime.getURL("/sidepanel.html") };
  if (tabId !== undefined) options.tabId = tabId;
  // @ts-ignore: sidebarAction is a Firefox-specific API
  browser.sidebarAction.setPanel(options);
}

export function resetChromeSidePanel(tabId?: number) {
  const options: any = {
    path: "sidepanel.html",
    enabled: true,
  };
  if (tabId !== undefined) options.tabId = tabId;
  browser.sidePanel.setOptions(options);
}

export async function resetFirefoxSidePanelAsync(tabId?: number) {
  const options: any = { panel: browser.runtime.getURL("/sidepanel.html") };
  if (tabId !== undefined) options.tabId = tabId;
  // @ts-ignore: sidebarAction is a Firefox-specific API
  await browser.sidebarAction.setPanel(options);
}

export async function resetChromeSidePanelAsync(tabId?: number) {
  const options: any = {
    path: "sidepanel.html",
    enabled: true,
  };
  if (tabId !== undefined) options.tabId = tabId;
  await browser.sidePanel.setOptions(options);
}
