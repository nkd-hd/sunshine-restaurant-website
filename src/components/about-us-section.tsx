"use client"

import { MapPin, Phone, Mail, Clock, Users, Award, Heart, Truck, Shield, Star, Utensils } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

export function AboutUsSection() {
  return (
    <section id="about" className="py-16 lg:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-wooden-brown mb-4">
            About Sunshine Restaurant
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Bringing authentic West African flavors to Yaoundé with fresh ingredients, 
            traditional recipes, and exceptional service since our founding.
          </p>
        </div>

        <div className="flex justify-center">
          {/* Story & Values */}
          <div className="space-y-8 max-w-2xl">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-leafy-green rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-wooden-brown">Our Story</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Founded with a passion for authentic West African cuisine, Sunshine Restaurant 
                has been serving the Yaoundé community with traditional flavors and modern convenience. 
                Our chefs bring generations of culinary expertise to every dish.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <div className="w-10 h-10 bg-golden-yellow/20 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-5 h-5 text-golden-yellow" />
                </div>
                <h4 className="font-bold text-wooden-brown mb-2">Family Owned</h4>
                <p className="text-sm text-gray-600">
                  A family business dedicated to sharing our heritage through food
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <div className="w-10 h-10 bg-leafy-green/20 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-5 h-5 text-leafy-green" />
                </div>
                <h4 className="font-bold text-wooden-brown mb-2">Quality First</h4>
                <p className="text-sm text-gray-600">
                  Fresh ingredients and authentic recipes in every meal
                </p>
              </div>
            </div>
          </div>

        </div>
        
        {/* Why Choose Sunshine Restaurant Section */}
        <div className="mt-16 lg:mt-24">
          <div className="bg-wooden-brown rounded-3xl p-8 lg:p-12 text-white">
            <div className="text-center mb-8 sm:mb-12">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Why Choose Sunshine Restaurant?</h3>
              <p className="text-white/80 max-w-2xl mx-auto">
                We're committed to providing you with the best dining experience, from fresh ingredients to fast delivery.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Clock,
                  title: "Fast Delivery",
                  description: "Get your meals delivered in 30 minutes or less within Yaoundé",
                },
                {
                  icon: Utensils,
                  title: "Fresh Ingredients",
                  description: "We use only the freshest local ingredients in all our dishes",
                },
                {
                  icon: Shield,
                  title: "Secure Payments",
                  description: "Safe and secure payments with Mobile Money and cash on delivery",
                },
                {
                  icon: Star,
                  title: "Quality Guaranteed",
                  description: "4.9-star rating from over 2,500 satisfied customers",
                },
                {
                  icon: MapPin,
                  title: "Wide Coverage",
                  description: "We deliver across all major areas in Yaoundé",
                },
                {
                  icon: Truck,
                  title: "Real-time Tracking",
                  description: "Track your order in real-time from kitchen to your doorstep",
                },
              ].map((feature, index) => (
                <Card key={index} className="bg-white/10 border-white/20 hover:bg-white/20 transition-colors">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="h-12 w-12 rounded-full bg-leafy-green flex items-center justify-center">
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <h4 className="font-semibold text-lg mb-2">{feature.title}</h4>
                    <p className="text-white/80 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
