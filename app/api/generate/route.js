import { NextResponse } from 'next/server'

const AI_API_URL = process.env.AI_API_URL
const AI_API_KEY = process.env.AI_API_KEY
const DB_API_URL = process.env.DB_API_URL
const DB_API_KEY = process.env.DB_API_KEY_ZENVOY

export async function POST(request) {
  try {
    const body = await request.json()
    const { userId, original_message, tone, context, recipient } = body

    // Call AI API

    // Check usage limits
    if (userId) {
      const usageRes = await fetch(`${process.env.DB_API_URL}/usage/check?user_id=${userId}&product=zenvoy`, {
        headers: { 'Authorization': `Bearer ${process.env.DB_API_KEY_ZENVOY}` }
      })
      const usage = await usageRes.json()
      if (!usage.allowed) {
        return NextResponse.json({
          error: 'limit_reached',
          message: `You've used all ${usage.limit} free generations this month. Upgrade to continue.`,
          used: usage.used,
          limit: usage.limit,
          upgrade_url: '/billing'
        }, { status: 402 })
      }
    }

    const aiRes = await fetch(`${AI_API_URL}/api/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${AI_API_KEY}` },
      body: JSON.stringify({ task: 'rewrite_message', inputs: { original_message, tone: tone||'Professional', context: context||'Email', recipient: recipient||'the recipient' } })
    })
    const aiData = await aiRes.json()
    if (!aiRes.ok) throw new Error(aiData.error || 'AI generation failed')

    const result = aiData.data

    // Track usage
    if (userId) {
      fetch(`${process.env.DB_API_URL}/usage/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.DB_API_KEY_ZENVOY}` },
        body: JSON.stringify({ user_id: userId, product: 'zenvoy', action: 'generate' })
      }).catch(() => {})
    }


    // Save to DB
    let itemId = null
    if (userId && DB_API_URL) {
      try {
        const dbRes = await fetch(`${DB_API_URL}/db/zenvoy/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DB_API_KEY}` },
          body: JSON.stringify({ user_id: userId, title: `${tone} rewrite`, original_message: original_message, tone, result_data: result, status: 'complete' })
        })
        const dbData = await dbRes.json()
        itemId = dbData.data?.id || null
      } catch(e) { console.error('DB save failed:', e.message) }
    }

    return NextResponse.json({ itemId, result })
  } catch(err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
// Mon May 18 09:39:37 PM UTC 2026
