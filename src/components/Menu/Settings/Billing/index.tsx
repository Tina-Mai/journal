import React, { useState, useEffect, useRef } from 'react'
import { theme } from 'themes'
import { logger, supabase, stripeEpochToDate, isDev } from 'utils'
import { SectionTitleStyled } from '../styled'
import { useQuery } from '@tanstack/react-query'
import { useUserContext } from 'context'
import { getCustomer } from '../../../../context/UserContext/subscriptions'
import type { PaymentMethodProps } from './types'
import { PaymentMethod } from './PaymentMethod'
import { Receipts } from './Receipts'
import { Plan } from './Plan'
import { Balance } from './Balance'
import { Divider } from './styled'

const BillingTabContent = () => {
  logger('BillingTabContent re-render')
  const { session, subscription } = useUserContext()
  const {
    isLoading,
    isError,
    data: billingInfo,
  } = useQuery({
    queryKey: ['billingInfo'],
    queryFn: async () => getCustomer(session.access_token),
  })

  useEffect(() => {
    logger(billingInfo)
  }, [billingInfo])

  return (
    <>
      <SectionTitleStyled>Billing</SectionTitleStyled>
      <Balance billingInfo={billingInfo} isLoading={isLoading} />
      <Divider />
      <Plan subscription={subscription.current} />
      <Divider />
      <PaymentMethod billingInfo={billingInfo} isLoading={isLoading} />
      <Divider />
      <Receipts billingInfo={billingInfo} isLoading={isLoading} />
    </>
  )
}

export { BillingTabContent }
