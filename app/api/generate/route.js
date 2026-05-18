import { NextResponse } from 'next/server'
export async function POST(request) {
  try {
    const body = await request.json()
    const { original_message, tone, context, recipient, userId } = body
    if (!original_message) return NextResponse.json({ error: 'Original message is required' }, { status: 400 })
    const aiRes = await fetch(`${process.env.AI_API_URL}/api/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.AI_API_KEY}` },
      body: JSON.stringify({ task: 'rewrite_message', inputs: { original_message, tone: tone||'Professional', context: context||'Email', recipient: recipient||'the recipient' } })
    })
    const aiData = await aiRes.json()
    if (!aiRes.ok) throw new Error(aiData.error || 'AI failed')
    const result = aiData.data
    let itemId = null
    if (userId && process.env.DB_API_URL) {
      try {
        const dbRes = await fetch(`${process.env.DB_API_URL}/db/zenvoy/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.DB_API_KEY_ZENVOY}` },
          body: JSON.stringify({ user_id: userId, title: `${tone} ${context} rewrite`, original_message, tone, result_data: result, status: 'complete' })
        })
        const dbData = await dbRes.json()
        itemId = dbData.data?.id || null
      } catch(e) {}
    }
    return NextResponse.json({ itemId, result })
  } catch(err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
