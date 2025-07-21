import { internalMutation } from "./_generated/server";

export const seedData = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Clear existing data
    const existingCategories = await ctx.db.query("mealCategories").collect();
    const existingMeals = await ctx.db.query("meals").collect();
    
    // Delete existing meals first (due to foreign key constraints)
    for (const meal of existingMeals) {
      await ctx.db.delete(meal._id);
    }
    
    // Delete existing categories
    for (const category of existingCategories) {
      await ctx.db.delete(category._id);
    }

    // Create meal categories
    const appetizersId = await ctx.db.insert("mealCategories", {
      name: "Appetizers",
      description: "Start your meal with our delicious appetizers",
      displayOrder: 1,
      isActive: "ACTIVE",
    });

    const mainCoursesId = await ctx.db.insert("mealCategories", {
      name: "Main Courses",
      description: "Hearty main dishes to satisfy your appetite",
      displayOrder: 2,
      isActive: "ACTIVE",
    });

    const dessertsId = await ctx.db.insert("mealCategories", {
      name: "Desserts",
      description: "Sweet treats to end your meal perfectly",
      displayOrder: 3,
      isActive: "ACTIVE",
    });

    const beveragesId = await ctx.db.insert("mealCategories", {
      name: "Beverages",
      description: "Refreshing drinks and beverages",
      displayOrder: 4,
      isActive: "ACTIVE",
    });

    // Create sample meals for Appetizers
    await ctx.db.insert("meals", {
      name: "Plantain Chips with Spicy Pepper Sauce",
      description: "Crispy fried plantain chips served with our signature spicy pepper sauce",
      ingredients: "Green plantains, vegetable oil, scotch bonnet peppers, tomatoes, onions, garlic",
      price: 1500,
      categoryId: appetizersId,
      imageUrl: "/images/meals/plantain-chips.jpg",
      portionSize: "Medium bowl",
      preparationTime: 15,
      calories: 280,
      isVegetarian: "YES",
      isVegan: "YES",
      isHalal: "YES",
      isGlutenFree: "YES",
      isDairyFree: "YES",
      isNutFree: "YES",
      isAvailable: "AVAILABLE",
      isFeatured: "YES",
      stockQuantity: 50,
      minimumOrderQuantity: 1,
      maximumOrderQuantity: 5,
      displayOrder: 1,
    });

    await ctx.db.insert("meals", {
      name: "Grilled Fish Spring Rolls",
      description: "Fresh spring rolls filled with grilled tilapia, vegetables, and herbs",
      ingredients: "Rice paper, tilapia fish, lettuce, cucumber, carrots, mint, cilantro",
      price: 2500,
      categoryId: appetizersId,
      imageUrl: "/images/meals/fish-spring-rolls.jpg",
      portionSize: "4 pieces",
      preparationTime: 20,
      calories: 320,
      isVegetarian: "NO",
      isVegan: "NO",
      isHalal: "YES",
      isGlutenFree: "YES",
      isDairyFree: "YES",
      isNutFree: "YES",
      isAvailable: "AVAILABLE",
      isFeatured: "NO",
      stockQuantity: 30,
      minimumOrderQuantity: 1,
      maximumOrderQuantity: 3,
      displayOrder: 2,
    });

    // Create sample meals for Main Courses
    await ctx.db.insert("meals", {
      name: "Jollof Rice with Grilled Chicken",
      description: "Traditional West African jollof rice served with perfectly grilled chicken",
      ingredients: "Basmati rice, tomatoes, onions, chicken, bell peppers, spices, stock",
      price: 4500,
      categoryId: mainCoursesId,
      imageUrl: "/images/meals/jollof-rice-chicken.jpg",
      portionSize: "Large plate",
      preparationTime: 35,
      calories: 650,
      isVegetarian: "NO",
      isVegan: "NO",
      isHalal: "YES",
      isGlutenFree: "YES",
      isDairyFree: "YES",
      isNutFree: "YES",
      isAvailable: "AVAILABLE",
      isFeatured: "YES",
      stockQuantity: 25,
      minimumOrderQuantity: 1,
      maximumOrderQuantity: 3,
      displayOrder: 1,
    });

    await ctx.db.insert("meals", {
      name: "Ndole (Peanut Spinach Stew)",
      description: "Traditional Cameroonian stew with peanuts, spinach, and meat",
      ingredients: "Ndole leaves, groundnuts, beef, dried fish, crayfish, palm oil",
      price: 5000,
      categoryId: mainCoursesId,
      imageUrl: "/images/meals/ndole.jpg",
      portionSize: "Large bowl with rice",
      preparationTime: 45,
      calories: 720,
      isVegetarian: "NO",
      isVegan: "NO",
      isHalal: "NO", // Contains non-halal meat typically
      isGlutenFree: "YES",
      isDairyFree: "YES",
      isNutFree: "NO", // Contains peanuts
      allergens: ["peanuts"],
      isAvailable: "AVAILABLE",
      isFeatured: "YES",
      stockQuantity: 20,
      minimumOrderQuantity: 1,
      maximumOrderQuantity: 2,
      displayOrder: 2,
    });

    await ctx.db.insert("meals", {
      name: "Grilled Fish with Attieke",
      description: "Fresh grilled tilapia served with traditional cassava couscous",
      ingredients: "Tilapia fish, attieke (cassava couscous), tomatoes, onions, spices",
      price: 4000,
      categoryId: mainCoursesId,
      imageUrl: "/images/meals/fish-attieke.jpg",
      portionSize: "Large plate",
      preparationTime: 30,
      calories: 580,
      isVegetarian: "NO",
      isVegan: "NO",
      isHalal: "YES",
      isGlutenFree: "YES",
      isDairyFree: "YES",
      isNutFree: "YES",
      isAvailable: "AVAILABLE",
      isFeatured: "NO",
      stockQuantity: 18,
      minimumOrderQuantity: 1,
      maximumOrderQuantity: 2,
      displayOrder: 3,
    });

    // Create sample meals for Desserts
    await ctx.db.insert("meals", {
      name: "Coconut Rice Pudding",
      description: "Creamy rice pudding made with coconut milk and local spices",
      ingredients: "Rice, coconut milk, sugar, cinnamon, nutmeg, vanilla",
      price: 2000,
      categoryId: dessertsId,
      imageUrl: "/images/meals/coconut-rice-pudding.jpg",
      portionSize: "Medium bowl",
      preparationTime: 25,
      calories: 380,
      isVegetarian: "YES",
      isVegan: "YES",
      isHalal: "YES",
      isGlutenFree: "YES",
      isDairyFree: "YES",
      isNutFree: "YES",
      isAvailable: "AVAILABLE",
      isFeatured: "NO",
      stockQuantity: 15,
      minimumOrderQuantity: 1,
      maximumOrderQuantity: 4,
      displayOrder: 1,
    });

    // Create sample meals for Beverages
    await ctx.db.insert("meals", {
      name: "Fresh Ginger Beer",
      description: "Refreshing homemade ginger beer with natural spices",
      ingredients: "Fresh ginger, lime, sugar, sparkling water, natural spices",
      price: 1000,
      categoryId: beveragesId,
      imageUrl: "/images/meals/ginger-beer.jpg",
      portionSize: "500ml bottle",
      preparationTime: 5,
      calories: 120,
      isVegetarian: "YES",
      isVegan: "YES",
      isHalal: "YES",
      isGlutenFree: "YES",
      isDairyFree: "YES",
      isNutFree: "YES",
      isAvailable: "AVAILABLE",
      isFeatured: "NO",
      stockQuantity: 40,
      minimumOrderQuantity: 1,
      maximumOrderQuantity: 6,
      displayOrder: 1,
    });

    await ctx.db.insert("meals", {
      name: "Bissap (Hibiscus Tea)",
      description: "Traditional West African hibiscus flower drink, served cold",
      ingredients: "Dried hibiscus flowers, ginger, mint, sugar, lemon",
      price: 800,
      categoryId: beveragesId,
      imageUrl: "/images/meals/bissap.jpg",
      portionSize: "400ml glass",
      preparationTime: 5,
      calories: 90,
      isVegetarian: "YES",
      isVegan: "YES",
      isHalal: "YES",
      isGlutenFree: "YES",
      isDairyFree: "YES",
      isNutFree: "YES",
      isAvailable: "AVAILABLE",
      isFeatured: "YES",
      stockQuantity: 35,
      minimumOrderQuantity: 1,
      maximumOrderQuantity: 6,
      displayOrder: 2,
    });

    // Create restaurant configuration
    await ctx.db.insert("restaurantConfig", {
      name: "Sunshine Restaurant",
      description: "Authentic West African cuisine with a modern twist",
      phone: "+237 123 456 789",
      email: "info@sunshinerestaurant.cm",
      address: "123 Ahmadou Ahidjo Blvd, Centre Ville, Yaoundé, Cameroon",
      deliveryFee: 1000,
      minimumOrderAmount: 3000,
      estimatedDeliveryTime: 45,
      maxDeliveryDistance: 15,
      operatingHours: {
        monday: { open: "10:00", close: "22:00" },
        tuesday: { open: "10:00", close: "22:00" },
        wednesday: { open: "10:00", close: "22:00" },
        thursday: { open: "10:00", close: "22:00" },
        friday: { open: "10:00", close: "23:00" },
        saturday: { open: "09:00", close: "23:00" },
        sunday: { open: "11:00", close: "21:00" },
      },
      isOpen: "OPEN",
      socialMedia: {
        facebook: "https://facebook.com/sunshinerestaurant",
        instagram: "https://instagram.com/sunshinerestaurant",
        twitter: "https://twitter.com/sunshinerest",
      },
      aboutUs: "Sunshine Restaurant brings you the authentic flavors of West Africa with a modern touch. We pride ourselves on using fresh, local ingredients to create memorable dining experiences.",
    });

    // Create delivery zones for Yaoundé
    const zones = [
      { name: "Centre Ville", description: "City center and surrounding areas", fee: 1000, time: 30 },
      { name: "Bastos", description: "Bastos diplomatic quarter", fee: 1500, time: 35 },
      { name: "Mvan", description: "Mvan residential area", fee: 1200, time: 40 },
      { name: "Ngousso", description: "Ngousso neighborhood", fee: 1800, time: 45 },
      { name: "Emombo", description: "Emombo district", fee: 2000, time: 50 },
    ];

    for (const zone of zones) {
      await ctx.db.insert("deliveryZones", {
        name: zone.name,
        description: zone.description,
        deliveryFee: zone.fee,
        estimatedDeliveryTime: zone.time,
        isActive: "ACTIVE",
      });
    }

    console.log("✅ Seed data inserted successfully!");
    return { success: true, message: "Seed data inserted successfully" };
  },
});
