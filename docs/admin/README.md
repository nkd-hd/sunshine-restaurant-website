# 👨‍💼 Admin Panel User Guide

Complete guide for restaurant owners and managers using the Sunshine Restaurant admin panel.

## 🎯 Overview

The admin panel is your central command center for managing all aspects of your restaurant business. From here, you can manage your menu, process orders, view analytics, and configure settings.

**Access URL**: `https://your-domain.com/admin`

---

## 🚪 Getting Started

### Initial Login

1. **Navigate to Admin Panel**: Visit `/admin` on your website
2. **Login Required**: You must have an ADMIN role account
3. **First Time Setup**: If this is your first login, you may need to complete initial restaurant configuration

### Dashboard Overview

The admin dashboard provides an at-a-glance view of your restaurant's performance:

- 📊 **Today's Statistics**: Orders, revenue, popular items
- 🔔 **Recent Activity**: Latest orders and customer actions  
- 📈 **Quick Metrics**: This week vs last week comparisons
- ⚠️ **Action Items**: Items requiring attention (low stock, pending orders)

---

## 🍽️ Menu Management

### Managing Meals

#### Adding New Meals

1. **Navigate**: Go to Admin → Meals → Add New Meal
2. **Basic Information**:
   - **Name**: Enter the meal name (e.g., "Jollof Rice with Chicken")
   - **Description**: Detailed description of the dish
   - **Price**: Set price in XAF (Central African Francs)
   - **Category**: Select appropriate category

3. **Images**:
   - Upload high-quality photos (recommended: 1200x800px)
   - Add multiple angles if available
   - Primary image will be used for menu display

4. **Dietary Information**:
   - ✅ Vegetarian
   - ✅ Vegan  
   - ✅ Halal
   - ✅ Gluten-free
   - ✅ Contains nuts
   - ✅ Spicy level (1-5)

5. **Availability**:
   - **In Stock**: Available for ordering
   - **Out of Stock**: Temporarily unavailable
   - **Seasonal**: Available during specific periods

#### Editing Existing Meals

1. **Navigate**: Admin → Meals
2. **Find Meal**: Use search or browse categories
3. **Click Edit**: Make changes to any field
4. **Save Changes**: Changes are immediately live

#### Managing Categories

1. **Navigate**: Admin → Categories
2. **Add Category**: Create sections like "Appetizers", "Main Courses", "Desserts"
3. **Organize Order**: Drag and drop to reorder how categories appear on menu
4. **Assign Meals**: Move meals between categories as needed

### Best Practices for Menu Management

- **High-Quality Photos**: Professional food photography increases orders by 30%
- **Detailed Descriptions**: Include ingredients, cooking method, and portion size
- **Regular Updates**: Keep seasonal items current
- **Price Strategy**: Monitor competitor pricing and adjust accordingly
- **Popular Items**: Feature best-sellers prominently

---

## 📦 Order Management

### Order Dashboard

The orders dashboard shows all customer orders in real-time:

- **New Orders**: Require confirmation and preparation
- **In Progress**: Currently being prepared
- **Ready**: Awaiting pickup or delivery
- **Completed**: Successfully fulfilled orders

### Order Workflow

#### 1. New Order Received
- **Notification**: System alerts you of new order
- **Review Details**: Check items, customer info, delivery address
- **Confirm Order**: Accept the order to begin preparation

#### 2. Order Preparation
- **Update Status**: Mark as "Preparing" when kitchen starts
- **Estimated Time**: Set realistic preparation time
- **Special Instructions**: Note any customer requests

#### 3. Order Ready
- **Mark Ready**: When food is prepared and packaged
- **Notify Customer**: Automatic WhatsApp/SMS notification sent
- **Assign Delivery**: If delivery order, assign to rider

#### 4. Order Completion
- **Confirm Delivery**: Mark as delivered when completed
- **Payment Status**: Ensure payment is processed
- **Customer Feedback**: Check for any reviews or issues

### Managing Delivery

#### Delivery Zones (Yaoundé)
Configure delivery areas and pricing:

1. **Navigate**: Admin → Settings → Delivery Zones
2. **Define Areas**: Set up neighborhoods like:
   - Bastos: 1,500 XAF delivery fee
   - Mvan: 2,000 XAF delivery fee  
   - Nsimeyong: 1,000 XAF delivery fee
3. **Set Times**: Estimated delivery duration per zone
4. **Update Regularly**: Adjust based on traffic and distance

---

## 📊 Analytics & Reports

### Business Intelligence Dashboard

Track your restaurant's performance with comprehensive analytics:

#### Sales Analytics
- **Daily Revenue**: Track daily sales trends
- **Popular Items**: See which meals sell best
- **Peak Hours**: Understand when you're busiest
- **Average Order Value**: Monitor customer spending

