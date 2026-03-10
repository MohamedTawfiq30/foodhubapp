import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  getMostOrderedFoodItems, 
  getMostOrderedRestaurants, 
  getRevenueByDate,
  getOrderStatusDistribution,
  getCategoryAnalytics
} from '@/db/api';
import type { 
  FoodItemAnalytics, 
  RestaurantAnalytics, 
  RevenueByDate,
  OrderStatusDistribution,
  CategoryAnalytics
} from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { formatCurrency, formatCurrencyCompact } from '@/lib/currency';
import { TrendingUp, Package, Store, PieChart as PieChartIcon } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D'];

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [foodItems, setFoodItems] = useState<FoodItemAnalytics[]>([]);
  const [restaurants, setRestaurants] = useState<RestaurantAnalytics[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueByDate[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<OrderStatusDistribution[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryAnalytics[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [foodData, restaurantData, revenue, status, categories] = await Promise.all([
        getMostOrderedFoodItems(10),
        getMostOrderedRestaurants(10),
        getRevenueByDate(30),
        getOrderStatusDistribution(),
        getCategoryAnalytics()
      ]);

      setFoodItems(foodData);
      setRestaurants(restaurantData);
      setRevenueData(revenue);
      setStatusDistribution(status);
      setCategoryData(categories);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('Revenue') ? formatCurrency(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Comprehensive insights into your business performance</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="food">Food Items</TabsTrigger>
            <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Revenue Trend (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-80 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis tickFormatter={(value) => formatCurrencyCompact(value)} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" strokeWidth={2} />
                      <Line type="monotone" dataKey="order_count" stroke="#82ca9d" name="Orders" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Order Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Order Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={statusDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ status, percentage }) => `${status}: ${percentage}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="status"
                        >
                          {statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Top Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Categories by Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {categoryData.slice(0, 5).map((category, index) => (
                        <div key={category.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{category.name}</p>
                              <p className="text-sm text-muted-foreground">{category.total_orders} orders</p>
                            </div>
                          </div>
                          <p className="font-semibold text-foreground">{formatCurrency(category.total_revenue)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Food Items Tab */}
          <TabsContent value="food" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Most Ordered Food Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-96 w-full" />
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={foodItems}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="total_orders" fill="#8884d8" name="Total Orders" />
                        <Bar dataKey="total_quantity" fill="#82ca9d" name="Total Quantity" />
                      </BarChart>
                    </ResponsiveContainer>

                    <div className="mt-6 space-y-3">
                      {foodItems.map((item, index) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                            {index + 1}
                          </div>
                          {item.image_url && (
                            <img src={item.image_url} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
                          )}
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.restaurant_name}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">{item.total_orders} orders</p>
                            <p className="text-sm text-muted-foreground">{item.total_quantity} items sold</p>
                            <p className="text-sm font-medium text-primary">{formatCurrency(item.total_revenue)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Restaurants Tab */}
          <TabsContent value="restaurants" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Most Ordered Restaurants
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-96 w-full" />
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={restaurants}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis tickFormatter={(value) => formatCurrencyCompact(value)} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="total_revenue" fill="#8884d8" name="Total Revenue" />
                      </BarChart>
                    </ResponsiveContainer>

                    <div className="mt-6 space-y-3">
                      {restaurants.map((restaurant, index) => (
                        <div key={restaurant.id} className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                            {index + 1}
                          </div>
                          {restaurant.image_url && (
                            <img src={restaurant.image_url} alt={restaurant.name} className="h-16 w-16 rounded-lg object-cover" />
                          )}
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">{restaurant.name}</p>
                            <p className="text-sm text-muted-foreground">{restaurant.total_orders} orders</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">{formatCurrency(restaurant.total_revenue)}</p>
                            <p className="text-sm text-muted-foreground">Avg: {formatCurrency(restaurant.average_order_value)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-96 w-full" />
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={categoryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" />
                        <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => formatCurrencyCompact(value)} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="total_orders" fill="#8884d8" name="Total Orders" />
                        <Bar yAxisId="right" dataKey="total_revenue" fill="#82ca9d" name="Total Revenue" />
                      </BarChart>
                    </ResponsiveContainer>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      {categoryData.map((category, index) => (
                        <div key={category.id} className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">{category.name}</p>
                            <p className="text-sm text-muted-foreground">{category.total_orders} orders</p>
                          </div>
                          <p className="font-semibold text-foreground">{formatCurrency(category.total_revenue)}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
