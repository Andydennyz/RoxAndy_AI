declare module "@usehercules/auth/react" {
  import type React from "react";
  export const HerculesAuthProvider: React.ComponentType<any>;
  export function useAuth(): any;
  export function useAuthCallback(options: any): any;
  export default HerculesAuthProvider;
}

declare module "@usehercules/auth/convex-react" {
  import type React from "react";
  export const ConvexProviderWithHerculesAuth: React.ComponentType<any>;
  export default ConvexProviderWithHerculesAuth;
}

declare module "convex/react" {
  import type React from "react";

  export class ConvexReactClient {
    constructor(url?: string);
  }

  export const ConvexProvider: React.ComponentType<{
    client: ConvexReactClient;
    children?: React.ReactNode;
  }>;

  export function useQuery(...args: any[]): any;
  export function useMutation(...args: any[]): any;
  export function useAction(...args: any[]): any;
  export function useConvexAuth(): any;
  export const Authenticated: any;
  export const Unauthenticated: any;
  export const AuthLoading: any;
  export const AuthRefreshing: any;
}

declare module "@tanstack/react-query" {
  export class QueryClient {}
  export const QueryClientProvider: any;
  export const QueryClientWrapper: any;
  export function useQueryClient(): any;
  export function useQuery(...args: any[]): any;
}

declare module "next-themes" {
  import type React from "react";
  export type ThemeProviderProps = any;
  export const ThemeProvider: React.ComponentType<any>;
  export default ThemeProvider;
}

declare module "@usehercules/*" {
  const whatever: any;
  export default whatever;
}

declare module "react-router-dom" {
  export const Outlet: any;
  export const Link: any;
  export function useNavigate(): any;
  export function useLocation(): any;
  export function useParams<T = any>(): T;
  export function useMatch(path: string): any;
  export function useSearchParams(): any;
}

declare module "radix-ui" {
  export const Accordion: any;
  export const AlertDialog: any;
  export const AspectRatio: any;
  export const Avatar: any;
  export const Slot: any;
  export const Tooltip: any;
  export const Separator: any;
  export const Portal: any;
  export const Provider: any;
  export const Checkbox: any;
  export const Collapsible: any;
  export const ContextMenu: any;
  export const Dialog: any;
  export const DropdownMenu: any;
  export const HoverCard: any;
  export const Menubar: any;
  export const NavigationMenu: any;
  export const Popover: any;
  export const Sheet: any;
  export const Tabs: any;
  export const Toggle: any;
  export const Label: any;
  export const Progress: any;
  export const RadioGroup: any;
  export const ScrollArea: any;
  export const Select: any;
  export const Slider: any;
  export const Switch: any;
  export const ToggleGroup: any;
  export default {} as any;
}


declare module "react-day-picker" {
  export type Day = any;
  export type DayButton = any;
  export function getDefaultClassNames(...args: any[]): any;
  export const DayButton: any;
  export const DayPicker: any;
  export default DayPicker;
}

declare module "embla-carousel-react" {
  export type UseEmblaCarouselType = any;
  const whatever: any;
  export default whatever;
}

declare module "recharts" {
  const whatever: any;
  export const ResponsiveContainer: any;
  export const Tooltip: any;
  export const Legend: any;
  export type DefaultTooltipContentProps<T = any, U = any> = any;
  export type DefaultLegendContentProps = any;
  export type TooltipValueType = any;
  export default whatever;
}

declare module "sonner" {
  export const toast: {
    (message: any, opts?: any): void;
    error: (message: any, opts?: any) => void;
    success: (message: any, opts?: any) => void;
  };
  export const Toaster: any;
  export type ToasterProps = any;
  export default { toast, Toaster };
}

declare module "@/convex/_generated/api.js" {
  export const api: any;
}

declare module "@/hooks/*" {
  const whatever: any;
  export const useIsMobile: any;
  export default whatever;
}

declare module "react-resizable-panels" {
  export type GroupProps = any;
  export type PanelProps = any;
  export type SeparatorProps = any;
  export const Group: any;
  export const Panel: any;
  export const Separator: any;
  export default {} as any;
}

declare module "use-debounce" {
  export function useDebounce<ValueType>(
    value: ValueType,
    delay: number,
    options?: any,
  ): [ValueType, () => void, () => void];
  export function useDebouncedCallback<Args extends any[] = any[]>(
    callback: (...args: Args) => void,
    delay: number,
    options?: any,
  ): [(...args: Args) => void, { cancel: () => void; flush: () => void }];
  export function useThrottledCallback<Args extends any[] = any[]>(
    callback: (...args: Args) => void,
    delay: number,
    options?: any,
  ): [(...args: Args) => void, { cancel: () => void; flush: () => void }];
  export type CallOptions = any;
  export type ControlFunctions = any;
  export type DebouncedState<T> = [T, boolean, boolean];
  export type Options = any;
}

declare module "embla-carousel-react" {
  export type EmblaApi = {
    canScrollPrev: () => boolean;
    canScrollNext: () => boolean;
    scrollPrev: () => void;
    scrollNext: () => void;
    on: (event: string, cb: (...args: any[]) => void) => void;
    off: (event: string, cb?: (...args: any[]) => void) => void;
  } | null;

  export type UseEmblaCarouselType = [
    (el: HTMLElement | null) => void,
    EmblaApi,
  ];

  export type EmblaOptions = {
    axis?: "x" | "y";
  } & Record<string, unknown>;

  export default function useEmblaCarousel(
    options?: EmblaOptions,
    plugins?: unknown,
  ): UseEmblaCarouselType;
}

declare module "next-themes" {
  import type React from "react";
  export type ThemeProviderProps = any;
  export const ThemeProvider: React.ComponentType<any>;
  export function useTheme(): any;
  export default ThemeProvider;
}

declare module "cmdk" {
  export const Command: any;
  const whatever: any;
  export default whatever;
}

declare module "vaul" {
  export const Drawer: any;
  const whatever: any;
  export default whatever;
}

declare module "input-otp" {
  export const OTPInput: any;
  export const OTPInputContext: any;
  export interface OTPInputContextShape { slots?: any[] }
  export default OTPInput;
}

declare module "sonner" {
  export function toast(message: any, opts?: any): void;
  export default { toast };
}

declare module "react-hook-form" {
  export const Controller: any;
  export const FormProvider: any;
  export function useFormContext(): any;
  export function useFormState(...args: any[]): any;
  export type ControllerProps<TFieldValues = any, TName = any> = any;
  export type FieldPath<T> = any;
  export type FieldValues = any;
}

declare module "class-variance-authority" {
  export function cva(...args: any[]): any;
  export type VariantProps<T = any> = any;
}

