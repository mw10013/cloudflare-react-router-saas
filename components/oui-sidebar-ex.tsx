"use client";

/**
 * The `oui-sidebar-ex` module provides SidebarExTrigger and SidebarExTree to use with shadcn Sidebar.
 * 
 * @example
 * ```tsx
 * <SidebarProvider>
 *   <SidebarExTrigger />
 *   <Sidebar>
 *     <SidebarContent>
 *       <SidebarExTree aria-label="App Navigation" items={items} />
 *     </SidebarContent>
 *   </Sidebar>
 * </SidebarProvider>
 * ```
 */
import * as React from "react";
import { composeTailwindRenderProps } from "@/components/ui/oui-base";
import { Button } from "@/components/ui/oui-button";
import { useSidebar } from "@/components/ui/sidebar";
import { ChevronRight, PanelLeftIcon } from "lucide-react";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";

export function SidebarExTrigger({
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  className,
  onPress,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      aria-label={!ariaLabel && !ariaLabelledBy ? "Toggle sidebar" : ariaLabel}
      aria-labelledby={ariaLabelledBy}
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={composeTailwindRenderProps(className, "size-7")}
      onPress={(e) => {
        onPress?.(e);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeftIcon />
    </Button>
  );
}

export interface SidebarExTreeNode {
  id: string;
  title?: string;
  href?: string;
  "data-testid"?: string;
  children?: SidebarExTreeNode[];
}

export interface SidebarExTreeItemContentProps
  extends Rac.TreeItemContentProps {
  href?: string;
}

export function SidebarExTreeItemContent({
  children,
  href,
  ...props
}: SidebarExTreeItemContentProps) {
  return (
    <Rac.TreeItemContent {...props}>
      {(renderProps) => {
        return (
          <div
            className={twMerge(
              "flex h-8 shrink-0 items-center rounded-md px-2 text-sm text-sidebar-foreground ring-sidebar-ring outline-hidden transition-[margin,opacity] duration-200 ease-linear [&>svg]:size-4 [&>svg]:shrink-0",
              "data-hovered:bg-transparent data-hovered:text-current dark:data-hovered:bg-transparent",
              renderProps.hasChildItems && "font-medium",
              renderProps.isHovered &&
                "bg-sidebar-accent text-sidebar-accent-foreground",
              renderProps.isFocusVisible && "ring-2",
              href ? "cursor-pointer" : "cursor-default",
            )}
          >
            {typeof children === "function" ? children(renderProps) : children}
            {renderProps.hasChildItems && (
              <Button
                slot="chevron"
                variant="ghost"
                size="icon"
                className="ml-auto"
              >
                <ChevronRight
                  className={twMerge(
                    "transition-transform",
                    renderProps.isExpanded && "rotate-90",
                  )}
                />
              </Button>
            )}
          </div>
        );
      }}
    </Rac.TreeItemContent>
  );
}

export interface SidebarExTreeItemProps extends Partial<Rac.TreeItemProps> {
  title: string;
}

export function SidebarTreeItemEx({
  title,
  className,
  children,
  ...props
}: SidebarExTreeItemProps) {
  return (
    <Rac.TreeItem
      textValue={title}
      {...props}
      className={Rac.composeRenderProps(className, (className, renderProps) =>
        twMerge(
          "outline-none",
          renderProps.hasChildItems && "mt-4 first:mt-0",
          renderProps.isFocusVisible && "relative z-10",
          className,
        ),
      )}
    >
      <SidebarExTreeItemContent href={props.href}>
        {title}
      </SidebarExTreeItemContent>
      {children}
    </Rac.TreeItem>
  );
}

/**
 * Derived from SidebarGroup
 */
export function SidebarExTree(props: Rac.TreeProps<SidebarExTreeNode>) {
  return (
    <Rac.Tree {...props} className="relative flex w-full min-w-0 flex-col p-2">
      {function renderSidebarTreeNodeEx(item) {
        return (
          <SidebarTreeItemEx
            key={item.id}
            id={item.id}
            title={item.title ?? item.id}
            href={item.href}
            data-testid={item["data-testid"]}
          >
            <Rac.Collection items={item.children}>
              {renderSidebarTreeNodeEx}
            </Rac.Collection>
          </SidebarTreeItemEx>
        );
      }}
    </Rac.Tree>
  );
}
