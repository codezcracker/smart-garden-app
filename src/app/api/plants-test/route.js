import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return a few sample plants for testing
    const samplePlants = [
      {
        id: "1",
        name: "Tomato",
        emoji: "🍅",
        category: "Vegetable",
        family: "Solanaceae",
        climate: "Temperate",
        difficulty: "Easy",
        growthTime: "60-80 days"
      },
      {
        id: "2",
        name: "Basil",
        emoji: "🌿",
        category: "Herb",
        family: "Lamiaceae",
        climate: "Warm",
        difficulty: "Easy",
        growthTime: "30-60 days"
      },
      {
        id: "3",
        name: "Lettuce",
        emoji: "🥬",
        category: "Leafy Green",
        family: "Asteraceae",
        climate: "Cool",
        difficulty: "Easy",
        growthTime: "45-60 days"
      },
      {
        id: "4",
        name: "Carrot",
        emoji: "🥕",
        category: "Root Vegetable",
        family: "Apiaceae",
        climate: "Cool",
        difficulty: "Medium",
        growthTime: "70-80 days"
      },
      {
        id: "5",
        name: "Strawberry",
        emoji: "🍓",
        category: "Fruit",
        family: "Rosaceae",
        climate: "Temperate",
        difficulty: "Medium",
        growthTime: "60-90 days"
      }
    ];

    return NextResponse.json({
      success: true,
      plants: samplePlants,
      total: samplePlants.length,
      page: 1,
      limit: 5,
      totalPages: 1,
      families: ["all", "Solanaceae", "Lamiaceae", "Asteraceae", "Apiaceae", "Rosaceae"],
      source: "Test Data (5 plants)"
    });
    
  } catch (error) {
    console.error('Error in test API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to return test data',
        message: error.message 
      },
      { status: 500 }
    );
  }
} 