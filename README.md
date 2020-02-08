# fars
With this NPM package you can easily request info from [FARS](https://github.com/Teknologforeningen/fars).

## Usage
```ts
// Set the URL and login to FARS
setFarsParams(url: string, username?: string, password?: string, loginPath: string = "/login/", apiPath: string = "/api/)

// Request bookings
bookings(dateFrom?: Date, dateTo?: Date, bookable?: string): Promise<IFarsSearchResult>

// Request bookings during a certain number of days into the future
bookingsFromNow(days: number, bookable?: string): Promise<IFarsSearchResult>

// Group an array of bookings by the bookable
groupByBookable(reservations: IFarsBooking[]): Promise<Map<string, IFarsBooking[]>>;

// Group an array of bookings by start date
groupByDate = (reservations: IFarsBooking[]): Promise<Map<string, IFarsBooking[]>>;
```

