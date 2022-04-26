import React, { useState, useEffect, useRef, forwardRef } from 'react'
import styled, { keyframes, css, createGlobalStyle } from 'styled-components'
import { Entry } from './'
import { useEventEditorSelectors } from '@udecode/plate'
import { arrayEquals } from 'utils'
import { useEntriesContext } from 'context'
import dayjs from 'dayjs'
import { theme } from 'themes'

const BeforeEntries = styled.div`
  text-align: center;
  padding: 64px 0;
`

const PostEntries = styled.div`
  min-height: 80vh;
`

const Wrapper = styled.div`
  width: 100vw;
  margin-left: ${theme('appearance.entriesOffset')};
  transition: margin-left ${theme('animation.time.normal')};
  display: flex;
  flex-flow: column;
  flex-direction: column-reverse;
`

// const Styles = createGlobalStyle`
//   @keyframes buttonShow {
//     0% {

//     }
//     100% {
//       margin-bottom: 0;
//     }
//   };

//   @keyframes buttonHide {
//     0% {

//     }
//     100% {
//       margin-bottom: -32px;
//     }
//   }
// `

var visibleSections: String[] = []
var rangeMarker: any
var calendarContainer: any
var scrollToToday: any
var rangeMarkerTop: number

const renderScrollToToday = () => {
  if (!scrollToToday) {
    scrollToToday = document.getElementById('ScrollToToday')
  }
  let today = dayjs().format('YYYYMMDD')
  if (visibleSections.some((day) => day == today)) {
    scrollToToday.style.marginBottom = '-32px'
    // scrollToToday.style.animationName = 'buttonHide'
  } else {
    scrollToToday.style.marginBottom = 0
    // scrollToToday.style.animationName = 'buttonShow'
  }
}

const renderMarker = () => {
  visibleSections.sort()

  if (!rangeMarker) {
    rangeMarker = document.getElementById('RangeVisible')
  }

  visibleSections.forEach((date: string, i) => {
    let elem = document.getElementById(`${date}-calendar`)
    if (elem) {
      const top = elem.offsetTop

      if (i == 0) {
        rangeMarkerTop = top
        rangeMarker.style.top = rangeMarkerTop - 2 + 'px'
      }

      if (i == visibleSections.length - 1) {
        let height = top - rangeMarkerTop + elem.offsetHeight + 4 + 'px'
        rangeMarker.style.height = height
      }
    }
  })
}

const onIntersection = (entries: any) => {
  entries.forEach((entry: any) => {
    let date = entry.target.id.slice(0, 8)
    if (entry.isIntersecting) {
      // Add to array
      visibleSections.push(date)
    } else {
      // Remove from array
      visibleSections = visibleSections.filter((v) => {
        return v != date
      })
    }
    renderMarker()
    renderScrollToToday()
  })

  if (!calendarContainer) {
    calendarContainer = document.getElementById('CalendarContainer')
  }

  calendarContainer.scrollTo({
    top: rangeMarkerTop - 48,
    behavior: 'smooth',
  })
}

const entriesObserver = new IntersectionObserver(onIntersection, {
  rootMargin: '-100px',
})

type myref = {
  [id: string]: number
}

function EntryList() {
  const [entries, setEntries] = useState([])
  const [initialFetchDone, setInitialFetchDone] = useState(false)
  const { initialCache, daysCache, setCachedDays } = useEntriesContext()
  const entriesHeight: myref = {}
  const itemsRef = useRef<Array<HTMLDivElement | null>>([])
  var element: HTMLElement | null

  interface EntriesState {
    date: number
    _id: string
    loadedFromServer: boolean
    loadedFromServerAt: Date // maybe?
    saveToServerError: boolean
    saveToServerErrorAt: Date //  maybe?
    modifiedAt: Date // server time
  }

  const focusedEditorId = '' //useEventEditorSelectors.focus?.()
  // const blurEditorId = useEventEditorSelectors.blur?.()

  useEffect(() => {
    initialFetch()
  }, [])

  useEffect(() => {
    // console.log(entries)
    console.log('Entries updated')
  }, [entries])

  const areDaysEqual = (local: any, server: any) => {
    if (!Array.isArray(local)) {
      return false
    }
    if (!Array.isArray(server)) {
      return false
    }
    if (local.length != server.length) {
      return false
    }

    for (let i = 0; i < local.length; i++) {
      if (arrayEquals(local[i], server[i]) == false) return false
    }
    return true
  }

  const setEntryHeight = (id: string, height: number) => {
    if (element) {
      element.scrollIntoView({ inline: 'center' })
      // element.scrollTop = 0
    } else {
      let today = dayjs().format('YYYYMMDD')
      element = document.getElementById(`${today}-entry`)
    }

    // if (id == '6226752be089a49a5c4ddd78') {
    //   entriesHeight[id] = 0
    // } else {
    //   entriesHeight[id] = height
    // }

    // let sum = Object.values(entriesHeight).reduce((a, b) => a + b)

    // window.scrollTo(0, sum + 156)
  }

  const initialFetch = async () => {
    console.log('initialFetch indexes')

    const cached = daysCache.current
    if (cached) {
      setEntries([...cached])
      setInitialFetchDone(true)
    }

    try {
      let headers = {
        'Content-Type': 'application/json',
      }
      const res = await fetch('https://www.journal.local/api/1/days', {
        headers,
        method: 'GET',
      })
      if (res.status == 200) {
        let days = await res.json()
        // Add Today to server Days
        let today = dayjs().format('YYYYMMDD')
        let todayExists = days.some((el: any) => {
          return el == today
        })
        if (!todayExists) {
          days.push(today)
          console.log(`Added ${today} to server Days`)
        }
        if (!areDaysEqual(cached, days)) {
          setCachedDays(days)
          setEntries([...days])
        }
        setInitialFetchDone(true)
      } else {
        throw new Error()
      }
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <Wrapper>
      <PostEntries></PostEntries>
      {initialFetchDone &&
        entries
          .slice(0)
          .reverse()
          .map((entry, i) => (
            <Entry
              key={entry}
              entryDay={entry}
              entriesObserver={entriesObserver}
              entryDayCount={entries.length - i}
              cached={initialCache.current[entry]}
              isFadedOut={false} //{focusedEditorId != `${entry}-editor` && focusedEditorId != null}
              setEntryHeight={setEntryHeight}
            />
          ))}
      <BeforeEntries>This is the beginning...</BeforeEntries>
    </Wrapper>
  )
}

export { EntryList }
