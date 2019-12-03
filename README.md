# fars
With this NPM package you can easily request info from [FARS](https://github.com/Teknologforeningen/fars), if the API for FARS is open.

## Usage
```ts
// Set the URL to the FARS API
setURL(url: string)

// Request bookings
bookings(dateFrom?: Date, dateTo?: Date, bookable?: string): Promise<IFarsBookings[]>
```

