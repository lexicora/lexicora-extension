import { useState, useEffect, useCallback } from "react";
import {
  SUPPORTED_URL_REGEX,
  UNSUPPORTED_URL_REGEX,
} from "@/constants/support-capture-sites";

export function useTabSupport() {
  const [isSupported, setIsSupported] = useState(true);
  const [activeTab, setActiveTab] = useState<Browser.tabs.Tab | null>(null);

  const checkUrlSupport = useCallback(async () => {
    try {
      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab?.url || tab.id === undefined) {
        setIsSupported(false);
        setActiveTab(null);
        return;
      }

      const isValidProtocol = SUPPORTED_URL_REGEX.test(tab.url);
      const isBlacklisted = UNSUPPORTED_URL_REGEX.test(tab.url);

      setIsSupported(isValidProtocol && !isBlacklisted);
      setActiveTab(tab);
    } catch (error) {
      console.error("Support check failed:", error);
      setIsSupported(false);
    }
  }, []);

  useEffect(() => {
    checkUrlSupport();

    const handleActivated = () => checkUrlSupport();

    // _tabId is unused but required as the first positional argument
    const handleUpdated = (
      _tabId: number,
      changeInfo: Browser.tabs.OnUpdatedInfo,
      _tab: Browser.tabs.Tab,
    ) => {
      if (changeInfo.url || changeInfo.status === "complete") {
        checkUrlSupport();
      }
    };

    browser.tabs.onActivated.addListener(handleActivated);
    browser.tabs.onUpdated.addListener(handleUpdated);

    return () => {
      browser.tabs.onActivated.removeListener(handleActivated);
      browser.tabs.onUpdated.removeListener(handleUpdated);
    };
  }, [checkUrlSupport]);

  return { isSupported, activeTab, refreshSupport: checkUrlSupport };
}
