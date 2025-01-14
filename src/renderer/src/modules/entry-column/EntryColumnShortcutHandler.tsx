import { useMainContainerElement } from "@renderer/atoms/dom"
import { shortcuts } from "@renderer/constants/shortcuts"
import { useNavigateEntry } from "@renderer/hooks/biz/useNavigateEntry"
import { useRouteEntryId } from "@renderer/hooks/biz/useRouteParams"
import { useRefValue } from "@renderer/hooks/common"
import type { FC } from "react"
import { memo, useLayoutEffect, useState } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import type { VirtuosoHandle } from "react-virtuoso"

export const EntryColumnShortcutHandler: FC<{
  refetch: () => void
  data: readonly string[]
  virtuosoRef: React.RefObject<VirtuosoHandle>
}> = memo(({ data, refetch, virtuosoRef }) => {
  const dataRef = useRefValue(data!)

  useHotkeys(
    shortcuts.entries.refetch.key,
    () => {
      refetch()
    },
    { scopes: ["home"] },
  )
  const currentEntryIdRef = useRefValue(useRouteEntryId())

  const navigate = useNavigateEntry()

  const $mainContainer = useMainContainerElement()
  const [enabledArrowKey, setEnabledArrowKey] = useState(false)

  // Enable arrow key navigation shortcuts only when focus is on entryContent or entryList,
  // entryList shortcuts should not be triggered in the feed col
  useLayoutEffect(() => {
    if (!$mainContainer) return
    const handler = () => {
      const target = document.activeElement
      const isFocusIn =
        $mainContainer.contains(target) || $mainContainer === target

      setEnabledArrowKey(isFocusIn)
    }

    handler()
    // NOTE: focusin event will bubble to the document
    document.addEventListener("focusin", handler)
    return () => {
      document.removeEventListener("focusin", handler)
    }
  }, [$mainContainer])

  useHotkeys(
    shortcuts.entries.next.key,
    () => {
      const data = dataRef.current
      const currentActiveEntryIndex = data.indexOf(
        currentEntryIdRef.current || "",
      )

      const nextIndex = Math.min(currentActiveEntryIndex + 1, data.length - 1)

      virtuosoRef.current?.scrollIntoView?.({
        index: nextIndex,
      })
      const nextId = data![nextIndex]

      navigate({
        entryId: nextId,
      })
    },
    { scopes: ["home"], enabled: enabledArrowKey },
  )
  useHotkeys(
    shortcuts.entries.previous.key,
    () => {
      const data = dataRef.current
      const currentActiveEntryIndex = data.indexOf(
        currentEntryIdRef.current || "",
      )

      const nextIndex =
        currentActiveEntryIndex === -1 ?
          data.length - 1 :
          Math.max(0, currentActiveEntryIndex - 1)

      virtuosoRef.current?.scrollIntoView?.({
        index: nextIndex,
      })
      const nextId = data![nextIndex]

      navigate({
        entryId: nextId,
      })
    },
    { scopes: ["home"], enabled: enabledArrowKey },
  )
  return null
})
