import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { theme } from 'themes'
import { logger } from 'utils'
import { Icon } from '../Icon'
import {
  StyledItem,
  StyledTagColorDot,
  StyledTagListItemTitle,
  StyledTagListItemIsAdded,
  StyledEditTag,
  StyledEditTagInput,
  StyledOKIcon,
  StyledEditTagButtonsContainer,
  StyledEditTagColorPickerContainer,
  StyledColorPickerChevronIcon,
  StyledCancelIcon,
  StyledTrashIcon,
} from './styled'
import {
  useFloating,
  offset,
  useListNavigation,
  useInteractions,
  useDismiss,
  FloatingFocusManager,
  useFocus,
  useFloatingNodeId,
  FloatingNode,
  FloatingPortal,
} from '@floating-ui/react-dom-interactions'
import { useEntriesContext, useUserContext } from 'context'
import { ListItemTagColorPicker } from './ListItemTagColorPicker'
import { Tag } from './types'

const StyledWrapper = styled.div``

type ListItemTagProps = {
  i: number
  date: string
  tag: Tag
  tags: Tag[]
  listRef: React.MutableRefObject<any[]>
  listIndexToId: React.MutableRefObject<any[]>
  tagEditingRef: React.MutableRefObject<HTMLDivElement>
  tagEditingInputRef: React.MutableRefObject<HTMLInputElement>
  activeIndex: number
  tagIndexEditing: number | null
  setTagIndexEditing: any
  colorPickerOpen: boolean
  setColorPickerOpen: any
  handleSelect: (e: any, tagId: string) => void
  tagsInputRef: React.MutableRefObject<HTMLInputElement>
  getItemProps: any
}

function ListItemTag({
  i,
  date,
  tag,
  tags,
  listRef,
  listIndexToId,
  tagEditingRef,
  tagEditingInputRef,
  activeIndex,
  tagIndexEditing,
  setTagIndexEditing,
  colorPickerOpen,
  setColorPickerOpen,
  handleSelect,
  tagsInputRef,
  getItemProps,
}: ListItemTagProps) {
  const editButtonRef = useRef<HTMLInputElement>(null)
  const tagEditColorRef = useRef(tag.color)
  const { userTags, cacheAddOrUpdateTag, cacheDeleteTag } = useEntriesContext()
  const { serverTimeNow } = useUserContext()
  // const inputRef = useRef<HTMLInputElement>(null)

  // logger('ListItemTag rerender')

  const exitTagEditing = () => {
    tagsInputRef.current.focus()
    setTagIndexEditing(null)
  }

  const updateTag = () => {
    exitTagEditing()
    tag.name = tagEditingInputRef.current.value
    tag.modified_at = serverTimeNow()
    tag.sync_status = 'pending_update'
    tag.color = tagEditColorRef.current
    cacheAddOrUpdateTag(tag)
    // TODO trigger react state update, so this tag is rerenderd in all entries
  }

  const deleteTag = () => {
    exitTagEditing()
    tag.sync_status = 'pending_delete'
    tag.modified_at = serverTimeNow()
    cacheAddOrUpdateTag(tag)
    userTags.current = userTags.current.filter((t) => {
      return t.id != tag.id
    })
    // TODO trigger react state update, so this tag is rerenderd in all entries
  }

  let isEditingOtherTag = tagIndexEditing != null && tagIndexEditing != i
  let isInTags = !!tags.find((t) => t.id == tag.id)
  return (
    <>
      {tagIndexEditing == i && (
        <StyledWrapper ref={tagEditingRef} id={`${date}-${tag.name}-${tag.id}-editing`}>
          <StyledEditTagInput
            ref={tagEditingInputRef}
            defaultValue={tag.name}
            size={10}
            onKeyDown={(e) => {
              if (e.key === 'Enter') updateTag()
            }}
          ></StyledEditTagInput>
          <ListItemTagColorPicker
            inputRef={tagEditingInputRef}
            colorPickerOpen={colorPickerOpen}
            setColorPickerOpen={setColorPickerOpen}
            tag={tag}
            tagEditColorRef={tagEditColorRef}
          />
          <StyledEditTagButtonsContainer>
            <StyledTrashIcon onClick={() => deleteTag()} />
            <StyledCancelIcon onClick={() => exitTagEditing()} />
            <StyledOKIcon onClick={() => updateTag()} />
          </StyledEditTagButtonsContainer>
        </StyledWrapper>
      )}
      <StyledItem
        id={`${date}-${tag.name}-${tag.id}`}
        ref={(node) => {
          listRef.current[i] = node
          listIndexToId.current[i] = tag.id
        }}
        isActive={activeIndex == i}
        isDisabled={isEditingOtherTag}
        isHidden={tagIndexEditing == i}
        isAnyActiveIndex={activeIndex != null}
        {...getItemProps({
          onMouseDown(e: any) {
            if (editButtonRef.current.contains(e.target)) {
              e.stopPropagation()
              e.preventDefault()
              setTagIndexEditing(i)
              setTimeout(() => {
                if (!!tagEditingInputRef.current) {
                  tagEditingInputRef.current.select()
                }
              }, 100)
              logger('onMouseDown StyledEditTag')
            } else {
              handleSelect(e, tag.id)
            }
          },
          onFocus() {
            logger('StyledItem sel.refs.reference.current.focus()')
            tagsInputRef.current.focus()
          },
          onKeyDown(e: any) {
            logger('onKeyDown StyledItem')
          },
        })}
      >
        <StyledTagColorDot fillColor={theme(`color.tags.${tag.color}`)} />
        <StyledTagListItemTitle current={isInTags}>{tag.name}</StyledTagListItemTitle>
        {activeIndex == i && !isEditingOtherTag && (
          <StyledEditTag id='editButton' ref={editButtonRef}>
            <Icon name='Edit' />
          </StyledEditTag>
        )}
        {(activeIndex != i || isEditingOtherTag) && (
          <StyledTagListItemIsAdded current={!isEditingOtherTag && isInTags} />
        )}
      </StyledItem>
    </>
  )
}

export { ListItemTag }
