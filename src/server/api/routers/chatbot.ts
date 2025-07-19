import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { env } from "~/env";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// System prompt for EventHub chatbot
const SYSTEM_PROMPT = `You are EventHub Assistant, a helpful AI chatbot for the EventHub event booking platform. 

EventHub is an event booking system that allows users to:
- Browse and search for events across Cameroon (especially Yaoundé and Douala)
- Book tickets for events
- Manage their bookings in a personal dashboard
- Use a shopping cart to collect multiple event tickets before purchasing

Your role is to:
1. Help users navigate the website and find what they're looking for
2. Answer questions about events, booking process, and platform features
3. Provide customer support and troubleshooting help
4. Guide users through the booking process
5. Recommend events based on user interests

Guidelines:
- Be friendly, helpful, and professional
- Keep responses concise but informative
- If you don't know something specific about the platform, be honest and suggest they contact support
- Focus on helping users accomplish their goals on the platform
- When appropriate, guide users to specific pages or features

Current website structure:
- Home page: Welcome and featured events
- /events: Browse all events with filtering
- /events/[id]: Individual event details and booking
- /cart: Shopping cart with selected event tickets
- /checkout: Complete booking process
- /dashboard: User's booking history and account info
- /admin: Admin panel (for admin users only)

Always be helpful and try to understand what the user is trying to accomplish!`;

export const chatbotRouter = createTRPCRouter({
  // Public procedure for general chat (can be used by anyone)
  chat: publicProcedure
    .input(
      z.object({
        message: z.string().min(1).max(1000),
        context: z.object({
          currentPage: z.string().optional(),
          userAgent: z.string().optional(),
          sessionData: z.object({
            isLoggedIn: z.boolean(),
            userRole: z.enum(["USER", "ADMIN"]).optional(),
            userName: z.string().optional(),
          }).optional(),
        }).optional(),
        conversationHistory: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })
        ).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Build context-aware prompt
        let contextPrompt = SYSTEM_PROMPT;
        
        if (input.context?.currentPage) {
          contextPrompt += `\n\nUser is currently on page: ${input.context.currentPage}`;
        }
        
        if (input.context?.sessionData?.isLoggedIn) {
          contextPrompt += `\n\nUser is logged in`;
          if (input.context.sessionData.userName) {
            contextPrompt += ` as ${input.context.sessionData.userName}`;
          }
          if (input.context.sessionData.userRole) {
            contextPrompt += ` with role: ${input.context.sessionData.userRole}`;
          }
        } else {
          contextPrompt += `\n\nUser is not logged in - they may need to sign in for certain features`;
        }

        // Build conversation history
        let conversationText = contextPrompt + "\n\n";
        
        if (input.conversationHistory && input.conversationHistory.length > 0) {
          conversationText += "Previous conversation:\n";
          input.conversationHistory.forEach((msg) => {
            conversationText += `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}\n`;
          });
        }
        
        conversationText += `\nUser: ${input.message}\nAssistant:`;

        // Generate response using Gemini
        const result = await model.generateContent(conversationText);
        const response = await result.response;
        const text = response.text();

        // Simple response validation
        if (!text || text.trim().length === 0) {
          throw new Error("Empty response from AI");
        }

        return {
          message: text.trim(),
          timestamp: new Date(),
        };
      } catch (error) {
        console.error("Chatbot error:", error);
        
        // Fallback response
        return {
          message: "I apologize, but I'm having trouble processing your request right now. Please try again, or feel free to browse our events page to find what you're looking for!",
          timestamp: new Date(),
          error: true,
        };
      }
    }),

  // Protected procedure for personalized assistance (requires login)
  getPersonalizedHelp: protectedProcedure
    .input(
      z.object({
        topic: z.enum(["bookings", "events", "account", "general"]),
        question: z.string().min(1).max(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const user = ctx.session.user;
        
        // Build personalized context
        let personalizedPrompt = SYSTEM_PROMPT;
        personalizedPrompt += `\n\nPersonalized context for ${user.name || user.email}:`;
        personalizedPrompt += `\nUser role: ${user.role}`;
        personalizedPrompt += `\nTopic: ${input.topic}`;
        
        if (input.topic === "bookings") {
          personalizedPrompt += `\nUser is asking about their bookings. You can guide them to their dashboard (/dashboard) to view booking history.`;
        } else if (input.topic === "events") {
          personalizedPrompt += `\nUser is asking about events. You can guide them to browse events (/events) or help them find specific events.`;
        } else if (input.topic === "account") {
          personalizedPrompt += `\nUser is asking about their account. You can guide them to their profile (/profile) for account settings.`;
        }
        
        personalizedPrompt += `\n\nUser question: ${input.question}\nAssistant:`;

        // Generate response
        const result = await model.generateContent(personalizedPrompt);
        const response = await result.response;
        const text = response.text();

        return {
          message: text.trim(),
          timestamp: new Date(),
          personalized: true,
        };
      } catch (error) {
        console.error("Personalized chatbot error:", error);
        
        return {
          message: "I'm having trouble accessing your personalized information right now. Please try the general chat or contact our support team for assistance.",
          timestamp: new Date(),
          error: true,
        };
      }
    }),

  // Get quick help suggestions based on current page
  getQuickHelp: publicProcedure
    .input(
      z.object({
        currentPage: z.string(),
      })
    )
    .query(({ input }) => {
      const suggestions: Record<string, string[]> = {
        "/": [
          "How do I find events in my area?",
          "How do I create an account?",
          "What types of events are available?",
        ],
        "/events": [
          "How do I filter events by date?",
          "How do I book tickets for an event?",
          "Can I book multiple events at once?",
        ],
        "/cart": [
          "How do I complete my booking?",
          "Can I remove items from my cart?",
          "What payment methods do you accept?",
        ],
        "/dashboard": [
          "How do I view my booking details?",
          "Can I cancel or modify my booking?",
          "How do I download my tickets?",
        ],
        "/admin": [
          "How do I add a new event?",
          "How do I manage user bookings?",
          "How do I view platform statistics?",
        ],
      };

      return {
        suggestions: suggestions[input.currentPage] || suggestions["/"],
      };
    }),
});
