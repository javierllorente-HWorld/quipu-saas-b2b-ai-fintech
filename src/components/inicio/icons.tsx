import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & { title?: string };

function BaseIcon({ title, children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : "presentation"}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export function IconHome(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M6.5 10.5V20h11V10.5" />
    </BaseIcon>
  );
}

export function IconWallet(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 7h16a2 2 0 0 1 2 2v2H4a2 2 0 0 1-2-2 2 2 0 0 1 2-2Z" />
      <path d="M2 11v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6" />
      <path d="M17 14h3" />
    </BaseIcon>
  );
}

export function IconArrowDown(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 5v14" />
      <path d="M7 14l5 5 5-5" />
    </BaseIcon>
  );
}

export function IconArrowUp(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 19V5" />
      <path d="M7 10l5-5 5 5" />
    </BaseIcon>
  );
}

export function IconBank(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 10h16" />
      <path d="M6 10V20" />
      <path d="M10 10V20" />
      <path d="M14 10V20" />
      <path d="M18 10V20" />
      <path d="M3 20h18" />
      <path d="M12 4 3 9h18l-9-5Z" />
    </BaseIcon>
  );
}

export function IconChart(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M7 15l3-3 3 2 5-6" />
    </BaseIcon>
  );
}

export function IconSparkles(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 2l1.2 3.8L17 7l-3.8 1.2L12 12l-1.2-3.8L7 7l3.8-1.2L12 2Z" />
      <path d="M19 13l.8 2.4L22 16l-2.2.6L19 19l-.8-2.4L16 16l2.2-.6L19 13Z" />
      <path d="M4 13l.9 2.7L7.5 16l-2.6.7L4 19l-.9-2.7L.5 16l2.6-.3L4 13Z" />
    </BaseIcon>
  );
}

export function IconHelp(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M9.6 9a2.6 2.6 0 1 1 4.6 1.6c-.7.8-1.7 1.1-2.2 2.4" />
      <path d="M12 17h.01" />
      <path d="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10Z" />
    </BaseIcon>
  );
}

export function IconBell(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
      <path d="M10.5 19a1.5 1.5 0 0 0 3 0" />
    </BaseIcon>
  );
}

export function IconWallClock(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10Z" />
      <path d="M12 7v5" />
      <path d="M12 12l3 2" />
      <path d="M12 5v.5" />
      <path d="M12 18.5V19" />
      <path d="M5 12h.5" />
      <path d="M18.5 12h.5" />
    </BaseIcon>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
      <path d="M16.5 16.5 21 21" />
    </BaseIcon>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M6 9l6 6 6-6" />
    </BaseIcon>
  );
}

export function IconMenu(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </BaseIcon>
  );
}

export function IconX(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </BaseIcon>
  );
}

export function IconUser(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
      <path d="M20 20a8 8 0 1 0-16 0" />
    </BaseIcon>
  );
}

export function IconLogout(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M10 17l-1 3h11a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H9l1 3" />
      <path d="M6 12h10" />
      <path d="M6 12l3-3" />
      <path d="M6 12l3 3" />
    </BaseIcon>
  );
}

