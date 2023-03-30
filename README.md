# fars
With this NPM package you can easily request info from [FARS](https://github.com/Teknologforeningen/fars).

## Usage
```ts
// Create FARS manager
const fars = new FARSManager(url: string, username?: string, password?: string)

// Request bookables
fars.getBookables(): Promise<IFarsBookable>

// Request bookings
fars.bookings(queryParameters: { after?: Date, before?: Date, bookable?: string, limit?: number }): Promise<IFarsSearchResult>

// Request bookings during a certain number of days into the future
fars.bookingsFromNow(days: number, queryParameters): Promise<IFarsSearchResult>

// Request bookings during a certain number of days into the future
fars.bookingsFromToday(days: number, queryParameters): Promise<IFarsSearchResult>

// Group an array of bookings by the bookable
fars.groupByBookable(reservations: IFarsBooking[]): Map<string, IFarsBooking[]>;

// Group an array of bookings by start date
fars.groupByDate = (reservations: IFarsBooking[]): Map<string, IFarsBooking[]>;
```

