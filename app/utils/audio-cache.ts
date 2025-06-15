interface CachedAudio {
  id: string
  audioData: string
  contentType: string
  text: string
  voice: string
  timestamp: number
  size: number
}

class AudioCache {
  private dbName = "gestalt-audio-cache"
  private storeName = "audio"
  private version = 1
  private maxCacheSize = 50 * 1024 * 1024 // 50MB
  private maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: "id" })
          store.createIndex("timestamp", "timestamp", { unique: false })
        }
      }
    })
  }

  private generateCacheKey(text: string, voice: string): string {
    // Create a simple hash of text + voice for the cache key
    const combined = `${text.toLowerCase().trim()}-${voice}`
    let hash = 0
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return `audio_${Math.abs(hash)}`
  }

  async get(text: string, voice: string): Promise<CachedAudio | null> {
    try {
      const db = await this.openDB()
      const transaction = db.transaction([this.storeName], "readonly")
      const store = transaction.objectStore(this.storeName)
      const key = this.generateCacheKey(text, voice)

      return new Promise((resolve, reject) => {
        const request = store.get(key)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
          const result = request.result as CachedAudio | undefined
          if (result) {
            // Check if cache entry is still valid
            const now = Date.now()
            if (now - result.timestamp > this.maxAge) {
              // Cache entry is expired, remove it asynchronously
              this.delete(text, voice).catch(console.error)
              resolve(null)
            } else {
              resolve(result)
            }
          } else {
            resolve(null)
          }
        }
      })
    } catch (error) {
      console.error("Error reading from audio cache:", error)
      return null
    }
  }

  async set(text: string, voice: string, audioData: string, contentType: string): Promise<void> {
    try {
      const db = await this.openDB()

      const cacheEntry: CachedAudio = {
        id: this.generateCacheKey(text, voice),
        audioData,
        contentType,
        text,
        voice,
        timestamp: Date.now(),
        size: audioData.length,
      }

      // Use a fresh transaction for the set operation
      const transaction = db.transaction([this.storeName], "readwrite")
      const store = transaction.objectStore(this.storeName)

      return new Promise((resolve, reject) => {
        const request = store.put(cacheEntry)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
          console.log(`Audio cached for: "${text}" with voice: ${voice}`)
          resolve()
        }

        // Handle transaction completion
        transaction.oncomplete = () => {
          // Schedule cleanup asynchronously after successful cache
          this.scheduleCleanup()
        }

        transaction.onerror = () => reject(transaction.error)
      })
    } catch (error) {
      console.error("Error writing to audio cache:", error)
      throw error
    }
  }

  async delete(text: string, voice: string): Promise<void> {
    try {
      const db = await this.openDB()
      const transaction = db.transaction([this.storeName], "readwrite")
      const store = transaction.objectStore(this.storeName)
      const key = this.generateCacheKey(text, voice)

      return new Promise((resolve, reject) => {
        const request = store.delete(key)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
      })
    } catch (error) {
      console.error("Error deleting from audio cache:", error)
    }
  }

  async getCacheSize(): Promise<number> {
    try {
      const db = await this.openDB()
      const transaction = db.transaction([this.storeName], "readonly")
      const store = transaction.objectStore(this.storeName)

      return new Promise((resolve, reject) => {
        const request = store.getAll()
        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
          const entries = request.result as CachedAudio[]
          const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0)
          resolve(totalSize)
        }
      })
    } catch (error) {
      console.error("Error getting cache size:", error)
      return 0
    }
  }

  private scheduleCleanup(): void {
    // Schedule cleanup to run asynchronously without blocking the main operation
    setTimeout(() => {
      this.cleanupIfNeeded().catch(console.error)
    }, 100)
  }

  async cleanupIfNeeded(): Promise<void> {
    try {
      const currentSize = await this.getCacheSize()
      if (currentSize > this.maxCacheSize) {
        await this.cleanup()
      }
    } catch (error) {
      console.error("Error during cache cleanup check:", error)
    }
  }

  async cleanup(): Promise<void> {
    try {
      const db = await this.openDB()

      // First, get all entries to determine what to delete
      const readTransaction = db.transaction([this.storeName], "readonly")
      const readStore = readTransaction.objectStore(this.storeName)

      const allEntries = await new Promise<CachedAudio[]>((resolve, reject) => {
        const request = readStore.getAll()
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result as CachedAudio[])
      })

      // Determine which entries to delete
      const now = Date.now()
      const toDelete: string[] = []
      let currentSize = 0

      // Sort by timestamp (oldest first)
      allEntries.sort((a, b) => a.timestamp - b.timestamp)

      for (const entry of allEntries) {
        // Mark for deletion if expired or if we need to free up space
        if (now - entry.timestamp > this.maxAge || currentSize > this.maxCacheSize * 0.8) {
          toDelete.push(entry.id)
        } else {
          currentSize += entry.size
        }
      }

      // Delete marked entries in a separate transaction
      if (toDelete.length > 0) {
        const deleteTransaction = db.transaction([this.storeName], "readwrite")
        const deleteStore = deleteTransaction.objectStore(this.storeName)

        const deletePromises = toDelete.map((id) => {
          return new Promise<void>((resolve, reject) => {
            const deleteRequest = deleteStore.delete(id)
            deleteRequest.onerror = () => reject(deleteRequest.error)
            deleteRequest.onsuccess = () => resolve()
          })
        })

        await Promise.all(deletePromises)
        console.log(`Cleaned up ${toDelete.length} expired cache entries`)
      }
    } catch (error) {
      console.error("Error during cache cleanup:", error)
    }
  }

  async clear(): Promise<void> {
    try {
      const db = await this.openDB()
      const transaction = db.transaction([this.storeName], "readwrite")
      const store = transaction.objectStore(this.storeName)

      return new Promise((resolve, reject) => {
        const request = store.clear()
        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
          console.log("Audio cache cleared")
          resolve()
        }
      })
    } catch (error) {
      console.error("Error clearing audio cache:", error)
    }
  }
}

export const audioCache = new AudioCache()
