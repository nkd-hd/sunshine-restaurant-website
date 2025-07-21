"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "../../../convex/_generated/api";
import MainLayout from "~/components/layout/main-layout";
import { Search, ChefHat, ShoppingCart, Truck, Clock, Users, Gift, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { GlassMealCard } from "~/components/ui/glass-meal-card"
import { MealCardSkeletonGrid } from "~/components/ui/meal-card-skeleton"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { toast } from "sonner"
import { memoryOptimization } from "~/lib/performance"

type OrderType = "delivery" | "pickup" | "dine-in" | "catering"

export default function MenuPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedOrderType, setSelectedOrderType] = useState<OrderType>("delivery");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { data: session } = useSession();

  // Debounced search to reduce API calls
  const debouncedSearch = useMemo(
    () => memoryOptimization.debounce((term: string) => {
      setDebouncedSearchTerm(term);
    }, 300),
    []
  );

  // Trigger debounced search when searchTerm changes
  useMemo(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  // Optimized query with pagination and search
  const mealsQuery = useQuery(
    api.meals.getAllMeals, 
    {
      isAvailable: "AVAILABLE",
      limit: 24, // Load 24 items per page
      searchTerm: debouncedSearchTerm || undefined,
    }
  );

  // Memoize filtered meals to avoid recalculation
  const displayedMeals = useMemo(() => {
    if (!mealsQuery?.meals) return [];
    return mealsQuery.meals;
  }, [mealsQuery?.meals]);

  // Optimized add to cart handler
  const handleAddToCart = useCallback((mealId: string) => {
    // TODO: Implement actual add to cart functionality with Convex mutation
    toast.success("Added to cart!", {
      description: "Item has been added to your cart.",
      duration: 2000,
    });
  }, []);

  // Handle loading more meals
  const handleLoadMore = useCallback(async () => {
    if (!mealsQuery?.hasMore || isLoadingMore) return;
    
    setIsLoadingMore(true);
    // TODO: Implement load more with cursor pagination
    setTimeout(() => setIsLoadingMore(false), 1000);
  }, [mealsQuery?.hasMore, isLoadingMore]);

  // Memoize order type buttons to avoid re-renders
  const orderTypeButtons = useMemo(() => [
    {
      type: "delivery" as OrderType,
      icon: Truck,
      title: "Delivery",
      description: "Fast delivery to your door",
      features: ["• Free delivery", "• 30-45 min"]
    },
    {
      type: "pickup" as OrderType,
      icon: Clock,
      title: "Pickup",
      description: "Collect from our restaurant",
      features: ["• Ready in 15-20 min", "• No delivery fee"]
    },
    {
      type: "dine-in" as OrderType,
      icon: Users,
      title: "Dine-in",
      description: "Enjoy at our restaurant",
      features: ["• Full table service", "• Great atmosphere"]
    },
    {
      type: "catering" as OrderType,
      icon: Gift,
      title: "Catering",
      description: "Large orders for events",
      features: ["• Min. 10 people", "• Advance booking"]
    }
  ], []);

  return (
    <MainLayout>
      <div className="min-h-screen">
        {/* Hero Section with Green Background */}
        <section className="relative bg-gradient-to-br from-leafy-green to-leafy-green/80 text-white">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
            <div className="text-center space-y-6 lg:space-y-8">
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight">
                  Our Menu
                  <span className="block text-yellow-300">Authentic West African Flavors</span>
                </h1>
                <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
                  Discover our carefully crafted dishes made from fresh local ingredients, 
                  bringing you the finest taste of West African cuisine.
                </p>
              </div>

              {/* Order Type Selection */}
              <div className="pt-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-4">How would you like your order?</h2>
                  <p className="text-white/80">Choose your preferred way to enjoy our delicious meals</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                  {/* Delivery */}
                  <button
                    onClick={() => setSelectedOrderType("delivery")}
                    className={`bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:bg-white/20 ${
                      selectedOrderType === "delivery" 
                        ? "ring-2 ring-yellow-300 bg-white/20" 
                        : ""
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      selectedOrderType === "delivery" ? "bg-yellow-300 text-leafy-green" : "bg-white/20 text-white"
                    }`}>
                      <Truck className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-white mb-2">Delivery</h3>
                    <p className="text-sm text-white/80 mb-3">Fast delivery to your door</p>
                    <div className="text-xs text-white/70">
                      <div>• Free delivery</div>
                      <div>• 30-45 min</div>
                    </div>
                  </button>

                  {/* Pickup */}
                  <button
                    onClick={() => setSelectedOrderType("pickup")}
                    className={`bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:bg-white/20 ${
                      selectedOrderType === "pickup" 
                        ? "ring-2 ring-yellow-300 bg-white/20" 
                        : ""
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      selectedOrderType === "pickup" ? "bg-yellow-300 text-leafy-green" : "bg-white/20 text-white"
                    }`}>
                      <Clock className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-white mb-2">Pickup</h3>
                    <p className="text-sm text-white/80 mb-3">Collect from our restaurant</p>
                    <div className="text-xs text-white/70">
                      <div>• Ready in 15-20 min</div>
                      <div>• No delivery fee</div>
                    </div>
                  </button>

                  {/* Dine-in */}
                  <button
                    onClick={() => setSelectedOrderType("dine-in")}
                    className={`bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:bg-white/20 ${
                      selectedOrderType === "dine-in" 
                        ? "ring-2 ring-yellow-300 bg-white/20" 
                        : ""
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      selectedOrderType === "dine-in" ? "bg-yellow-300 text-leafy-green" : "bg-white/20 text-white"
                    }`}>
                      <Users className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-white mb-2">Dine-in</h3>
                    <p className="text-sm text-white/80 mb-3">Enjoy at our restaurant</p>
                    <div className="text-xs text-white/70">
                      <div>• Full table service</div>
                      <div>• Great atmosphere</div>
                    </div>
                  </button>

                  {/* Catering */}
                  <button
                    onClick={() => setSelectedOrderType("catering")}
                    className={`bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:bg-white/20 ${
                      selectedOrderType === "catering" 
                        ? "ring-2 ring-yellow-300 bg-white/20" 
                        : ""
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      selectedOrderType === "catering" ? "bg-yellow-300 text-leafy-green" : "bg-white/20 text-white"
                    }`}>
                      <Gift className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-white mb-2">Catering</h3>
                    <p className="text-sm text-white/80 mb-3">Large orders for events</p>
                    <div className="text-xs text-white/70">
                      <div>• Min. 10 people</div>
                      <div>• Advance booking</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Menu Content Section - On wooden background */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Search Bar - Always show for better UX */}
            <div className="mb-12 max-w-md mx-auto">
              <div className="glass-card p-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-leafy-green-900/60" />
                  <Input
                    type="text"
                    placeholder="Search dishes…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/80 border-0 rounded-lg text-wooden-brown placeholder-leafy-green-900/60 focus:ring-2 focus:ring-leafy-green-900/50 transition-all"
                  />
                  {debouncedSearchTerm && debouncedSearchTerm !== searchTerm && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-leafy-green-900/60" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Debug info - remove in production */}
            {process.env.NODE_ENV === 'development' && mealsQuery && (
              <div className="mb-4 text-center">
                <div className="text-wooden-brown/60 text-sm">
                  Meals: {mealsQuery === undefined ? 'Loading...' : `${displayedMeals.length} loaded`}
                  {mealsQuery.hasMore && ' | More available'}
                  {debouncedSearchTerm && ` | Search: "${debouncedSearchTerm}"`}
                </div>
              </div>
            )}

            {/* Menu Cards Grid */}
            {mealsQuery === undefined ? (
              <div className="flex justify-center items-center py-20">
                <div className="glass-card p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-wooden-brown mx-auto mb-4" />
                  <div className="text-wooden-brown/60">Loading delicious dishes...</div>
                </div>
              </div>
            ) : displayedMeals && displayedMeals.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 justify-items-center px-2 sm:px-0">
                  {displayedMeals.map((meal) => (
                    <GlassMealCard
                      key={meal._id}
                      meal={meal}
                      onAddToCart={handleAddToCart}
                      className="w-full max-w-sm"
                    />
                  ))}
                </div>
                
                {/* Load More Button */}
                {mealsQuery.hasMore && (
                  <div className="mt-12 text-center">
                    <Button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="bg-leafy-green-900 hover:bg-leafy-green-800 text-white px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Loading More...
                        </>
                      ) : (
                        'Load More Dishes'
                      )}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <div className="glass-card p-12 mx-auto max-w-md">
                  <div className="w-24 h-24 bg-wooden-brown/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ChefHat className="w-12 h-12 text-wooden-brown/60" />
                  </div>
                  <h3 className="text-xl font-bold text-wooden-brown mb-4">
                    {debouncedSearchTerm ? "No dishes found" : "No dishes available"}
                  </h3>
                  <p className="text-wooden-brown/80 mb-6">
                    {debouncedSearchTerm 
                      ? `No results for "${debouncedSearchTerm}". Try different keywords.`
                      : "Check back soon for delicious West African dishes!"
                    }
                  </p>
                  {debouncedSearchTerm && (
                    <Button
                      onClick={() => {
                        setSearchTerm("");
                        setDebouncedSearchTerm("");
                      }}
                      className="bg-leafy-green-900 text-white px-6 py-2 rounded hover:border hover:border-golden-yellow transition-all"
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
