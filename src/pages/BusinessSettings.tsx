import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Building2, 
  Clock, 
  Users, 
  Calendar,
  Bell,
  QrCode,
  Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BusinessSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Active tab state
  const [activeTab, setActiveTab] = useState("profile");
  
  // Business Profile State
  const [businessProfile, setBusinessProfile] = useState({
    name: "Demo Business",
    description: "Professional services in Lebanon",
    phone: "+961 1 234567",
    email: "info@demobusiness.com",
    address: "Beirut, Lebanon",
    category: "healthcare"
  });

  // Operating Hours State
  const [operatingHours, setOperatingHours] = useState({
    monday: { enabled: true, open: "09:00", close: "17:00" },
    tuesday: { enabled: true, open: "09:00", close: "17:00" },
    wednesday: { enabled: true, open: "09:00", close: "17:00" },
    thursday: { enabled: true, open: "09:00", close: "17:00" },
    friday: { enabled: true, open: "09:00", close: "17:00" },
    saturday: { enabled: false, open: "09:00", close: "17:00" },
    sunday: { enabled: false, open: "09:00", close: "17:00" }
  });

  // Queue Settings State
  const [queueSettings, setQueueSettings] = useState({
    maxCapacity: 20,
    avgServiceTime: 15,
    autoStart: true,
    autoPause: false,
    pauseThreshold: 25,
    requirePhone: false,
    requireName: false
  });

  // Appointment Settings State
  const [appointmentSettings, setAppointmentSettings] = useState({
    enabled: true,
    defaultDuration: 30,
    bufferTime: 5,
    bookingWindow: 30,
    cancellationWindow: 24,
    allowRescheduling: true,
    requirePhone: true,
    requireName: true,
    maxPerDay: 20,
    workingHours: {
      start: "09:00",
      end: "17:00",
      lunchStart: "12:00",
      lunchEnd: "13:00",
      includeLunch: true
    }
  });

  // Service Types State
  const [serviceTypes, setServiceTypes] = useState([
    { id: 1, name: "General Consultation", duration: 30, enabled: true },
    { id: 2, name: "Follow-up Visit", duration: 15, enabled: true },
    { id: 3, name: "Detailed Assessment", duration: 60, enabled: false }
  ]);

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    smsEnabled: true,
    whatsappEnabled: true,
    emailEnabled: false,
    language: "arabic",
    templates: {
      queueJoined: "أهلاً وسهلاً! تم تسجيلك في الطابور. موقعك الحالي: {position}",
      appointmentConfirmed: "تم تأكيد موعدك في {date} الساعة {time}. شكراً لك!",
      appointmentReminder: "تذكير: لديك موعد غداً في {time}. نراك قريباً!",
      yourTurn: "حان دورك! يرجى التوجه إلى المكتب الآن."
    },
    reminderTiming: 24,
    sendReminders: true
  });

  const handleSave = () => {
    // TODO: Implement Firebase save
    toast({
      title: "Settings Saved",
      description: "Your business settings have been updated successfully.",
    });
  };

  const dayNames = {
    monday: "Monday",
    tuesday: "Tuesday", 
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday"
  };

  return (
    <div className="min-h-screen bg-gradient-status">
      {/* Header */}
      <div className="border-b border-border/10 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/business/dashboard")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-primary text-primary-foreground rounded-lg w-8 h-8 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h1 className="font-semibold text-lg">Business Settings</h1>
                <p className="text-sm text-muted-foreground">Configure your business</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Mobile Dropdown on small screens, horizontal tabs on larger screens */}
          <div className="block sm:hidden">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full bg-background border-border">
                <SelectValue placeholder="Select settings category" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border z-50">
                <SelectItem value="profile">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Business Profile
                  </div>
                </SelectItem>
                <SelectItem value="hours">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Operating Hours
                  </div>
                </SelectItem>
                <SelectItem value="queue">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Queue Settings
                  </div>
                </SelectItem>
                <SelectItem value="appointments">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Appointments
                  </div>
                </SelectItem>
                <SelectItem value="notifications">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Notifications
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Horizontal tabs for larger screens */}
          <TabsList className="hidden sm:grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center gap-2 text-xs sm:text-sm">
              <Building2 className="w-4 h-4" />
              <span className="hidden lg:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="hours" className="flex items-center gap-2 text-xs sm:text-sm">
              <Clock className="w-4 h-4" />
              <span className="hidden lg:inline">Hours</span>
            </TabsTrigger>
            <TabsTrigger value="queue" className="flex items-center gap-2 text-xs sm:text-sm">
              <Users className="w-4 h-4" />
              <span className="hidden lg:inline">Queue</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2 text-xs sm:text-sm">
              <Calendar className="w-4 h-4" />
              <span className="hidden lg:inline">Appts</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 text-xs sm:text-sm">
              <Bell className="w-4 h-4" />
              <span className="hidden lg:inline">Notifs</span>
            </TabsTrigger>
          </TabsList>

          {/* Business Profile Tab */}
          <TabsContent value="profile">
            <Card className="shadow-medium border-0">
              <CardHeader>
                <CardTitle>Business Profile</CardTitle>
                <CardDescription>
                  Update your business information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      value={businessProfile.name}
                      onChange={(e) => setBusinessProfile({...businessProfile, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={businessProfile.category} onValueChange={(value) => setBusinessProfile({...businessProfile, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="banking">Banking</SelectItem>
                        <SelectItem value="government">Government</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="restaurant">Restaurant</SelectItem>
                        <SelectItem value="beauty">Beauty & Salon</SelectItem>
                        <SelectItem value="automotive">Automotive</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={businessProfile.description}
                    onChange={(e) => setBusinessProfile({...businessProfile, description: e.target.value})}
                    placeholder="Brief description of your business"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={businessProfile.phone}
                      onChange={(e) => setBusinessProfile({...businessProfile, phone: e.target.value})}
                      placeholder="+961 1 234567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={businessProfile.email}
                      onChange={(e) => setBusinessProfile({...businessProfile, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={businessProfile.address}
                    onChange={(e) => setBusinessProfile({...businessProfile, address: e.target.value})}
                    placeholder="Street address, City, Lebanon"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Operating Hours Tab */}
          <TabsContent value="hours">
            <Card className="shadow-medium border-0">
              <CardHeader>
                <CardTitle>Operating Hours</CardTitle>
                <CardDescription>
                  Set your business hours for each day of the week
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(operatingHours).map(([day, hours]) => (
                  <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-3">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={hours.enabled}
                        onCheckedChange={(checked) => 
                          setOperatingHours({
                            ...operatingHours,
                            [day]: { ...hours, enabled: checked }
                          })
                        }
                      />
                      <span className="font-medium min-w-[80px]">{dayNames[day as keyof typeof dayNames]}</span>
                    </div>
                    
                    {hours.enabled ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Input
                          type="time"
                          value={hours.open}
                          onChange={(e) =>
                            setOperatingHours({
                              ...operatingHours,
                              [day]: { ...hours, open: e.target.value }
                            })
                          }
                          className="w-[120px]"
                        />
                        <span className="text-muted-foreground text-sm">to</span>
                        <Input
                          type="time"
                          value={hours.close}
                          onChange={(e) =>
                            setOperatingHours({
                              ...operatingHours,
                              [day]: { ...hours, close: e.target.value }
                            })
                          }
                          className="w-[120px]"
                        />
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Closed</span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Queue Settings Tab */}
          <TabsContent value="queue">
            <Card className="shadow-medium border-0">
              <CardHeader>
                <CardTitle>Queue Management</CardTitle>
                <CardDescription>
                  Configure how your queue operates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxCapacity">Maximum Queue Capacity</Label>
                    <Input
                      id="maxCapacity"
                      type="number"
                      value={queueSettings.maxCapacity}
                      onChange={(e) => setQueueSettings({...queueSettings, maxCapacity: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avgServiceTime">Average Service Time (minutes)</Label>
                    <Input
                      id="avgServiceTime"
                      type="number"
                      value={queueSettings.avgServiceTime}
                      onChange={(e) => setQueueSettings({...queueSettings, avgServiceTime: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-start queue daily</Label>
                      <p className="text-sm text-muted-foreground">Queue starts automatically when business opens</p>
                    </div>
                    <Switch
                      checked={queueSettings.autoStart}
                      onCheckedChange={(checked) => setQueueSettings({...queueSettings, autoStart: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-pause when busy</Label>
                      <p className="text-sm text-muted-foreground">Pause queue when capacity threshold is reached</p>
                    </div>
                    <Switch
                      checked={queueSettings.autoPause}
                      onCheckedChange={(checked) => setQueueSettings({...queueSettings, autoPause: checked})}
                    />
                  </div>

                  {queueSettings.autoPause && (
                    <div className="ml-4 space-y-2">
                      <Label htmlFor="pauseThreshold">Pause at capacity (%)</Label>
                      <Input
                        id="pauseThreshold"
                        type="number"
                        value={queueSettings.pauseThreshold}
                        onChange={(e) => setQueueSettings({...queueSettings, pauseThreshold: parseInt(e.target.value)})}
                        className="w-32"
                      />
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Customer Information Requirements</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require phone number</Label>
                      <p className="text-sm text-muted-foreground">Customers must provide phone number to join queue</p>
                    </div>
                    <Switch
                      checked={queueSettings.requirePhone}
                      onCheckedChange={(checked) => setQueueSettings({...queueSettings, requirePhone: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require name</Label>
                      <p className="text-sm text-muted-foreground">Customers must provide name to join queue</p>
                    </div>
                    <Switch
                      checked={queueSettings.requireName}
                      onCheckedChange={(checked) => setQueueSettings({...queueSettings, requireName: checked})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Settings Tab */}
          <TabsContent value="appointments">
            <div className="space-y-6">
              <Card className="shadow-medium border-0">
                <CardHeader>
                  <CardTitle>Appointment Settings</CardTitle>
                  <CardDescription>
                    Configure how customers can book appointments with your business
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Online Appointments</Label>
                      <p className="text-sm text-muted-foreground">Allow customers to book appointments online</p>
                    </div>
                    <Switch
                      checked={appointmentSettings.enabled}
                      onCheckedChange={(checked) => setAppointmentSettings({...appointmentSettings, enabled: checked})}
                    />
                  </div>

                  {appointmentSettings.enabled && (
                    <>
                      <Separator />
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="defaultDuration">Default Appointment Duration (minutes)</Label>
                          <Input
                            id="defaultDuration"
                            type="number"
                            value={appointmentSettings.defaultDuration}
                            onChange={(e) => setAppointmentSettings({...appointmentSettings, defaultDuration: parseInt(e.target.value)})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bufferTime">Buffer Time Between Appointments (minutes)</Label>
                          <Input
                            id="bufferTime"
                            type="number"
                            value={appointmentSettings.bufferTime}
                            onChange={(e) => setAppointmentSettings({...appointmentSettings, bufferTime: parseInt(e.target.value)})}
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="bookingWindow">Booking Window (days in advance)</Label>
                          <Input
                            id="bookingWindow"
                            type="number"
                            value={appointmentSettings.bookingWindow}
                            onChange={(e) => setAppointmentSettings({...appointmentSettings, bookingWindow: parseInt(e.target.value)})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cancellationWindow">Cancellation Window (hours before)</Label>
                          <Input
                            id="cancellationWindow"
                            type="number"
                            value={appointmentSettings.cancellationWindow}
                            onChange={(e) => setAppointmentSettings({...appointmentSettings, cancellationWindow: parseInt(e.target.value)})}
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h4 className="font-medium">Working Hours for Appointments</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="workStart">Start Time</Label>
                            <Input
                              id="workStart"
                              type="time"
                              value={appointmentSettings.workingHours.start}
                              onChange={(e) => setAppointmentSettings({
                                ...appointmentSettings,
                                workingHours: {...appointmentSettings.workingHours, start: e.target.value}
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="workEnd">End Time</Label>
                            <Input
                              id="workEnd"
                              type="time"
                              value={appointmentSettings.workingHours.end}
                              onChange={(e) => setAppointmentSettings({
                                ...appointmentSettings,
                                workingHours: {...appointmentSettings.workingHours, end: e.target.value}
                              })}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Include Lunch Break</Label>
                            <p className="text-sm text-muted-foreground">Block appointments during lunch time</p>
                          </div>
                          <Switch
                            checked={appointmentSettings.workingHours.includeLunch}
                            onCheckedChange={(checked) => setAppointmentSettings({
                              ...appointmentSettings,
                              workingHours: {...appointmentSettings.workingHours, includeLunch: checked}
                            })}
                          />
                        </div>

                        {appointmentSettings.workingHours.includeLunch && (
                          <div className="ml-4 grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="lunchStart">Lunch Start</Label>
                              <Input
                                id="lunchStart"
                                type="time"
                                value={appointmentSettings.workingHours.lunchStart}
                                onChange={(e) => setAppointmentSettings({
                                  ...appointmentSettings,
                                  workingHours: {...appointmentSettings.workingHours, lunchStart: e.target.value}
                                })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="lunchEnd">Lunch End</Label>
                              <Input
                                id="lunchEnd"
                                type="time"
                                value={appointmentSettings.workingHours.lunchEnd}
                                onChange={(e) => setAppointmentSettings({
                                  ...appointmentSettings,
                                  workingHours: {...appointmentSettings.workingHours, lunchEnd: e.target.value}
                                })}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Allow Customer Rescheduling</Label>
                            <p className="text-sm text-muted-foreground">Customers can reschedule their own appointments</p>
                          </div>
                          <Switch
                            checked={appointmentSettings.allowRescheduling}
                            onCheckedChange={(checked) => setAppointmentSettings({...appointmentSettings, allowRescheduling: checked})}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Require Phone Number</Label>
                            <p className="text-sm text-muted-foreground">Customers must provide phone for appointments</p>
                          </div>
                          <Switch
                            checked={appointmentSettings.requirePhone}
                            onCheckedChange={(checked) => setAppointmentSettings({...appointmentSettings, requirePhone: checked})}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Require Full Name</Label>
                            <p className="text-sm text-muted-foreground">Customers must provide full name for appointments</p>
                          </div>
                          <Switch
                            checked={appointmentSettings.requireName}
                            onCheckedChange={(checked) => setAppointmentSettings({...appointmentSettings, requireName: checked})}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Service Types */}
              {appointmentSettings.enabled && (
                <Card className="shadow-medium border-0">
                  <CardHeader>
                    <CardTitle>Service Types</CardTitle>
                    <CardDescription>
                      Define different appointment types with custom durations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {serviceTypes.map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={service.enabled}
                            onCheckedChange={(checked) => 
                              setServiceTypes(serviceTypes.map(s => 
                                s.id === service.id ? {...s, enabled: checked} : s
                              ))
                            }
                          />
                          <div>
                            <p className="font-medium">{service.name}</p>
                            <p className="text-sm text-muted-foreground">{service.duration} minutes</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={service.duration}
                            onChange={(e) => 
                              setServiceTypes(serviceTypes.map(s => 
                                s.id === service.id ? {...s, duration: parseInt(e.target.value)} : s
                              ))
                            }
                            className="w-20"
                            disabled={!service.enabled}
                          />
                          <span className="text-sm text-muted-foreground">min</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Notifications Settings Tab */}
          <TabsContent value="notifications">
            <div className="space-y-6">
              <Card className="shadow-medium border-0">
                <CardHeader>
                  <CardTitle>Notification Channels</CardTitle>
                  <CardDescription>
                    Choose how to communicate with your customers in Lebanon
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Primary Language</Label>
                    <Select value={notificationSettings.language} onValueChange={(value) => setNotificationSettings({...notificationSettings, language: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="arabic">العربية (Arabic)</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="french">Français (French)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>WhatsApp Notifications</Label>
                        <p className="text-sm text-muted-foreground">Most popular in Lebanon - send updates via WhatsApp</p>
                      </div>
                      <Switch
                        checked={notificationSettings.whatsappEnabled}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, whatsappEnabled: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">Send text messages for important updates</p>
                      </div>
                      <Switch
                        checked={notificationSettings.smsEnabled}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, smsEnabled: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Send email confirmations and reminders</p>
                      </div>
                      <Switch
                        checked={notificationSettings.emailEnabled}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailEnabled: checked})}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Send Appointment Reminders</Label>
                        <p className="text-sm text-muted-foreground">Automatically remind customers before appointments</p>
                      </div>
                      <Switch
                        checked={notificationSettings.sendReminders}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, sendReminders: checked})}
                      />
                    </div>

                    {notificationSettings.sendReminders && (
                      <div className="ml-4 space-y-2">
                        <Label htmlFor="reminderTiming">Send Reminder (hours before)</Label>
                        <Select 
                          value={notificationSettings.reminderTiming.toString()} 
                          onValueChange={(value) => setNotificationSettings({...notificationSettings, reminderTiming: parseInt(value)})}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 hour before</SelectItem>
                            <SelectItem value="2">2 hours before</SelectItem>
                            <SelectItem value="4">4 hours before</SelectItem>
                            <SelectItem value="24">1 day before</SelectItem>
                            <SelectItem value="48">2 days before</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Message Templates */}
              <Card className="shadow-medium border-0">
                <CardHeader>
                  <CardTitle>Message Templates</CardTitle>
                  <CardDescription>
                    Customize the messages sent to your customers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="queueJoined">Queue Joined Message</Label>
                    <Textarea
                      id="queueJoined"
                      value={notificationSettings.templates.queueJoined}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        templates: {...notificationSettings.templates, queueJoined: e.target.value}
                      })}
                      placeholder="Message when customer joins queue"
                      rows={2}
                    />
                    <p className="text-xs text-muted-foreground">Use {`{position}`} for queue position</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appointmentConfirmed">Appointment Confirmed</Label>
                    <Textarea
                      id="appointmentConfirmed"
                      value={notificationSettings.templates.appointmentConfirmed}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        templates: {...notificationSettings.templates, appointmentConfirmed: e.target.value}
                      })}
                      placeholder="Message when appointment is confirmed"
                      rows={2}
                    />
                    <p className="text-xs text-muted-foreground">Use {`{date}`} and {`{time}`} for appointment details</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appointmentReminder">Appointment Reminder</Label>
                    <Textarea
                      id="appointmentReminder"
                      value={notificationSettings.templates.appointmentReminder}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        templates: {...notificationSettings.templates, appointmentReminder: e.target.value}
                      })}
                      placeholder="Reminder message before appointment"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yourTurn">Your Turn Message</Label>
                    <Textarea
                      id="yourTurn"
                      value={notificationSettings.templates.yourTurn}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        templates: {...notificationSettings.templates, yourTurn: e.target.value}
                      })}
                      placeholder="Message when it's customer's turn"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="sticky bottom-4 pt-6">
          <Button onClick={handleSave} size="lg" className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Save All Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BusinessSettings;