# EventHub Chatbot Setup Guide

The EventHub platform now includes an AI-powered chatbot powered by Google Gemini to help users navigate the platform and get assistance with booking events.

## 🤖 Features

- **Context-Aware Responses**: The chatbot understands which page the user is on and provides relevant help
- **User Session Integration**: Personalized responses based on login status and user role
- **Quick Help Suggestions**: Page-specific quick help buttons for common questions
- **Conversation History**: Maintains context throughout the conversation
- **Floating Widget**: Unobtrusive floating chat button that expands into a full chat interface
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices

## 🚀 Setup Instructions

### 1. Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Configure Environment Variables

Add your Gemini API key to your `.env` file:

```env
# Google Gemini API
GEMINI_API_KEY="your-actual-gemini-api-key-here"
```

### 3. Start the Development Server

```bash
pnpm run dev
```

The chatbot will now be available on all pages as a floating blue chat button in the bottom-right corner.

## 💡 How It Works

### Backend (tRPC API)

The chatbot uses three main API endpoints:

1. **`chatbot.chat`** - Main chat endpoint that handles user messages
2. **`chatbot.getPersonalizedHelp`** - Protected endpoint for logged-in users
3. **`chatbot.getQuickHelp`** - Returns page-specific quick help suggestions

### Frontend (React Component)

The `ChatbotWidget` component provides:

- Floating chat button
- Expandable/minimizable chat interface
- Message history with timestamps
- Typing indicators
- Quick help suggestions
- Error handling with fallback messages

### Context Awareness

The chatbot receives context about:

- Current page URL
- User login status
- User role (USER/ADMIN)
- User name
- Recent conversation history

## 🎯 Capabilities

The EventHub Assistant can help users with:

- **Navigation**: "How do I find events in my area?"
- **Booking Process**: "How do I book tickets for an event?"
- **Account Management**: "How do I view my booking history?"
- **Platform Features**: "What payment methods do you accept?"
- **Event Discovery**: "Can I book multiple events at once?"

### Page-Specific Help

The chatbot provides different quick help suggestions based on the current page:

- **Home Page**: Account creation, event discovery, platform overview
- **Events Page**: Filtering, booking, multiple event selection
- **Cart Page**: Checkout process, payment methods, item management
- **Dashboard**: Booking details, cancellations, ticket downloads
- **Admin Pages**: Event management, user administration, platform statistics

## 🔧 Customization

### Modifying the System Prompt

Edit the `SYSTEM_PROMPT` constant in `src/server/api/routers/chatbot.ts` to customize the chatbot's personality and knowledge base.

### Adding New Quick Help Suggestions

Update the suggestions object in the `getQuickHelp` procedure in `src/server/api/routers/chatbot.ts`.

### Styling the Chat Widget

Modify the Tailwind CSS classes in `src/components/chatbot/chatbot-widget.tsx` to match your design system.

## 🚨 Important Notes

### API Key Security

- Never commit your actual API key to version control
- Use environment variables for all sensitive configuration
- The API key is only used server-side for security

### Rate Limiting

Google Gemini free tier includes:
- 15 requests per minute
- 1,500 requests per day
- More than sufficient for development and moderate production use

### Error Handling

The chatbot includes comprehensive error handling:
- Network failures show user-friendly error messages
- API rate limit errors provide helpful guidance
- Malformed responses fall back to default messages

## 🐛 Troubleshooting

### "Invalid environment variables" Error

Make sure your `.env` file contains a valid `GEMINI_API_KEY`:

```env
GEMINI_API_KEY="your-actual-api-key-here"
```

### Chatbot Not Responding

1. Check your API key is valid
2. Verify you haven't exceeded rate limits
3. Check browser console for error messages
4. Ensure your internet connection is stable

### TypeScript Errors

The chatbot integration should not cause TypeScript errors. If you see errors related to the chatbot code, ensure:

1. All dependencies are installed (`pnpm install`)
2. Your TypeScript configuration allows JSX
3. tRPC types are properly generated

## 📈 Future Enhancements

Potential improvements for the chatbot:

1. **Event Recommendations**: AI-powered event suggestions based on user preferences
2. **Booking Assistance**: Direct booking help with form filling
3. **Multi-language Support**: Support for French and local Cameroonian languages
4. **Voice Chat**: Voice input/output capabilities
5. **Analytics Integration**: Track common user questions and pain points
6. **Custom Training**: Fine-tune responses based on your specific event types

## 📞 Support

If you encounter issues with the chatbot implementation:

1. Check this documentation
2. Review the browser console for errors
3. Verify your environment configuration
4. Test with a fresh API key if needed

The chatbot should seamlessly integrate with your existing EventHub platform and provide valuable assistance to your users!
