import type Site from "lume/core/site.ts";

type OptionalExceptFor<T, K extends keyof T> =
  & {
    [P in keyof T]: P extends K ? T[P] : T[P] | undefined;
  }
  & Pick<T, K>;

interface UmamiOptions {
  /**
   * Umami tracks all events and pageviews for you automatically. Override this behavior if you plan on using [tracker functions](https://umami.is/docs/tracker-functions).
   * @default true
   */
  autotrack?: boolean;
  /**
   * If you want the tracker to only run on specific domains, add them to this list.
   *
   * @example ["mywebsite.com", "mywebsite2.com"]
   */
  domains?: string[];
  /**
   * The endpoint where your Umami instance is located.
   * @default https://cloud.umami.is
   * @example https://umami-on.fly.dev
   */
  endpointUrl?: string;
  /**
   * Override the location where your analytics data is sent.
   */
  hostUrl?: string;
  /**
   * The unique ID of your [website](https://umami.is/docs/add-a-website).
   */
  id: string;
  /**
   * Assign a custom name to the tracker script.
   *
   * @default script.js
   * @see [https://umami.is/docs/environment-variables](https://umami.is/docs/environment-variables)
   */
  trackerScriptName?: string;
}

export default function (options: OptionalExceptFor<UmamiOptions, "id">) {
  const {
    autotrack = true,
    domains = [],
    endpointUrl = "https://cloud.umami.is",
    hostUrl = "https://cloud.umami.is",
    id,
    trackerScriptName = "script.js",
  } = options;

  const hostname = new URL(endpointUrl).hostname;

  return (site: Site) => {
    site.process([".html"], (pages) => {
      for (const page of pages) {
        const script = page.document!.createElement("script");

        script.setAttribute("src", `https://${hostname}/${trackerScriptName}`);
        script.setAttribute("defer", "true");
        script.setAttribute("data-website-id", `${id}`);

        // Optional
        !autotrack
          ? `script.setAttribute("data-auto-track", "${autotrack}")`
          : "";
        domains.length > 0
          ? `script.setAttribute("data-domains", "${domains.join(",")}")`
          : "";
        hostUrl !== "https://cloud.umami.is"
          ? `script.setAttribute("data-host-url", "${hostUrl}")`
          : "";

        page.document!.head.appendChild(script);
      }
    });
  };
}