#### Customer Analytics  
- **New vs Returning**: Customer loyalty metrics
- **Order Patterns**: Frequency and preferences
- **Geographic Data**: Where your customers are located
- **Payment Methods**: Cash vs mobile money preferences

#### Operational Analytics
- **Preparation Times**: How long meals take to prepare
- **Delivery Performance**: On-time delivery rates
- **Order Accuracy**: Mistake and return rates
- **Staff Performance**: Peak efficiency times

### Using Analytics for Growth

1. **Menu Optimization**: Remove low-performing items
2. **Pricing Strategy**: Adjust prices based on demand
3. **Marketing Decisions**: Target high-value customer segments
4. **Operational Improvements**: Optimize preparation and delivery times
5. **Inventory Planning**: Stock popular items appropriately

---

## ⚙️ Settings & Configuration

### Restaurant Information

Keep your business information current:

#### Basic Details
- **Restaurant Name**: Sunshine Restaurant
- **Contact Information**: Phone, email, address
- **Operating Hours**: Daily opening and closing times
- **About Us**: Description of your restaurant and cuisine

#### Business Operations
- **Minimum Order**: Set minimum order values
- **Delivery Fee**: Default delivery charges
- **Payment Methods**: Enable/disable payment options
- **Order Lead Time**: How far in advance customers can order

### User Management

Control who has access to different parts of the system:

#### Admin Users
- **Add Staff**: Create accounts for managers and staff
- **Role Assignment**: Different permission levels
- **Activity Monitoring**: Track admin user actions

#### Customer Management
- **View Customers**: See registered customer accounts
- **Customer Support**: Handle account issues and questions
- **Loyalty Programs**: Manage repeat customer incentives

---

## 💬 WhatsApp Integration

### Customer Communication

Leverage WhatsApp for better customer service:

#### Automated Messages
- **Order Confirmation**: "Your order #123 has been confirmed"
- **Preparation Updates**: "Your food is being prepared"
- **Ready for Pickup**: "Your order is ready for collection"
- **Delivery Updates**: "Your rider is on the way"

#### Manual Communication
- **Customer Inquiries**: Respond to questions about menu or orders
- **Special Requests**: Handle customizations and dietary needs
- **Issue Resolution**: Address complaints and concerns
- **Marketing**: Send promotions and new menu announcements

### Setup WhatsApp Business

1. **WhatsApp Business Account**: Register your business
2. **API Integration**: Connect to Sunshine Restaurant system
3. **Message Templates**: Pre-approved message formats
4. **Phone Number**: Dedicated business WhatsApp number

---

## 🚨 Troubleshooting

### Common Issues

#### Orders Not Appearing
- Check internet connection
- Refresh the admin panel
- Verify notification settings
- Contact technical support if persistent

#### Payment Processing Issues
- Verify MTN MoMo/Orange Money API settings
- Check customer payment method
- Ensure sufficient account balance (customer side)
- Contact payment provider support

#### Customer Cannot Find Restaurant
- Verify Google Maps location is correct
- Update delivery zone settings
- Check restaurant operating hours
- Ensure restaurant status is "Open"

### Getting Support

- **Technical Issues**: Contact development team
- **Business Questions**: Consult restaurant management guide
- **Payment Problems**: Contact payment provider directly
- **Emergency**: Use backup communication methods

---

## 📱 Mobile Access

### Using Admin Panel on Mobile

The admin panel is mobile-responsive for managing your restaurant on-the-go:

- **Order Notifications**: Receive alerts on your phone
- **Quick Actions**: Accept/decline orders with one tap
- **Status Updates**: Update order progress from kitchen
- **Customer Communication**: Respond to WhatsApp messages

### Recommended Mobile Workflow

1. **Morning Setup**: Check overnight orders and prepare for day
2. **Order Management**: Accept and process orders throughout day
3. **Customer Service**: Respond to inquiries and handle issues
4. **Evening Review**: Check daily performance and plan improvements

---

## 🎯 Success Tips

### Maximizing Your Restaurant's Success

1. **Keep Menu Fresh**: Regularly update with seasonal items
2. **Monitor Competition**: Stay competitive with pricing and offerings
3. **Customer Service**: Quick response times increase satisfaction
4. **Quality Control**: Maintain consistent food quality and presentation
5. **Data-Driven Decisions**: Use analytics to guide business choices

### Growing Your Business

- **Social Media**: Share attractive food photos
- **Customer Reviews**: Encourage and respond to feedback
- **Loyalty Programs**: Reward repeat customers
- **Special Promotions**: Seasonal discounts and combo deals
- **Community Engagement**: Participate in local events

---

**🌟 Your success is our priority! Use these tools to build the best restaurant experience in Yaoundé.**

For more detailed guides on specific features, check out:
- **[Menu Management Guide](menu-management.md)**
- **[Order Processing Guide](order-management.md)**  
- **[Analytics Guide](analytics.md)**
