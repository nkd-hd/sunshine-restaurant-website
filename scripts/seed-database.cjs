const mysql = require('mysql2/promise');

const sampleEvents = [
  {
    id: 'evt-001',
    name: 'Cameroon Music Festival 2024',
    description: 'Join us for the biggest music festival in Cameroon featuring local and international artists. Experience the best of Afrobeats, Makossa, and contemporary music.',
    date: '2024-07-15',
    time: '18:00:00',
    venue: 'Palais des Sports de Yaoundé',
    location: 'Yaoundé',
    organizer: 'Cameroon Events Ltd',
    organizerContact: '+237 677 123 456',
    price: '15000.00',
    availableTickets: 500,
    totalTickets: 500,
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    status: 'ACTIVE'
  },
  {
    id: 'evt-002',
    name: 'Tech Innovation Summit Douala',
    description: 'Discover the latest in technology and innovation in Central Africa. Network with entrepreneurs, developers, and tech enthusiasts.',
    date: '2024-06-20',
    time: '09:00:00',
    venue: 'Douala Conference Center',
    location: 'Douala',
    organizer: 'TechHub Cameroon',
    organizerContact: '+237 699 987 654',
    price: '25000.00',
    availableTickets: 200,
    totalTickets: 200,
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    status: 'ACTIVE'
  },
  {
    id: 'evt-003',
    name: 'Cultural Heritage Exhibition',
    description: 'Explore the rich cultural heritage of Cameroon through art, crafts, and traditional performances.',
    date: '2024-08-10',
    time: '10:00:00',
    venue: 'National Museum',
    location: 'Yaoundé',
    organizer: 'Ministry of Culture',
    organizerContact: '+237 655 111 222',
    price: '5000.00',
    availableTickets: 300,
    totalTickets: 300,
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
    status: 'ACTIVE'
  },
  {
    id: 'evt-004',
    name: 'Business Networking Gala',
    description: 'Connect with business leaders and entrepreneurs across Cameroon. Includes dinner and networking sessions.',
    date: '2024-09-05',
    time: '19:00:00',
    venue: 'Hilton Yaoundé',
    location: 'Yaoundé',
    organizer: 'Business Network Cameroon',
    organizerContact: '+237 677 333 444',
    price: '50000.00',
    availableTickets: 150,
    totalTickets: 150,
    imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
    status: 'ACTIVE'
  },
  {
    id: 'evt-005',
    name: 'Youth Sports Championship',
    description: 'Annual youth sports championship featuring football, basketball, and athletics competitions.',
    date: '2024-07-01',
    time: '08:00:00',
    venue: 'Omnisport Stadium',
    location: 'Douala',
    organizer: 'Cameroon Youth Sports',
    organizerContact: '+237 699 555 666',
    price: '2000.00',
    availableTickets: 1000,
    totalTickets: 1000,
    imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
    status: 'ACTIVE'
  },
  {
    id: 'evt-006',
    name: 'Food & Wine Festival',
    description: 'Taste the best of Cameroon cuisine and international wines. Cooking demonstrations and tastings included.',
    date: '2024-08-25',
    time: '16:00:00',
    venue: 'Bonanjo Convention Center',
    location: 'Douala',
    organizer: 'Culinary Arts Cameroon',
    organizerContact: '+237 655 777 888',
    price: '20000.00',
    availableTickets: 250,
    totalTickets: 250,
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    status: 'ACTIVE'
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to MySQL using DATABASE_URL
    const connection = await mysql.createConnection(
      process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/event_booking_db'
    );

    console.log('✅ Connected to MySQL database');

    // Clear existing events
    await connection.query('DELETE FROM `event-booking-system_event`');
    console.log('🗑️  Cleared existing events');

    // Insert sample events
    for (const event of sampleEvents) {
      const insertQuery = `
        INSERT INTO \`event-booking-system_event\` 
        (id, name, description, date, time, venue, location, organizer, organizerContact, price, availableTickets, totalTickets, imageUrl, status, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      
      await connection.query(insertQuery, [
        event.id,
        event.name,
        event.description,
        event.date,
        event.time,
        event.venue,
        event.location,
        event.organizer,
        event.organizerContact,
        event.price,
        event.availableTickets,
        event.totalTickets,
        event.imageUrl,
        event.status
      ]);
      
      console.log(`✅ Added event: ${event.name}`);
    }

    await connection.end();
    console.log(`\n🎉 Successfully seeded ${sampleEvents.length} events!`);
    console.log('📊 Database is ready for use');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase()
  .then(() => {
    console.log('✨ Seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });
