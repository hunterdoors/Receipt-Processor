import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, CheckCircle, Clock, AlertCircle, DollarSign } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  // Mock data - in a real app, this would come from your API
  const stats = [
    { name: 'Total Receipts', value: '124', icon: FileText, change: '+12%', changeType: 'increase' },
    { name: 'Approved', value: '89', icon: CheckCircle, change: '+8%', changeType: 'increase' },
    { name: 'Pending Review', value: '23', icon: Clock, change: '-3%', changeType: 'decrease' },
    { name: 'Needs Attention', value: '12', icon: AlertCircle, change: '+2%', changeType: 'increase' },
  ]

  const recentReceipts = [
    { id: 1, vendor: 'Office Supplies Inc.', amount: 125.99, date: '2023-04-15', status: 'approved' },
    { id: 2, vendor: 'Cloud Hosting Co.', amount: 89.99, date: '2023-04-14', status: 'pending' },
    { id: 3, vendor: 'Team Lunch', amount: 156.43, date: '2023-04-12', status: 'needs_review' },
    { id: 4, vendor: 'Travel Expenses', amount: 342.67, date: '2023-04-10', status: 'approved' },
    { id: 5, vendor: 'Software Subscription', amount: 29.99, date: '2023-04-08', status: 'approved' },
  ]

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; className: string }> = {
      approved: { text: 'Approved', className: 'bg-green-100 text-green-800' },
      pending: { text: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      needs_review: { text: 'Needs Review', className: 'bg-red-100 text-red-800' },
    }
    
    const { text, className } = statusMap[status] || { text: 'Unknown', className: 'bg-gray-100 text-gray-800' }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
        {text}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your receipts.
          </p>
        </div>
        <div>
          <Link
            href="/upload"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Upload Receipt
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Receipts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentReceipts.map((receipt) => (
                  <tr key={receipt.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{receipt.vendor}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-500 mr-1" />
                        <span className="text-sm text-gray-900">{receipt.amount.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(receipt.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(receipt.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a href={`/receipts/${receipt.id}`} className="text-indigo-600 hover:text-indigo-900">
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
