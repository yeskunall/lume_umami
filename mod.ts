import type { Plugin } from "lume/core/site.ts";
import type Site from "lume/core/site.ts";

/**
 * @private
 */
type OptionalExceptFor<T, K extends keyof T> =
  & {
    [P in keyof T]: P extends K ? T[P] : T[P] | undefined;
  }
  & Pick<T, K>;

export interface UmamiOptions {
  /**
   * Umami tracks all events and pageviews for you automatically. Override this behavior if you plan on using {@link https://umami.is/docs/tracker-functions | tracker functions}.
   *
   * @default true
   */
  autotrack?: boolean;
  /**
   * If you want the tracker to only run on specific domains, add them to this list.
   *
   * ```ts
   * ["mywebsite.com", "mywebsite2.com"]
   * ```
   */
  domains?: string[];
  /**
   * The endpoint where your Umami instance is located.
   *
   * @default https://cloud.umami.is
   *
   * ```ts
   * https://umami-on.fly.dev
   * ```
   */
  endpointUrl?: string;
  /**
   * Override the location where your analytics data is sent.
   */
  hostUrl?: string;
  /**
   * The unique ID of your {@link https://umami.is/docs/add-a-website | website}.
   */
  id: string;
  /**
   * Assign a custom name to the tracker script.
   *
   * @default script.js
   *
   * @see {@link https://umami.is/docs/environment-variables}
   */
  trackerScriptName?: string;
}

/**
 * @param options The plugin supports all {@link https://umami.is/docs/tracker-configuration | configuration} options. Except for the `id`, all other options are optional. See {@see UmamiOptions} for all available options.
 */
export default function (
  options: OptionalExceptFor<UmamiOptions, "id">,
): Plugin {
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
        !autotrack &&
          script.setAttribute("data-auto-track", `${autotrack}`);

        domains.length > 0 &&
          script.setAttribute("data-domains", `${domains.join(",")}`);

        hostUrl !== "https://cloud.umami.is" &&
          script.setAttribute("data-host-url", `${hostUrl}`);

        page.document!.head.appendChild(script);
      }
    });
  };
}
