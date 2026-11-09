import { useEffect, useState } from "react";

export function useIsLinux() {
  const [isLinux, setIsLinux] = useState(false);
  useEffect(() => {
    const browser = navigator as Navigator & { userAgentData?: { platform: string } };
    const platform = browser.userAgentData?.platform ?? browser.platform;
    setIsLinux(/linux/i.test(platform || browser.userAgent) && !/android/i.test(browser.userAgent));
  }, []);
  return isLinux;
}
