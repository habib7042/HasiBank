import { MemoryUploader } from './memory-uploader'
import { MemoryGallery } from './memory-gallery'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Filter } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface User {
  id: string
  name: string
}

interface MemoryComment {
  id: number
  content: string
  createdAt: string
  user: { name: string }
}

interface MemoryImage {
  id: number
  url: string
}

interface Memory {
  id: number
  imageUrl: string | null
  description: string
  date: string
  user: { name: string }
  images: MemoryImage[]
  comments: MemoryComment[]
}

interface MemoriesProps {
  currentUser: string | null
  users: User[]
}

export function Memories({ currentUser, users }: MemoriesProps) {
  const [page, setPage] = useState(1)
  const [filterUser, setFilterUser] = useState<string>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // React Query key includes filters to auto-refetch
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['memories', page, filterUser, startDate, endDate],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      })
      if (filterUser && filterUser !== 'all') queryParams.append('filterUser', filterUser)
      if (startDate) queryParams.append('startDate', startDate)
      if (endDate) queryParams.append('endDate', endDate)

      const response = await fetch(`/api/memories?${queryParams}`)
      if (!response.ok) {
        throw new Error('Failed to fetch memories')
      }
      return await response.json()
    },
    placeholderData: (previousData) => previousData, // Keep data while fetching new
  })

  const memories: Memory[] = data?.memories || []
  const pagination = data?.pagination || { pages: 1, currentPage: 1 }

  // Use refetch for actions that update data
  const handleDataUpdate = () => {
    refetch()
  }

  return (
    <div className="space-y-8 pb-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-pink-800 hidden md:block">Memories</h2>
        <div className="flex gap-2 ml-auto">
           <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-2 text-pink-700 border-pink-200">
                <Filter className="h-4 w-4" /> Filter Memories
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-pink-700 text-xs">Filter by Uploader</Label>
                  <Select value={filterUser} onValueChange={setFilterUser}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="All Users" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label className="text-pink-700 text-xs">Start Date</Label>
                    <Input
                      type="date"
                      className="h-8 text-xs"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-pink-700 text-xs">End Date</Label>
                    <Input
                      type="date"
                      className="h-8 text-xs"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-pink-500 hover:text-pink-700"
                  onClick={() => {
                    setFilterUser('all')
                    setStartDate('')
                    setEndDate('')
                    setPage(1)
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <MemoryUploader
        users={users}
        onUploadComplete={handleDataUpdate}
        currentUser={currentUser}
      />

      {isLoading && page === 1 ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 text-pink-500 animate-spin" />
        </div>
      ) : (
        <>
          <MemoryGallery
            memories={memories}
            currentUser={currentUser}
            onCommentAdded={handleDataUpdate}
          />

          <div className="flex justify-center gap-2 mt-8">
             <Button
               variant="outline"
               size="sm"
               onClick={() => setPage(p => Math.max(1, p - 1))}
               disabled={page === 1 || isFetching}
               className="text-pink-600 border-pink-200"
             >
               Previous
             </Button>
             <span className="flex items-center text-sm text-pink-600">
               Page {page} of {pagination.pages}
             </span>
             <Button
               variant="outline"
               size="sm"
               onClick={() => setPage(p => p + 1)}
               disabled={page >= pagination.pages || isFetching}
               className="text-pink-600 border-pink-200"
             >
               Next
             </Button>
          </div>
        </>
      )}
    </div>
  )
}
