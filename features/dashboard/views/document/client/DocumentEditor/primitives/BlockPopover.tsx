import {
  cloneElement,
  createContext,
  type ReactElement,
  type ReactNode,
  type Ref,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { type Element, Editor } from 'slate'

import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

import { nodeTypeMatcher } from '../utils'

export type OverlayTriggerState = {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export function useOverlayTriggerState(props: { isOpen?: boolean; defaultOpen?: boolean } = {}): OverlayTriggerState {
  const [isOpen, setIsOpen] = useState(props.isOpen ?? props.defaultOpen ?? false)
  useEffect(() => {
    if (props.isOpen !== undefined) {
      setIsOpen(props.isOpen)
    }
  }, [props.isOpen])
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(v => !v)
  }
}

type RenderFn = (close: () => void) => ReactElement
type BlockPopoverTriggerProps = {
  element: Element
  children: [ReactElement, ReactElement<BlockPopoverProps>]
}
type BlockPopoverProps = {
  children: ReactElement | RenderFn
  hideArrow?: boolean
  placement?: 'top' | 'bottom' | 'start' | 'end' | 'left' | 'right'
}

const BlockPopoverContext = createContext<{
  state: OverlayTriggerState
  triggerRef: React.MutableRefObject<HTMLElement | null>
} | null>(null)

function useBlockPopoverContext() {
  const context = useContext(BlockPopoverContext)
  if (!context) {
    throw new Error('useBlockPopoverContext must be used within a BlockPopoverTrigger')
  }
  return context
}

const typeMatcher = nodeTypeMatcher('code', 'component-block', 'layout', 'link', 'heading')

const ActiveBlockPopoverContext = createContext<undefined | Element>(undefined)
export function useActiveBlockPopover() {
  return useContext(ActiveBlockPopoverContext)
}

export function ActiveBlockPopoverProvider(props: { children: ReactNode; editor: Editor }) {
  const nodeWithPopover = Editor.above(props.editor, {
    match: typeMatcher,
  })
  return (
    <ActiveBlockPopoverContext.Provider value={nodeWithPopover?.[0]}>
      {props.children}
    </ActiveBlockPopoverContext.Provider>
  )
}

export const BlockPopoverTrigger = ({ children, element }: BlockPopoverTriggerProps) => {
  const [trigger, popoverNode] = children
  const activePopoverElement = useActiveBlockPopover()
  const triggerRef = useRef<HTMLElement | null>(null) // Ensure triggerRef type

  // OverlayTriggerState might still be useful for controlling open state externally if needed
  const state = useOverlayTriggerState({
    isOpen: activePopoverElement === element,
  })

  const context = useMemo(() => ({ state, triggerRef }), [state, triggerRef])

  return (
    <BlockPopoverContext.Provider value={context}>
      <Popover open={state.isOpen} onOpenChange={(open) => { if (!open) state.close(); }}>
        <PopoverTrigger asChild>
          {cloneElement(trigger as ReactElement<{ ref?: Ref<any> }>, { ref: triggerRef })}
        </PopoverTrigger>
        {/* Render the BlockPopover (which will contain PopoverContent) */}
        {state.isOpen && cloneElement(popoverNode as ReactElement<BlockPopoverProps>, {
          // Pass necessary props to BlockPopover, like placement
          placement: popoverNode.props.placement,
        })}
      </Popover>
    </BlockPopoverContext.Provider>
  )
}

export function BlockPopover(props: BlockPopoverProps) {
  const { state } = useBlockPopoverContext() // state.close can be used by children
  // wrapperRef is not directly used by ShadCN PopoverContent in the same way
  // PopoverContent will manage its own ref for positioning.

  return (
    <PopoverContent
      side={props.placement === 'start' ? 'left' : props.placement === 'end' ? 'right' : props.placement as any}
      // sideOffset might be needed for margin similar to tokenSchema.size.space.regular
      sideOffset={8} // Example offset, adjust as needed
      className={cn(
        "bg-background rounded-md border border-border shadow-lg",
        "min-h-[var(--ks-size-element-regular,2.25rem)] min-w-[var(--ks-size-element-regular,2.25rem)]", // Using CSS vars as fallback for tokenSchema
        "outline-none pointer-events-auto select-none",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2"
        // The complex transform and opacity transitions are handled by ShadCN's animation classes.
        // The filter: drop-shadow is replaced by shadow-lg.
        // Placement specific margins are handled by sideOffset or could be added if necessary.
      )}
      onOpenAutoFocus={(e) => e.preventDefault()} // Prevent focus stealing if needed
      onCloseAutoFocus={(e) => e.preventDefault()}
      // The {...popoverProps} from useBlockPopover is removed as ShadCN handles positioning.
      // If specific aria props are needed, they should be added directly.
      contentEditable={false} // Kept from original
    >
      {typeof props.children === 'function' ? props.children(state.close) : props.children}
    </PopoverContent>
  )
}

