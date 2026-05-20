import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function GET(
  req: NextRequest,
  { params }: { params: { paperId: string } }
) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify JWT
    const secret = process.env.JWT_SECRET || 'dev-secret'
    let user: any
    try {
      user = jwt.verify(token, secret)
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { paperId } = params

    // TODO: After Supabase connected — verify purchase & expiry:
    /*
    const { createServerClient } = await import('@/lib/supabase')
    const supabase = createServerClient()
    const { data: purchase } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', user.id)
      .eq('paper_id', paperId)
      .gte('expiry_date', new Date().toISOString())
      .single()

    if (!purchase) return NextResponse.json({ error: 'Not purchased or expired' }, { status: 403 })
    */

    // Generate a short-lived signed download token (15 min expiry)
    const downloadToken = jwt.sign(
      { userId: user.id || 'demo', paperId, exp: Math.floor(Date.now() / 1000) + 900 },
      secret
    )

    // TODO: After R2/S3 connected — generate signed URL:
    /*
    const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3')
    const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
    const s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    })
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: `papers/${paperId}/original.pdf`,
    })
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 900 })
    return NextResponse.json({ url: signedUrl, token: downloadToken })
    */

    // Placeholder until R2 is connected
    return NextResponse.json({
      url: `/api/download/stream/${paperId}?token=${downloadToken}`,
      token: downloadToken,
      message: 'Connect Cloudflare R2 to enable real downloads',
    })
  } catch (err: any) {
    console.error('Download error:', err)
    return NextResponse.json({ error: 'Download failed' }, { status: 500 })
  }
}
