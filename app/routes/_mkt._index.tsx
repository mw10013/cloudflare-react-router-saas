import type { Route as MktRoute } from "./+types/_mkt"; // Import type from parent route

import * as Oui from "@/components/ui/oui-index";
import * as Rac from "react-aria-components";
import * as ReactRouter from "react-router";
import { siGithub } from "simple-icons";

export default function RouteComponent() {
  const mktRouteLoaderData =
    ReactRouter.useRouteLoaderData<MktRoute.ComponentProps["loaderData"]>(
      "routes/_mkt",
    );
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center py-12">
      <div className="relative flex min-h-[40vh] w-full flex-col items-center justify-center gap-4 border px-6 py-24">
        {/* Decorative Lines */}
        <span className="bg-primary absolute -top-[9px] left-0 h-5 w-px animate-pulse opacity-80" />
        <span className="bg-primary absolute top-0 -left-[9px] h-px w-5 animate-pulse opacity-80" />
        <span className="bg-primary absolute right-0 -bottom-[9px] h-5 w-px animate-pulse opacity-80" />
        <span className="bg-primary absolute -right-[9px] bottom-0 h-px w-5 animate-pulse opacity-80" />
        <span className="absolute top-0 right-0 size-24 rounded-tr-[9.4rem] border-t border-r opacity-80" />
        <span className="absolute top-0 left-0 size-24 rounded-tl-[9.4rem] border-t border-l opacity-80" />

        {/* Hero */}
        <span className="bg-secondary text-primary/90 mb-2 flex h-8 items-center rounded-full border px-3 py-1 text-sm font-medium">
          Production-Ready SaaS Template
        </span>
        <h1 className="text-center text-3xl leading-tight font-semibold text-wrap md:text-5xl">
          Launch in days, not months.
        </h1>
        <p className="text-muted-foreground max-w-xl text-center text-xl text-pretty md:text-2xl">
          Everything you need: authentication, subscriptions, team management,
          and edge infrastructure.
        </p>
        <div className="mt-6 flex w-fit gap-4">
          {mktRouteLoaderData?.sessionUser ? (
            <Oui.Link
              href={
                mktRouteLoaderData.sessionUser.role === "admin"
                  ? "/admin"
                  : "/app"
              }
              className={Oui.buttonClassName(
                { variant: "default" },
                "h-11 rounded-full! px-6 text-base! font-medium",
              )}
            >
              Go to Dashboard
            </Oui.Link>
          ) : (
            <Oui.Link
              href={ReactRouter.href("/login")}
              className={Oui.buttonClassName(
                { variant: "default" },
                "h-11 rounded-full! px-6 text-base! font-medium",
              )}
            >
              Get Started
            </Oui.Link>
          )}

          <Rac.Link
            href="https://github.com/mw10013/cloudflare-react-router-saas"
            target="_blank"
            rel="noopener noreferrer"
            className={Oui.buttonClassName(
              { variant: "outline" },
              "h-11 rounded-full! text-base! font-medium",
            )}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
              <path d={siGithub.path} />
            </svg>
            Star on Github
          </Rac.Link>
        </div>
      </div>
      <div className="flex w-full flex-col items-center md:flex-row">
        <div className="group relative flex aspect-square h-full w-full flex-col items-center justify-center gap-4 overflow-hidden border-l p-6 not-sm:border-r">
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, var(--muted) 0px, var(--muted) 1px, transparent 1px, transparent 5px)",
            }}
          />
          <h1 className="text-center text-2xl leading-tight font-semibold text-wrap lg:text-3xl">
            Cloudflare Workers
          </h1>
          <p className="text-center text-2xl leading-tight font-medium text-wrap lg:text-3xl">
            Serverless infrastructure for running your application at the edge
            worldwide
          </p>
          <svg
            viewBox="0 0 256 231"
            preserveAspectRatio="xMidYMid"
            className="absolute -bottom-20 size-40 grayscale transition-all group-hover:scale-105 group-hover:grayscale-0"
          >
            <defs>
              <linearGradient
                id="cloudflare_workers__a"
                x1="50%"
                x2="25.7%"
                y1="100%"
                y2="8.7%"
              >
                <stop offset="0%" stopColor="#EB6F07" />
                <stop offset="100%" stopColor="#FAB743" />
              </linearGradient>
              <linearGradient
                id="cloudflare_workers__b"
                x1="81%"
                x2="40.5%"
                y1="83.7%"
                y2="29.5%"
              >
                <stop offset="0%" stopColor="#D96504" />
                <stop offset="100%" stopColor="#D96504" stopOpacity={0} />
              </linearGradient>
              <linearGradient
                id="cloudflare_workers__c"
                x1="42%"
                x2="84%"
                y1="8.7%"
                y2="79.9%"
              >
                <stop offset="0%" stopColor="#EB6F07" />
                <stop offset="100%" stopColor="#EB720A" stopOpacity={0} />
              </linearGradient>
              <linearGradient
                id="cloudflare_workers__d"
                x1="50%"
                x2="25.7%"
                y1="100%"
                y2="8.7%"
              >
                <stop offset="0%" stopColor="#EE6F05" />
                <stop offset="100%" stopColor="#FAB743" />
              </linearGradient>
              <linearGradient
                id="cloudflare_workers__e"
                x1="-33.2%"
                x2="91.7%"
                y1="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#D96504" stopOpacity=".8" />
                <stop offset="49.8%" stopColor="#D96504" stopOpacity=".2" />
                <stop offset="100%" stopColor="#D96504" stopOpacity={0} />
              </linearGradient>
              <linearGradient
                id="cloudflare_workers__f"
                x1="50%"
                x2="25.7%"
                y1="100%"
                y2="8.7%"
              >
                <stop offset="0%" stopColor="#FFA95F" />
                <stop offset="100%" stopColor="#FFEBC8" />
              </linearGradient>
              <linearGradient
                id="cloudflare_workers__g"
                x1="8.1%"
                x2="96.5%"
                y1="1.1%"
                y2="48.8%"
              >
                <stop offset="0%" stopColor="#FFF" stopOpacity=".5" />
                <stop offset="100%" stopColor="#FFF" stopOpacity=".1" />
              </linearGradient>
              <linearGradient
                id="cloudflare_workers__h"
                x1="-13.7%"
                x2="100%"
                y1="104.2%"
                y2="46.2%"
              >
                <stop offset="0%" stopColor="#FFF" stopOpacity=".5" />
                <stop offset="100%" stopColor="#FFF" stopOpacity=".1" />
              </linearGradient>
            </defs>
            <path
              fill="url(#cloudflare_workers__a)"
              d="m65.82 3.324 30.161 54.411-27.698 49.857a16.003 16.003 0 0 0 0 15.573l27.698 49.98-30.16 54.411a32.007 32.007 0 0 1-13.542-12.74L4.27 131.412a32.13 32.13 0 0 1 0-32.007l48.01-83.403a32.007 32.007 0 0 1 13.542-12.68Z"
            />
            <path
              fill="url(#cloudflare_workers__b)"
              d="M68.283 107.654a16.003 16.003 0 0 0 0 15.51l27.698 49.98-30.16 54.412a32.007 32.007 0 0 1-13.542-12.74L4.27 131.412c-3.816-6.586 17.542-14.465 64.014-23.698v-.061Z"
              opacity=".7"
            />
            <path
              fill="url(#cloudflare_workers__c)"
              d="m68.898 8.802 27.083 48.933-4.493 7.818-23.882-40.44c-6.894-11.264-17.42-5.416-30.591 17.358l1.97-3.386 13.294-23.082a32.007 32.007 0 0 1 13.419-12.68l3.139 5.479h.061Z"
              opacity=".5"
            />
            <path
              fill="url(#cloudflare_workers__d)"
              d="m203.696 16.003 48.01 83.403c5.725 9.848 5.725 22.159 0 32.007l-48.01 83.402a32.007 32.007 0 0 1-27.698 16.004h-48.01l59.705-107.654a16.003 16.003 0 0 0 0-15.511L127.988 0h48.01a32.007 32.007 0 0 1 27.698 16.003Z"
            />
            <path
              fill="url(#cloudflare_workers__e)"
              d="m173.536 230.45-47.395.43 57.367-108.208a16.619 16.619 0 0 0 0-15.634L126.14 0h10.834l60.197 106.546a16.619 16.619 0 0 1-.062 16.496 9616.838 9616.838 0 0 0-38.592 67.707c-11.695 20.558-6.648 33.791 15.018 39.7Z"
            />
            <path
              fill="url(#cloudflare_workers__f)"
              d="M79.978 230.819c-4.924 0-9.849-1.17-14.157-3.263l59.212-106.792a11.045 11.045 0 0 0 0-10.71L65.821 3.324A32.007 32.007 0 0 1 79.978 0h48.01l59.705 107.654a16.003 16.003 0 0 1 0 15.51L127.988 230.82h-48.01Z"
            />
            <path
              fill="url(#cloudflare_workers__g)"
              d="M183.508 110.054 122.448 0h5.54l59.705 107.654a16.003 16.003 0 0 1 0 15.51L127.988 230.82h-5.54l61.06-110.055a11.045 11.045 0 0 0 0-10.71Z"
              opacity=".6"
            />
            <path
              fill="url(#cloudflare_workers__h)"
              d="M125.033 110.054 65.821 3.324c1.846-.985 4.062-1.724 6.155-2.34 13.049 23.452 32.315 59.029 57.859 106.67a16.003 16.003 0 0 1 0 15.51L71.053 229.589c-2.093-.616-3.201-1.047-5.17-1.97l59.089-106.792a11.045 11.045 0 0 0 0-10.71l.061-.062Z"
              opacity=".6"
            />
          </svg>
        </div>
        <div className="group relative flex aspect-square h-full w-full flex-col items-center justify-center gap-4 overflow-hidden border-r border-l p-6">
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, var(--muted) 0px, var(--muted) 1px, transparent 1px, transparent 5px)",
            }}
          />
          <h1 className="text-center text-2xl leading-tight font-semibold text-wrap lg:text-3xl">
            React Router v7
          </h1>
          <p className="text-center text-2xl leading-tight font-medium text-wrap lg:text-3xl">
            Modern routing and data handling framework for full-stack web
            applications
          </p>
          <svg
            viewBox="0 0 94 61"
            fill="none"
            className="absolute -bottom-20 size-40 grayscale transition-all group-hover:scale-105 group-hover:grayscale-0"
          >
            <path
              d="M72.7315 20.9357C70.0548 20.0941 68.6725 20.3778 65.8649 20.071C61.5246 19.5976 59.7954 17.9013 59.0619 13.5356C58.6514 11.0985 59.1361 7.53022 58.0881 5.32106C56.0839 1.10875 51.3943 -0.780439 46.6828 0.297843C42.7049 1.20956 39.3951 5.18518 39.2117 9.266C39.0021 13.9254 41.657 17.901 46.2156 19.273C48.3814 19.9261 50.6825 20.2548 52.9444 20.4214C57.0925 20.7238 57.4113 23.0297 58.5335 24.9277C59.2409 26.1243 59.9264 27.3034 59.9264 30.8714C59.9264 34.4394 59.2365 35.6185 58.5335 36.8151C57.4113 38.7087 56.0271 39.9491 51.879 40.2559C49.6171 40.4225 47.3116 40.7513 45.1502 41.4044C40.5916 42.7807 37.9367 46.7519 38.1463 51.4113C38.3297 55.4921 41.6395 59.4678 45.6174 60.3795C50.3289 61.4621 55.0185 59.5686 57.0227 55.3563C58.075 53.1471 58.6514 50.6443 59.0619 48.2072C59.7998 43.8414 61.5289 42.1451 65.8649 41.6717C68.6725 41.3649 71.5783 41.6717 74.2093 40.177C76.9895 38.1456 79.4734 35.0968 79.4734 30.8714C79.4734 26.6459 76.7967 22.2156 72.7315 20.9357Z"
              fill="#F44250"
            />
            <path
              d="M28.1997 40.7739C22.7285 40.7739 18.2656 36.3027 18.2656 30.8213C18.2656 25.3399 22.7285 20.8687 28.1997 20.8687C33.6709 20.8687 38.1338 25.3399 38.1338 30.8213C38.1338 36.2983 33.6665 40.7739 28.1997 40.7739Z"
              fill="#121212"
            />
            <path
              d="M9.899 61C4.43661 60.9868 -0.0130938 56.498 2.89511e-05 51.0122C0.0132099 45.5353 4.4936 41.0773 9.96914 41.0948C15.4359 41.108 19.8856 45.5968 19.8681 51.0825C19.8549 56.5551 15.3745 61.0131 9.899 61Z"
              fill="#121212"
            />
            <path
              d="M83.7137 60.9998C78.2339 61.0304 73.7361 56.5901 73.7052 51.122C73.6747 45.632 78.1068 41.1258 83.5646 41.0949C89.0444 41.0643 93.5423 45.5046 93.5731 50.9727C93.6036 56.4583 89.1716 60.9689 83.7137 60.9998Z"
              fill="#121212"
            />
          </svg>
        </div>
      </div>
      <div className="relative flex w-full flex-col items-start justify-center gap-4 border p-12 py-16">
        <div className="absolute inset-4 -z-10">
          <svg
            className="text-primary/10 pointer-events-none absolute inset-0"
            width="100%"
            height="100%"
          >
            <defs>
              <pattern
                id="dots-_S_2_"
                x={-1}
                y={-1}
                width={12}
                height={12}
                patternUnits="userSpaceOnUse"
              >
                <rect x={1} y={1} width={2} height={2} fill="currentColor" />
              </pattern>
            </defs>
            <rect fill="url(#dots-_S_2_)" width="100%" height="100%" />
          </svg>
        </div>
        <h1 className="text-2xl leading-tight font-semibold text-wrap lg:text-3xl">
          All-in-one.
        </h1>
        <p className="text-muted-foreground text-2xl leading-normal font-medium text-wrap sm:max-w-[80%] lg:text-3xl">
          Build with{" "}
          <Oui.Link
            href="https://github.com/mw10013/oui"
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            className="inline-flex items-center gap-1.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary size-6"
              aria-hidden="true"
            >
              <circle cx={12} cy={12} r={10} />
            </svg>
            <span className="text-primary font-semibold">Oui</span>
          </Oui.Link>{" "}
          components, authenticate users with{" "}
          <Oui.Link
            href="https://www.better-auth.com/"
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            className="inline-flex items-center gap-1.5"
          >
            <svg
              fill="none"
              viewBox="0 0 500 500"
              className="inline-block size-6"
            >
              <path fill="#fff" d="M0 0h500v500H0z" />
              <path
                fill="#000"
                d="M69 121h86.988v259H69zM337.575 121H430v259h-92.425z"
              />
              <path
                fill="#000"
                d="M427.282 121v83.456h-174.52V121zM430 296.544V380H252.762v-83.456z"
              />
              <path fill="#000" d="M252.762 204.455v92.089h-96.774v-92.089z" />
            </svg>
            <span className="text-primary font-semibold">Better-Auth</span>
          </Oui.Link>
          , and monetize through{" "}
          <Oui.Link
            href="https://stripe.com/"
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            className="inline-flex items-center gap-1.5"
          >
            <span className="inline-flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 32"
                className="inline-block size-6 brightness-125"
                fill="#6772e5"
              >
                <path
                  d="M111.328 15.602c0-4.97-2.415-8.9-7.013-8.9s-7.423 3.924-7.423 8.863c0 5.85 3.32 8.8 8.036 8.8 2.318 0 4.06-.528 5.377-1.26V19.22a10.246 10.246 0 0 1-4.764 1.075c-1.9 0-3.556-.67-3.774-2.943h9.497a39.64 39.64 0 0 0 .063-1.748zm-9.606-1.835c0-2.186 1.35-3.1 2.56-3.1s2.454.906 2.454 3.1zM89.4 6.712a5.434 5.434 0 0 0-3.801 1.509l-.254-1.208h-4.27v22.64l4.85-1.032v-5.488a5.434 5.434 0 0 0 3.444 1.265c3.472 0 6.64-2.792 6.64-8.957.003-5.66-3.206-8.73-6.614-8.73zM88.23 20.1a2.898 2.898 0 0 1-2.288-.906l-.03-7.2a2.928 2.928 0 0 1 2.315-.96c1.775 0 2.998 2 2.998 4.528.003 2.593-1.198 4.546-2.995 4.546zM79.25.57l-4.87 1.035v3.95l4.87-1.032z"
                  fillRule="evenodd"
                />
                <path d="M74.38 7.035h4.87V24.04h-4.87z" />
                <path
                  d="M69.164 8.47l-.302-1.434h-4.196V24.04h4.848V12.5c1.147-1.5 3.082-1.208 3.698-1.017V7.038c-.646-.232-2.913-.658-4.048 1.43zm-9.73-5.646L54.698 3.83l-.02 15.562c0 2.87 2.158 4.993 5.038 4.993 1.585 0 2.756-.302 3.405-.643v-3.95c-.622.248-3.683 1.138-3.683-1.72v-6.9h3.683V7.035h-3.683zM46.3 11.97c0-.758.63-1.05 1.648-1.05a10.868 10.868 0 0 1 4.83 1.25V7.6a12.815 12.815 0 0 0-4.83-.888c-3.924 0-6.557 2.056-6.557 5.488 0 5.37 7.375 4.498 7.375 6.813 0 .906-.78 1.186-1.863 1.186-1.606 0-3.68-.664-5.307-1.55v4.63a13.461 13.461 0 0 0 5.307 1.117c4.033 0 6.813-1.992 6.813-5.485 0-5.796-7.417-4.76-7.417-6.943zM13.88 9.515c0-1.37 1.14-1.9 2.982-1.9A19.661 19.661 0 0 1 25.6 9.876v-8.27A23.184 23.184 0 0 0 16.862.001C9.762.001 5 3.72 5 9.93c0 9.716 13.342 8.138 13.342 12.326 0 1.638-1.4 2.146-3.37 2.146-2.905 0-6.657-1.202-9.6-2.802v8.378A24.353 24.353 0 0 0 14.973 32C22.27 32 27.3 28.395 27.3 22.077c0-10.486-13.42-8.613-13.42-12.56z"
                  fillRule="evenodd"
                />
              </svg>
              <span className="text-primary font-semibold">Stripe</span>
            </span>
          </Oui.Link>
          .
        </p>
      </div>
      <div className="relative flex min-h-[60vh] w-full flex-col items-center justify-center gap-6 overflow-hidden border border-t-0 p-6">
        <div className="absolute inset-0 isolate -z-10 overflow-hidden">
          <div className="absolute inset-y-0 left-1/2 w-[1200px] -translate-x-1/2 mask-[linear-gradient(black,transparent_320px),linear-gradient(90deg,transparent,black_5%,black_95%,transparent)] mask-intersect">
            <svg
              className="text-primary/10 pointer-events-none absolute inset-0"
              width="100%"
              height="100%"
            >
              <defs>
                <pattern
                  id="grid-_r_17_"
                  x="-0.25"
                  y={-1}
                  width={60}
                  height={60}
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 60 0 L 0 0 0 60"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth={1}
                  />
                </pattern>
              </defs>
              <rect fill="url(#grid-_r_17_)" width="100%" height="100%" />
            </svg>
          </div>
          <div className="absolute top-6 left-1/2 size-20 -translate-x-1/2 -translate-y-1/2 scale-x-[1.6] opacity-10 mix-blend-overlay">
            <div className="absolute -inset-16 bg-[conic-gradient(from_90deg,#22d3ee_5deg,#38bdf8_63deg,#2563eb_115deg,#0ea5e9_170deg,#22d3ee_220deg,#38bdf8_286deg,#22d3ee_360deg)] mix-blend-overlay blur-[50px] grayscale saturate-[2]" />
            <div className="absolute -inset-16 bg-[conic-gradient(from_90deg,#22d3ee_5deg,#38bdf8_63deg,#2563eb_115deg,#0ea5e9_170deg,#22d3ee_220deg,#38bdf8_286deg,#22d3ee_360deg)] mix-blend-overlay blur-[50px] grayscale saturate-[2]" />
          </div>
        </div>
        <span className="text-primary/90 flex h-8 items-center rounded-full text-sm font-medium">
          Open Source & Free
        </span>
        <h1 className="text-center text-3xl leading-tight font-semibold text-wrap md:text-5xl">
          Ready to build your next SaaS?
        </h1>
        <p className="text-muted-foreground max-w-xl text-center text-xl leading-relaxed md:text-2xl">
          Start your project in minutes, support us on GitHub and jump straight
          into the code.
        </p>
        <div className="mt-6 flex flex-col items-center gap-6">
          <div className="flex w-fit gap-4">
            <Rac.Link
              href="https://github.com/mw10013/cloudflare-react-router-saas"
              target="_blank"
              rel="noopener noreferrer"
              className={Oui.buttonClassName(
                { variant: "outline" },
                "h-11 rounded-full! text-base! font-medium",
              )}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
                <path d={siGithub.path} />
              </svg>
              Star on Github
            </Rac.Link>
          </div>
          <p className="text-muted-foreground text-sm">MIT licensed.</p>
        </div>
      </div>
    </div>
  );
}
