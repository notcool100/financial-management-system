import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SMSTemplatesTable } from "@/components/sms/sms-templates-table"
import { SMSBulkSender } from "@/components/sms/sms-bulk-sender"
import { SMSHistoryTable } from "@/components/sms/sms-history-table"
import { Plus } from "lucide-react"

export default function SMSPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">SMS Banking</h1>
          <p className="text-muted-foreground">Send notifications and alerts to customers</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>SMS Credits</CardTitle>
            <CardDescription>Available SMS credits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Available:</span>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">5,280</p>
              </div>
              <Button size="sm">Buy Credits</Button>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Used This Month:</span>
                <span className="font-medium">2,450</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>SMS Delivery</CardTitle>
            <CardDescription>Last 30 days performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Delivered:</span>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">98.5%</p>
                </div>
                <div className="space-y-1 text-right">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Failed:</span>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">1.5%</p>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full" style={{ width: "98.5%" }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="text-left justify-start">
                Send Payment Reminders
              </Button>
              <Button variant="outline" size="sm" className="text-left justify-start">
                Broadcast Announcement
              </Button>
              <Button variant="outline" size="sm" className="text-left justify-start">
                Send EMI Due Alerts
              </Button>
              <Button variant="outline" size="sm" className="text-left justify-start">
                Weekly Account Summary
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="bulk-sms">Bulk SMS</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>SMS Templates</CardTitle>
              <CardDescription>Manage reusable SMS templates for different scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              <SMSTemplatesTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk-sms">
          <Card>
            <CardHeader>
              <CardTitle>Bulk SMS Sender</CardTitle>
              <CardDescription>Send SMS to multiple recipients at once</CardDescription>
            </CardHeader>
            <CardContent>
              <SMSBulkSender />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>SMS History</CardTitle>
              <CardDescription>View history of sent messages</CardDescription>
            </CardHeader>
            <CardContent>
              <SMSHistoryTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
