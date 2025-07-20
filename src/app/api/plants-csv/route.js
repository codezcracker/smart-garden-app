import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    // Read the CSV file from the data directory
    const csvPath = join(process.cwd(), 'src', 'data', 'classification-sample.csv')
    const csvContent = readFileSync(csvPath, 'utf-8')
    
    // Return the CSV content as text
    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    })
  } catch (error) {
    console.error('Error reading CSV file:', error)
    return new Response('Error loading plant data', { status: 500 })
  }
} 